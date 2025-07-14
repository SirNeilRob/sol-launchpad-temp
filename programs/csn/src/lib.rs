use anchor_lang::prelude::*;

// 1. Use Token-2022 CPI interface (not classic anchor_spl::token!)
use anchor_spl::token_2022::{self, Token2022, MintTo, Burn};
// 2. Use token_interface for accounts (these work with both legacy SPL and Token-2022 mints)
use anchor_spl::token_interface::{Mint, TokenAccount};
use arrayref::array_ref;
use anchor_spl::token_2022::spl_token_2022::instruction::AuthorityType;

pub const CSN_MAX_SUPPLY: u64 = 100_000_000 * 1_000_000_000; // Assuming 9 decimals
pub const MINT_INTERVAL_SECONDS: i64 = 365 * 24 * 60 * 60; // 1 year

declare_id!("7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN"); // <--- Your deployed program ID

#[program]
pub mod csn {
    use super::*;

    /// Initialize state PDA, configure mint, and mint full supply to distribution account.
    pub fn initialize(ctx: Context<Initialize>, mint_authority: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.mint_authority = mint_authority;
        state.minted_this_year = 0;
        state.mint_start_timestamp = Clock::get()?.unix_timestamp;

        // --- Check mint config ---
        let mint = &ctx.accounts.mint;
        require_eq!(mint.decimals, 9, CustomError::InvalidMintDecimals);
        require_keys_eq!(mint.mint_authority.unwrap(), ctx.accounts.state.key(), CustomError::InvalidMintAuthority);
        require!(mint.freeze_authority.is_some(), CustomError::InvalidFreezeAuthority); // Will be revoked later

        // --- Mint full supply to distribution account ---
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: mint.to_account_info(),
                to: ctx.accounts.distribution_account.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
        );
        token_2022::mint_to(cpi_ctx.with_signer(&[&[b"state", &[ctx.bumps.state]]]), CSN_MAX_SUPPLY)?;
        Ok(())
    }

    /// Mint tokens to any TokenAccount (must be called by mint authority)
    pub fn mint_csn(ctx: Context<MintCSN>, amount: u64) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.mint_authority.key(),
            ctx.accounts.state.mint_authority,
            CustomError::Unauthorized
        );

        // --- Fixed supply cap enforcement ---
        let state = &mut ctx.accounts.state;
        let mint_info = ctx.accounts.mint.to_account_info();
        let mint_data = mint_info.try_borrow_data()?;
        // The supply is at offset 36 for SPL/Token-2022 mints (u64 LE)
        let current_supply = u64::from_le_bytes(*array_ref![mint_data, 36, 8]);
        require!(current_supply + amount <= CSN_MAX_SUPPLY, CustomError::SupplyCapExceeded);

        // --- Time-lock enforcement (example: 1 mint per year) ---
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        require!(now >= state.mint_start_timestamp + MINT_INTERVAL_SECONDS, CustomError::MintLocked);
        // Update state for next interval
        state.mint_start_timestamp = now;
        state.minted_this_year = 0; // Optionally track per-interval minted amount

        // --- TODO: Multi-signature/governance enforcement ---
        // This is a placeholder. Integrate with a multi-sig or governance program for production.

        // --- TODO: Freeze authority check ---
        // When creating the mint, ensure freeze authority is set to None.
        // Optionally, assert here that the mint's freeze authority is None.

        let cpi_ctx = ctx.accounts.mint_to_ctx();
        token_2022::mint_to(cpi_ctx, amount)?;
        Ok(())
    }

    /// Burn tokens from a TokenAccount (must be called by account owner)
    pub fn burn_csn(ctx: Context<BurnCSN>, amount: u64) -> Result<()> {
        // Optional: add checks as needed for burn auth
        let cpi_ctx = ctx.accounts.burn_ctx();
        token_2022::burn(cpi_ctx, amount)?;
        Ok(())
    }

    /// Distribute the full supply from the distribution account to all allocation destinations.
    pub fn distribute(ctx: Context<Distribute>) -> Result<()> {
        let allocations = [
            (ctx.accounts.team_account.to_account_info(), 27_500_000 * 1_000_000_000u64),
            (ctx.accounts.staking_account.to_account_info(), 40_000_000 * 1_000_000_000u64),
            (ctx.accounts.treasury_account.to_account_info(), 15_000_000 * 1_000_000_000u64),
            (ctx.accounts.ido_account.to_account_info(), 14_000_000 * 1_000_000_000u64),
            (ctx.accounts.lp_account.to_account_info(), 4_000_000 * 1_000_000_000u64),
        ];
        for (to, amount) in allocations.iter() {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::Transfer {
                    from: ctx.accounts.distribution_account.to_account_info(),
                    to: to.clone(),
                    authority: ctx.accounts.distribution_authority.to_account_info(),
                },
            );
            token_2022::transfer(cpi_ctx, *amount)?;
        }
        Ok(())
    }

    /// Finalize: revoke mint and freeze authorities for the mint.
    pub fn finalize(ctx: Context<Finalize>) -> Result<()> {
        // Revoke mint authority
        let cpi_ctx_mint = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_2022::SetAuthority {
                account_or_mint: ctx.accounts.mint.to_account_info(),
                current_authority: ctx.accounts.current_authority.to_account_info(),
            },
        );
        token_2022::set_authority(
            cpi_ctx_mint,
            AuthorityType::MintTokens,
            None,
        )?;

        // Revoke freeze authority
        let cpi_ctx_freeze = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_2022::SetAuthority {
                account_or_mint: ctx.accounts.mint.to_account_info(),
                current_authority: ctx.accounts.current_authority.to_account_info(),
            },
        );
        token_2022::set_authority(
            cpi_ctx_freeze,
            AuthorityType::FreezeAccount,
            None,
        )?;
        Ok(())
    }
}

#[account]
pub struct State {
    pub mint_authority: Pubkey,
    pub minted_this_year: u64,
    pub mint_start_timestamp: i64,
}

// ------------- ACCOUNTS -------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 8 + 8, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(mut)]
    pub distribution_account: Box<InterfaceAccount<'info, TokenAccount>>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

// TOKEN-2022 version. Use InterfaceAccount!
#[derive(Accounts)]
pub struct MintCSN<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub mint_authority: AccountInfo<'info>,
    #[account(mut)]
    pub to: Box<InterfaceAccount<'info, TokenAccount>>,
    pub token_program: Program<'info, Token2022>,
}

impl<'info> MintCSN<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.to.to_account_info(),
            authority: self.mint_authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct BurnCSN<'info> {
    #[account(mut)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(mut)]
    pub from: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token2022>,
}

impl<'info> BurnCSN<'info> {
    pub fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.mint.to_account_info(),
            from: self.from.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct Distribute<'info> {
    #[account(mut)]
    pub distribution_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub distribution_authority: AccountInfo<'info>,
    #[account(mut)]
    pub team_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub staking_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub treasury_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub ido_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub lp_account: Box<InterfaceAccount<'info, TokenAccount>>,
    pub token_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct Finalize<'info> {
    #[account(mut)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub current_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token2022>,
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized mint attempt")]
    Unauthorized,
    #[msg("Minting would exceed the maximum supply cap")]
    SupplyCapExceeded,
    #[msg("Minting is currently time-locked")]
    MintLocked,
    #[msg("Mint decimals must be 9")]
    InvalidMintDecimals,
    #[msg("Mint authority must be state PDA")]
    InvalidMintAuthority,
    #[msg("Freeze authority must be set (will be revoked later)")]
    InvalidFreezeAuthority,
}