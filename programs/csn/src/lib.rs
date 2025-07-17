use anchor_lang::prelude::*;

// 1. Use Token-2022 CPI interface (not classic anchor_spl::token!)
use anchor_spl::token_2022::{self, Token2022, MintTo, Burn};
// 2. Use token_interface for accounts (these work with both legacy SPL and Token-2022 mints)
use anchor_spl::token::{Mint, TokenAccount};
use arrayref::array_ref;
use anchor_spl::token_2022::spl_token_2022::instruction::AuthorityType;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::system_instruction;

pub const CSN_MAX_SUPPLY: u64 = 100_000_000 * 1_000_000_000; // Assuming 9 decimals
pub const MINT_INTERVAL_SECONDS: i64 = 365 * 24 * 60 * 60; // 1 year

declare_id!("7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN"); // <--- Your deployed program ID

#[program]
pub mod csn {
    use super::*;

    /// Initialize state PDA, configure mint, and mint full supply to distribution account.
    pub fn initialize(ctx: Context<Initialize>, mint_authority: Pubkey, unique_seed: u64) -> Result<()> {
        // --- State PDA is created by Anchor #[account(init)] ---
        let state = &mut ctx.accounts.state;
        state.mint_authority = mint_authority;
        state.minted_this_year = 0;
        state.mint_start_timestamp = Clock::get()?.unix_timestamp;

        // --- Create the mint using CPI ---
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_2022::InitializeMint {
                mint: ctx.accounts.mint.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );
        token_2022::initialize_mint(cpi_ctx, 9, &ctx.accounts.state.key(), Some(&ctx.accounts.state.key()))?;

        let vault_space = 165;
        let rent = Rent::get()?;
        let lamports = rent.minimum_balance(vault_space);
        let seed = unique_seed.to_le_bytes();

        // --- Create and initialize each vault PDA as a Token-2022 account ---
        // Distribution
        {
            let seeds = [b"distribution_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.distribution_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"distribution_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.distribution_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // Team
        {
            let seeds = [b"team_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.team_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"team_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.team_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // Staking
        {
            let seeds = [b"staking_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.staking_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"staking_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.staking_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // Treasury
        {
            let seeds = [b"treasury_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.treasury_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"treasury_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.treasury_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // IDO
        {
            let seeds = [b"ido_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.ido_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"ido_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.ido_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // LP
        {
            let seeds = [b"lp_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.lp_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"lp_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.lp_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // Marketing
        {
            let seeds = [b"marketing_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.marketing_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"marketing_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.marketing_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }
        // Airdrop
        {
            let seeds = [b"airdrop_vault" as &[u8], seed.as_ref()];
            let (pda, bump) = Pubkey::find_program_address(&seeds, ctx.program_id);
            invoke_signed(
                &system_instruction::create_account(
                    ctx.accounts.payer.key,
                    &pda,
                    lamports,
                    vault_space as u64,
                    &ctx.accounts.token_program.key(),
                ),
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.airdrop_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"airdrop_vault", seed.as_ref(), &[bump]]],
            )?;
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::InitializeAccount3 {
                    account: ctx.accounts.airdrop_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
            );
            token_2022::initialize_account3(cpi_ctx)?;
        }

        // --- Mint full supply to distribution account ---
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.distribution_account.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
        );
        token_2022::mint_to(cpi_ctx.with_signer(&[&[b"state", &unique_seed.to_le_bytes(), &[ctx.bumps.state]]]), CSN_MAX_SUPPLY)?;
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

    /// Distribute the launch circulating supply from the distribution account to all allocation destinations per whitepaper.
    pub fn distribute(ctx: Context<Distribute>, unique_seed: u64) -> Result<()> {
        // Whitepaper launch allocations (all amounts in base units, 9 decimals)
        let allocations = [
            (ctx.accounts.staking_account.to_account_info(), 3_000_000 * 1_000_000_000u64, "Staking"),
            (ctx.accounts.treasury_account.to_account_info(), 2_000_000 * 1_000_000_000u64, "Treasury"),
            (ctx.accounts.ido_account.to_account_info(), 14_000_000 * 1_000_000_000u64, "IDO"),
            (ctx.accounts.marketing_account.to_account_info(), 7_000_000 * 1_000_000_000u64, "Marketing"),
            (ctx.accounts.airdrop_account.to_account_info(), 2_000_000 * 1_000_000_000u64, "Airdrop"),
            // Team and LP vaults are not funded at launch (all locked or reserved)
        ];

        msg!("=== CSN Token Launch Distribution ===");
        msg!("Distribution Account: {}", ctx.accounts.distribution_account.key());

        for (to, amount, vault_name) in allocations.iter() {
            msg!("Transferring {} tokens to {} vault: {}", amount, vault_name, to.key());

            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_2022::Transfer {
                    from: ctx.accounts.distribution_account.to_account_info(),
                    to: to.clone(),
                    authority: ctx.accounts.distribution_authority.to_account_info(),
                },
            );
            token_2022::transfer(cpi_ctx, *amount)?;

            msg!("✓ {} vault funded: {} tokens -> {}", vault_name, amount, to.key());
        }

        msg!("=== Launch Distribution Complete ===");
        msg!("All launch vaults funded successfully!");
        Ok(())
    }

    /// Finalize: revoke mint and freeze authorities for the mint.
    pub fn finalize(ctx: Context<Finalize>, unique_seed: u64) -> Result<()> {
        // Revoke mint authority
        let cpi_ctx_mint = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_2022::SetAuthority {
                account_or_mint: ctx.accounts.mint.to_account_info(),
                current_authority: ctx.accounts.state.to_account_info(),
            },
        );
        token_2022::set_authority(
            cpi_ctx_mint.with_signer(&[&[b"state", &unique_seed.to_le_bytes(), &[ctx.bumps.state]]]),
            AuthorityType::MintTokens,
            None,
        )?;

        // Revoke freeze authority
        let cpi_ctx_freeze = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_2022::SetAuthority {
                account_or_mint: ctx.accounts.mint.to_account_info(),
                current_authority: ctx.accounts.state.to_account_info(),
            },
        );
        token_2022::set_authority(
            cpi_ctx_freeze.with_signer(&[&[b"state", &unique_seed.to_le_bytes(), &[ctx.bumps.state]]]),
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
#[instruction(mint_authority: Pubkey, unique_seed: u64)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 8 + 8, seeds = [b"state", unique_seed.to_le_bytes().as_ref()], bump)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    /// CHECK: Mint account will be created via CPI to Token-2022 program
    pub mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Distribution vault will be created via CPI to Token-2022 program
    pub distribution_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Team vault will be created via CPI to Token-2022 program
    pub team_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Staking vault will be created via CPI to Token-2022 program
    pub staking_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Treasury vault will be created via CPI to Token-2022 program
    pub treasury_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: IDO vault will be created via CPI to Token-2022 program
    pub ido_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: LP vault will be created via CPI to Token-2022 program
    pub lp_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Marketing vault will be created via CPI to Token-2022 program
    pub marketing_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Airdrop vault will be created via CPI to Token-2022 program
    pub airdrop_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintCSN<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub mint_authority: AccountInfo<'info>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
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
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
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
#[instruction(unique_seed: u64)]
pub struct Distribute<'info> {
    #[account(mut, seeds = [b"distribution_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub distribution_account: UncheckedAccount<'info>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub distribution_authority: AccountInfo<'info>,
    #[account(mut, seeds = [b"team_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub team_account: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"staking_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub staking_account: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"treasury_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub treasury_account: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"ido_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub ido_account: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"lp_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub lp_account: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"marketing_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub marketing_account: UncheckedAccount<'info>,
    #[account(mut, seeds = [b"airdrop_vault", unique_seed.to_le_bytes().as_ref()], bump)]
    /// CHECK: Token-2022 account, checked in handler
    pub airdrop_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Mint account is checked in handler
    pub mint: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
#[instruction(unique_seed: u64)]
pub struct Finalize<'info> {
    #[account(seeds = [b"state", unique_seed.to_le_bytes().as_ref()], bump)]
    pub state: Account<'info, State>,
    #[account(mut)]
    /// CHECK: Mint account is checked in handler
    pub mint: UncheckedAccount<'info>,
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