use anchor_lang::prelude::*;

// 1. Use Token-2022 CPI interface (not classic anchor_spl::token!)
use anchor_spl::token_2022::{self, Token2022, MintTo, Burn};
// 2. Use token_interface for accounts (these work with both legacy SPL and Token-2022 mints)
use anchor_spl::token_interface::{Mint, TokenAccount};
use arrayref::array_ref;

pub const CSN_MAX_SUPPLY: u64 = 100_000_000 * 1_000_000_000; // Assuming 9 decimals
pub const MINT_INTERVAL_SECONDS: i64 = 365 * 24 * 60 * 60; // 1 year

declare_id!("7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN"); // <--- Your deployed program ID

#[program]
pub mod csn {
    use super::*;

    /// Initialize state PDA. Sets mint authority, resets counters.
    pub fn initialize(ctx: Context<Initialize>, mint_authority: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.mint_authority = mint_authority;
        state.minted_this_year = 0;
        state.mint_start_timestamp = Clock::get()?.unix_timestamp;
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

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized mint attempt")]
    Unauthorized,
    #[msg("Minting would exceed the maximum supply cap")]
    SupplyCapExceeded,
    #[msg("Minting is currently time-locked")]
    MintLocked,
}