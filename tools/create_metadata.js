const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

// ---- CONFIG ----
const TOKEN_2022_PROGRAM_ID = new web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const NETWORK = "https://api.devnet.solana.com";
const KEYPAIR_PATH = "/home/gc/.config/solana/id.json";

// CSN Token Metadata
const CSN_METADATA = {
  name: "CSN Token",
  symbol: "CSN",
  uri: "https://raw.githubusercontent.com/your-repo/csn-token/main/metadata.json",
  decimals: 9,
  description: "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution.",
  image: "https://raw.githubusercontent.com/your-repo/csn-token/main/logo.png",
  external_url: "https://csn-token.com",
  attributes: [
    { trait_type: "Supply Cap", value: "100,000,000" },
    { trait_type: "Decimals", value: "9" },
    { trait_type: "Standard", value: "Token-2022" },
    { trait_type: "Network", value: "Solana" }
  ]
};

// Token-2022 Metadata Extension Instructions
const METADATA_EXTENSION_INSTRUCTIONS = {
  INITIALIZE_METADATA_POINTER: 0,
  INITIALIZE_METADATA: 1,
  UPDATE_METADATA: 2,
  UPDATE_METADATA_POINTER: 3,
};

async function createMetadataJSON() {
  const metadataPath = "./metadata.json";
  fs.writeFileSync(metadataPath, JSON.stringify(CSN_METADATA, null, 2));
  console.log("✅ Metadata JSON created:", metadataPath);
  return metadataPath;
}

async function createMetadataPointer(mintAddress, metadataAccount, payer, connection) {
  // Create metadata pointer instruction
  const instruction = new web3.TransactionInstruction({
    programId: TOKEN_2022_PROGRAM_ID,
    keys: [
      { pubkey: mintAddress, isSigner: false, isWritable: true },
      { pubkey: metadataAccount, isSigner: false, isWritable: false },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
    ],
    data: Buffer.from([
      METADATA_EXTENSION_INSTRUCTIONS.INITIALIZE_METADATA_POINTER,
      ...new Uint8Array(32), // metadata pointer (32 bytes)
    ]),
  });

  return instruction;
}

async function createMetadataAccount(mintAddress, payer, connection) {
  // Create a metadata account (this would be a separate account that stores the metadata)
  const metadataKeypair = web3.Keypair.generate();
  const metadataRent = await connection.getMinimumBalanceForRentExemption(1024); // Adjust size as needed

  const createAccountIx = web3.SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: metadataKeypair.publicKey,
    lamports: metadataRent,
    space: 1024,
    programId: TOKEN_2022_PROGRAM_ID,
  });

  return { metadataKeypair, createAccountIx };
}

async function uploadMetadataToIPFS() {
  // This is a placeholder - in production you'd upload to IPFS or similar
  console.log("📤 Upload metadata to IPFS or similar service");
  console.log("For now, using placeholder URI:", CSN_METADATA.uri);
  return CSN_METADATA.uri;
}

async function createTokenWithMetadata() {
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

    // 3. Create metadata JSON
    await createMetadataJSON();
    
    // 4. Upload metadata (placeholder)
    const metadataUri = await uploadMetadataToIPFS();

    // 5. Create Token-2022 mint with metadata extension
    const mintKeypair = web3.Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(splToken.MINT_SIZE);

    console.log("🏗️ Creating Token-2022 mint with metadata...");

    // Create mint account
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
        CSN_METADATA.decimals,
        payer.publicKey,
        payer.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await web3.sendAndConfirmTransaction(connection, createMintTx, [payer, mintKeypair]);
    console.log("✅ Token-2022 mint created:", mintKeypair.publicKey.toBase58());

    // 6. Create metadata account
    const { metadataKeypair, createAccountIx } = await createMetadataAccount(
      mintKeypair.publicKey,
      payer,
      connection
    );

    // 7. Initialize metadata pointer
    const metadataPointerIx = await createMetadataPointer(
      mintKeypair.publicKey,
      metadataKeypair.publicKey,
      payer,
      connection
    );

    const metadataTx = new web3.Transaction().add(
      createAccountIx,
      metadataPointerIx
    );

    await web3.sendAndConfirmTransaction(connection, metadataTx, [payer, metadataKeypair]);
    console.log("✅ Metadata account created:", metadataKeypair.publicKey.toBase58());

    // 8. Create vault ATA
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

    // 9. Output results
    console.log("\n🎉 CSN Token with Metadata Created Successfully!");
    console.log("================================================");
    console.log("Mint Address:", mintKeypair.publicKey.toBase58());
    console.log("Metadata Account:", metadataKeypair.publicKey.toBase58());
    console.log("Vault ATA:", ata.address.toBase58());
    console.log("Metadata URI:", metadataUri);
    console.log("Token Name:", CSN_METADATA.name);
    console.log("Token Symbol:", CSN_METADATA.symbol);
    console.log("Decimals:", CSN_METADATA.decimals);
    console.log("================================================");

    // 10. Save addresses to file
    const addresses = {
      mint: mintKeypair.publicKey.toBase58(),
      metadata: metadataKeypair.publicKey.toBase58(),
      vault: ata.address.toBase58(),
      metadataUri: metadataUri,
      network: NETWORK,
      programId: TOKEN_2022_PROGRAM_ID.toBase58()
    };

    fs.writeFileSync("./token-addresses.json", JSON.stringify(addresses, null, 2));
    console.log("✅ Addresses saved to token-addresses.json");

  } catch (error) {
    console.error("❌ Error creating token with metadata:", error);
    throw error;
  }
}

// Alternative: Simple off-chain metadata approach
async function createSimpleMetadata() {
  console.log("\n📝 Creating simple off-chain metadata...");
  
  const metadata = {
    name: CSN_METADATA.name,
    symbol: CSN_METADATA.symbol,
    description: CSN_METADATA.description,
    image: CSN_METADATA.image,
    external_url: CSN_METADATA.external_url,
    attributes: CSN_METADATA.attributes,
    properties: {
      files: [
        {
          type: "image/png",
          uri: CSN_METADATA.image
        }
      ],
      category: "image",
      maxSupply: 100000000,
      decimals: 9
    }
  };

  fs.writeFileSync("./csn-metadata.json", JSON.stringify(metadata, null, 2));
  console.log("✅ Simple metadata created: csn-metadata.json");
  
  return metadata;
}

// Main execution
if (require.main === module) {
  console.log("🚀 CSN Token Metadata Creator");
  console.log("=============================");
  
  // Create both types of metadata
  createSimpleMetadata()
    .then(() => createTokenWithMetadata())
    .then(() => {
      console.log("\n✅ All metadata creation completed!");
      console.log("\n📋 Next steps:");
      console.log("1. Upload csn-metadata.json to IPFS or your hosting service");
      console.log("2. Update the URI in your smart contract or metadata account");
      console.log("3. Deploy your CSN token contract");
      console.log("4. Test the metadata integration");
    })
    .catch(console.error);
}

module.exports = {
  createTokenWithMetadata,
  createSimpleMetadata,
  CSN_METADATA
}; 