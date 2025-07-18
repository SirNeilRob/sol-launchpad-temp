// Add this to your CSN program (lib.rs)

use anchor_lang::prelude::*;

// Metadata constants for CSN token
pub const CSN_TOKEN_NAME: &str = "CSN Token";
pub const CSN_TOKEN_SYMBOL: &str = "CSN";
pub const CSN_TOKEN_DECIMALS: u8 = 9;
pub const CSN_TOKEN_DESCRIPTION: &str = "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution.";
pub const CSN_TOKEN_IMAGE: &str = "https://raw.githubusercontent.com/your-repo/csn-token/main/logo.png";
pub const CSN_TOKEN_EXTERNAL_URL: &str = "https://csn-token.com";

// Metadata structure for your token
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image: String,
    pub external_url: String,
    pub decimals: u8,
    pub max_supply: u64,
}

impl Default for TokenMetadata {
    fn default() -> Self {
        Self {
            name: CSN_TOKEN_NAME.to_string(),
            symbol: CSN_TOKEN_SYMBOL.to_string(),
            description: CSN_TOKEN_DESCRIPTION.to_string(),
            image: CSN_TOKEN_IMAGE.to_string(),
            external_url: CSN_TOKEN_EXTERNAL_URL.to_string(),
            decimals: CSN_TOKEN_DECIMALS,
            max_supply: CSN_MAX_SUPPLY,
        }
    }
}

// Add this to your State struct
#[account]
pub struct State {
    pub mint_authority: Pubkey,
    pub minted_this_year: u64,
    pub mint_start_timestamp: i64,
    pub metadata: TokenMetadata, // Add this field
}

// Update your initialize function to include metadata
pub fn initialize(ctx: Context<Initialize>, mint_authority: Pubkey, unique_seed: u64) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.mint_authority = mint_authority;
    state.minted_this_year = 0;
    state.mint_start_timestamp = Clock::get()?.unix_timestamp;
    state.metadata = TokenMetadata::default(); // Initialize with default metadata

    // ... rest of your existing initialize code ...
    
    msg!("CSN Token initialized with metadata:");
    msg!("Name: {}", state.metadata.name);
    msg!("Symbol: {}", state.metadata.symbol);
    msg!("Decimals: {}", state.metadata.decimals);
    msg!("Max Supply: {}", state.metadata.max_supply);
    
    Ok(())
}

// Add a function to update metadata (optional)
pub fn update_metadata(ctx: Context<UpdateMetadata>, new_metadata: TokenMetadata) -> Result<()> {
    require_keys_eq!(
        ctx.accounts.authority.key(),
        ctx.accounts.state.mint_authority,
        CustomError::Unauthorized
    );
    
    let state = &mut ctx.accounts.state;
    state.metadata = new_metadata;
    
    msg!("Metadata updated successfully");
    Ok(())
}

// Add this to your accounts structs
#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub authority: AccountInfo<'info>,
}
