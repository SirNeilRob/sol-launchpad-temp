const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

// ---- CONFIG ----
const TOKEN_2022_PROGRAM_ID = new web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const NETWORK = "https://api.devnet.solana.com";
const KEYPAIR_PATH = "/home/gc/.config/solana/id.json";

// CSN Token Metadata for DAS
const CSN_DAS_METADATA = {
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
    decimals: 9,
    creators: [
      {
        address: "YOUR_CREATOR_ADDRESS_HERE",
        share: 100,
        verified: true
      }
    ]
  }
};

async function createDASMetadataJSON() {
  const metadataPath = "./csn-das-metadata.json";
  fs.writeFileSync(metadataPath, JSON.stringify(CSN_DAS_METADATA, null, 2));
  console.log("✅ DAS Metadata JSON created:", metadataPath);
  return metadataPath;
}

async function createTokenWithDASMetadata() {
  try {
    // 1. Load wallet
    const secret = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH)));
    const payer = web3.Keypair.fromSecretKey(secret);
    const connection = new web3.Connection(NETWORK, "confirmed");

    console.log("🔑 Wallet loaded:", payer.publicKey.toBase58());

    // 2. Airdrop if needed (devnet only)
    const balance = await connection.getBalance(payer.publicKey);
    if (balance < 1e8) {
      const sig = await connection.requestAirdrop(payer.publicKey, 2e9);
      await connection.confirmTransaction(sig, "confirmed");
      console.log("✅ Airdropped SOL for fees");
    }

    // 3. Create DAS metadata JSON
    await createDASMetadataJSON();

    // 4. Create Token-2022 mint
    const mintKeypair = web3.Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(splToken.MINT_SIZE);

    console.log("🏗️ Creating Token-2022 mint...");

    const createMintTx = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: splToken.MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      splToken.createInitializeMintInstruction(
        mintKeypair.publicKey,
        CSN_DAS_METADATA.properties.decimals,
        payer.publicKey,
        payer.publicKey,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await web3.sendAndConfirmTransaction(connection, createMintTx, [payer, mintKeypair]);
    console.log("✅ Token-2022 mint created:", mintKeypair.publicKey.toBase58());

    // 5. Create vault ATA
    const ata = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintKeypair.publicKey,
      payer.publicKey,
      false,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    console.log("✅ Vault ATA created:", ata.address.toBase58());

    // 6. Output results
    console.log("\n🎉 CSN Token Created Successfully!");
    console.log("=================================");
    console.log("Mint Address:", mintKeypair.publicKey.toBase58());
    console.log("Vault ATA:", ata.address.toBase58());
    console.log("Token Name:", CSN_DAS_METADATA.name);
    console.log("Token Symbol:", CSN_DAS_METADATA.symbol);
    console.log("Decimals:", CSN_DAS_METADATA.properties.decimals);
    console.log("Max Supply:", CSN_DAS_METADATA.properties.maxSupply);
    console.log("=================================");

    // 7. Save addresses to file
    const addresses = {
      mint: mintKeypair.publicKey.toBase58(),
      vault: ata.address.toBase58(),
      metadataFile: "./csn-das-metadata.json",
      network: NETWORK,
      programId: TOKEN_2022_PROGRAM_ID.toBase58(),
      metadata: CSN_DAS_METADATA
    };

    fs.writeFileSync("./csn-token-addresses.json", JSON.stringify(addresses, null, 2));
    console.log("✅ Addresses saved to csn-token-addresses.json");

    return addresses;

  } catch (error) {
    console.error("❌ Error creating token:", error);
    throw error;
  }
}

// Function to create a simple metadata URI for your smart contract
async function createMetadataURI() {
  console.log("\n📝 Creating metadata URI for smart contract integration...");
  
  // In production, you would upload this to IPFS or similar
  const metadataUri = "https://raw.githubusercontent.com/your-repo/csn-token/main/csn-das-metadata.json";
  
  const metadataConfig = {
    name: CSN_DAS_METADATA.name,
    symbol: CSN_DAS_METADATA.symbol,
    uri: metadataUri,
    decimals: CSN_DAS_METADATA.properties.decimals
  };

  fs.writeFileSync("./metadata-config.json", JSON.stringify(metadataConfig, null, 2));
  console.log("✅ Metadata config created: metadata-config.json");
  console.log("📤 Metadata URI:", metadataUri);
  
  return metadataConfig;
}

// Function to integrate with your existing CSN smart contract
async function integrateWithCSNContract() {
  console.log("\n🔗 Integrating metadata with CSN smart contract...");
  
  // This would be used in your Anchor program
  const integrationCode = `
// Add this to your CSN program's initialize function
// After creating the mint, you can set metadata

// Example metadata structure for your program:
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}

// In your initialize function, you could add:
// let metadata = TokenMetadata {
//     name: "CSN Token".to_string(),
//     symbol: "CSN".to_string(),
//     uri: "https://raw.githubusercontent.com/your-repo/csn-token/main/csn-das-metadata.json".to_string(),
//     decimals: 9,
// };
`;

  fs.writeFileSync("./integration-example.rs", integrationCode);
  console.log("✅ Integration example created: integration-example.rs");
}

// Main execution
if (require.main === module) {
  console.log("🚀 CSN Token DAS Metadata Creator");
  console.log("==================================");
  
  createTokenWithDASMetadata()
    .then(() => createMetadataURI())
    .then(() => integrateWithCSNContract())
    .then(() => {
      console.log("\n✅ All metadata creation completed!");
      console.log("\n📋 Next steps:");
      console.log("1. Upload csn-das-metadata.json to IPFS or your hosting service");
      console.log("2. Update the URI in metadata-config.json");
      console.log("3. Use the metadata config in your CSN smart contract");
      console.log("4. Deploy your CSN token contract");
      console.log("5. Test the metadata integration");
      console.log("\n🔗 For DAS integration, use Metaplex's DAS SDK:");
      console.log("   npm install @metaplex-foundation/digital-asset-standard");
    })
    .catch(console.error);
}

module.exports = {
  createTokenWithDASMetadata,
  createDASMetadataJSON,
  createMetadataURI,
  integrateWithCSNContract,
  CSN_DAS_METADATA
}; 