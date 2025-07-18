const fs = require("fs");
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
