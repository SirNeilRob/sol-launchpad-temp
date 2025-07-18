const fs = require("fs");

console.log("🔧 CSN Token Metadata Integration Guide");
console.log("=======================================");

// Read the current program
const currentProgram = fs.readFileSync("./programs/csn/src/lib.rs", "utf8");

// Check if metadata is already integrated
if (currentProgram.includes("TokenMetadata")) {
  console.log("✅ Metadata already integrated in the program!");
} else {
  console.log("📝 Metadata integration needed. Here are the changes:");
  
  // Show the changes needed
  console.log("\n1. Add metadata constants at the top of lib.rs:");
  console.log(`
// Add these constants after the existing constants
pub const CSN_TOKEN_NAME: &str = "CSN Token";
pub const CSN_TOKEN_SYMBOL: &str = "CSN";
pub const CSN_TOKEN_DECIMALS: u8 = 9;
pub const CSN_TOKEN_DESCRIPTION: &str = "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution.";
pub const CSN_TOKEN_IMAGE: &str = "https://raw.githubusercontent.com/your-repo/csn-token/main/logo.png";
pub const CSN_TOKEN_EXTERNAL_URL: &str = "https://csn-token.com";
`);

  console.log("\n2. Add TokenMetadata struct before the State struct:");
  console.log(`
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
`);

  console.log("\n3. Update the State struct to include metadata:");
  console.log(`
#[account]
pub struct State {
    pub mint_authority: Pubkey,
    pub minted_this_year: u64,
    pub mint_start_timestamp: i64,
    pub metadata: TokenMetadata, // Add this line
}
`);

  console.log("\n4. Update the Initialize accounts struct space calculation:");
  console.log(`
// Change this line in the Initialize struct:
#[account(init, payer = payer, space = 8 + 32 + 8 + 8 + 200, seeds = [b"state", unique_seed.to_le_bytes().as_ref()], bump)]
// The +200 is for the metadata field (adjust size as needed)
`);

  console.log("\n5. Update the initialize function to set metadata:");
  console.log(`
// In the initialize function, add this line after setting other fields:
state.metadata = TokenMetadata::default();
`);

  console.log("\n6. Add metadata update function (optional):");
  console.log(`
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

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(signer)]
    /// CHECK: Only used as authority check
    pub authority: AccountInfo<'info>,
}
`);
}

// Show the metadata file
console.log("\n📄 Your metadata file:");
const metadata = JSON.parse(fs.readFileSync("./metadata/csn-token-metadata.json", "utf8"));
console.log(JSON.stringify(metadata, null, 2));

// Show next steps
console.log("\n📋 Next Steps:");
console.log("1. Apply the changes above to your lib.rs file");
console.log("2. Update the space calculation in the State account");
console.log("3. Build and test the program: anchor build");
console.log("4. Run tests: anchor test");
console.log("5. Deploy the updated program");

// Create a backup of the current program
const backupPath = `./programs/csn/src/lib.rs.backup.${Date.now()}`;
fs.writeFileSync(backupPath, currentProgram);
console.log(`\n💾 Backup created: ${backupPath}`);

console.log("\n✅ Integration guide completed!"); 