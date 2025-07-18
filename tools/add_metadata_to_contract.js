const fs = require("fs");
const web3 = require("@solana/web3.js");

// CSN Token Metadata Configuration
const CSN_METADATA = {
  name: "CSN Token",
  symbol: "CSN",
  description: "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution.",
  image: "https://raw.githubusercontent.com/your-repo/csn-token/main/logo.png",
  external_url: "https://csn-token.com",
  attributes: [
    { trait_type: "Supply Cap", value: "100,000,000" },
    { trait_type: "Decimals", value: "9" },
    { trait_type: "Standard", value: "Token-2022" },
    { trait_type: "Network", value: "Solana" },
    { trait_type: "Minting", value: "Time-locked" },
    { trait_type: "Authority", value: "PDA-controlled" }
  ],
  properties: {
    files: [
      {
        type: "image/png",
        uri: "https://raw.githubusercontent.com/your-repo/csn-token/main/logo.png"
      }
    ],
    category: "image",
    maxSupply: 100000000,
    decimals: 9
  }
};

// Function to create metadata JSON file
function createMetadataFile() {
  const metadataPath = "./metadata/csn-token-metadata.json";
  
  // Create metadata directory if it doesn't exist
  if (!fs.existsSync("./metadata")) {
    fs.mkdirSync("./metadata");
  }
  
  fs.writeFileSync(metadataPath, JSON.stringify(CSN_METADATA, null, 2));
  console.log("✅ Metadata file created:", metadataPath);
  return metadataPath;
}

// Function to generate Rust code for metadata integration
function generateMetadataRustCode() {
  const rustCode = `// Add this to your CSN program (lib.rs)

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
`;

  fs.writeFileSync("./metadata/metadata-integration.rs", rustCode);
  console.log("✅ Rust integration code created: metadata/metadata-integration.rs");
  return rustCode;
}

// Function to create a metadata update script
function createMetadataUpdateScript() {
  const updateScript = `const fs = require("fs");
const web3 = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");

// Load your program
const program = anchor.workspace.csn;

async function updateTokenMetadata() {
  const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const payer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync('csn_keys', 'utf8')))
  );
  
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), {});
  anchor.setProvider(provider);
  
  // Load metadata from file
  const metadata = JSON.parse(fs.readFileSync('./metadata/csn-token-metadata.json', 'utf8'));
  
  // Create TokenMetadata struct
  const tokenMetadata = {
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    image: metadata.image,
    externalUrl: metadata.external_url,
    decimals: metadata.properties.decimals,
    maxSupply: new anchor.BN(metadata.properties.maxSupply * Math.pow(10, metadata.properties.decimals))
  };
  
  // Update metadata in your program
  const tx = await program.methods.updateMetadata(tokenMetadata).accounts({
    state: statePda, // Your state PDA
    authority: payer.publicKey,
  }).signers([payer]).rpc();
  
  console.log("✅ Metadata updated:", tx);
}

// Run the update
updateTokenMetadata().catch(console.error);
`;

  fs.writeFileSync("./tools/update_metadata.js", updateScript);
  console.log("✅ Metadata update script created: tools/update_metadata.js");
}

// Function to create a metadata viewer
function createMetadataViewer() {
  const viewerScript = `const fs = require("fs");
const web3 = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");

async function viewTokenMetadata() {
  const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const payer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync('csn_keys', 'utf8')))
  );
  
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), {});
  anchor.setProvider(provider);
  const program = anchor.workspace.csn;
  
  // Load your state PDA
  const statePda = /* your state PDA */;
  
  try {
    const state = await program.account.state.fetch(statePda);
    
    console.log("🔍 CSN Token Metadata:");
    console.log("=======================");
    console.log("Name:", state.metadata.name);
    console.log("Symbol:", state.metadata.symbol);
    console.log("Description:", state.metadata.description);
    console.log("Image:", state.metadata.image);
    console.log("External URL:", state.metadata.externalUrl);
    console.log("Decimals:", state.metadata.decimals);
    console.log("Max Supply:", state.metadata.maxSupply.toString());
    console.log("=======================");
    
  } catch (error) {
    console.error("❌ Error fetching metadata:", error);
  }
}

viewTokenMetadata().catch(console.error);
`;

  fs.writeFileSync("./tools/view_metadata.js", viewerScript);
  console.log("✅ Metadata viewer created: tools/view_metadata.js");
}

// Function to create documentation
function createMetadataDocumentation() {
  const documentation = `# CSN Token Metadata Integration

## Overview
This document explains how metadata is integrated with the CSN token smart contract.

## Metadata Structure
The CSN token uses a custom metadata structure that includes:
- Token name and symbol
- Description and external URL
- Image URI
- Token properties (decimals, max supply)
- Custom attributes

## Files Created
1. \`metadata/csn-token-metadata.json\` - The metadata JSON file
2. \`metadata/metadata-integration.rs\` - Rust code for integration
3. \`tools/update_metadata.js\` - Script to update metadata
4. \`tools/view_metadata.js\` - Script to view current metadata

## Integration Steps
1. Add the metadata fields to your State struct
2. Update your initialize function to set default metadata
3. Optionally add an update_metadata function
4. Deploy the updated contract
5. Use the tools to manage metadata

## Metadata Standards
- Uses Token-2022 standard
- Compatible with Metaplex Digital Asset Standard (DAS)
- Supports off-chain metadata via JSON files
- Can be extended with additional attributes

## Security Considerations
- Only the mint authority can update metadata
- Metadata is stored on-chain for critical information
- Off-chain metadata can be updated independently
- Consider using IPFS for decentralized metadata storage

## Usage Examples
\`\`\`bash
# Create metadata files
node tools/add_metadata_to_contract.js

# Update metadata
node tools/update_metadata.js

# View current metadata
node tools/view_metadata.js
\`\`\`

## Next Steps
1. Upload metadata JSON to IPFS or your hosting service
2. Update the image URI to point to your actual logo
3. Customize the metadata attributes as needed
4. Test the metadata integration
5. Deploy to mainnet when ready
`;

  fs.writeFileSync("./metadata/README.md", documentation);
  console.log("✅ Documentation created: metadata/README.md");
}

// Main execution
function main() {
  console.log("🔧 Adding Metadata Support to CSN Contract");
  console.log("==========================================");
  
  try {
    createMetadataFile();
    generateMetadataRustCode();
    createMetadataUpdateScript();
    createMetadataViewer();
    createMetadataDocumentation();
    
    console.log("\n✅ All metadata files created successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Review metadata/csn-token-metadata.json");
    console.log("2. Integrate metadata/metadata-integration.rs into your program");
    console.log("3. Update your State struct to include metadata field");
    console.log("4. Test the metadata integration");
    console.log("5. Deploy the updated contract");
    
  } catch (error) {
    console.error("❌ Error creating metadata files:", error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createMetadataFile,
  generateMetadataRustCode,
  createMetadataUpdateScript,
  createMetadataViewer,
  createMetadataDocumentation,
  CSN_METADATA
}; 