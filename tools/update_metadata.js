const fs = require("fs");
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
