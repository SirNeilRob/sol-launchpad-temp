const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

const DECIMALS = 9;
const TOKEN_2022_PROGRAM_ID = new web3.PublicKey("Token22J5B9rZUvxsYvX5aP4JNaBqUFqwSxgTt3V9gRYj");
const KEYPAIR_PATH = "/home/gc/.config/solana/id.json";
const NETWORK = "https://api.devnet.solana.com";

(async () => {
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH)));
  const payer = web3.Keypair.fromSecretKey(secret);
  const connection = new web3.Connection(NETWORK, "confirmed");

  // Step 1: Create new mint keypair
  const mintKeypair = web3.Keypair.generate();
  const mintRent = await splToken.getMinimumBalanceForRentExemptMint(connection, TOKEN_2022_PROGRAM_ID);

  // Step 2: Create account + initialize mint (authorities = payer.publicKey)
  const tx = new web3.Transaction().add(
    web3.SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: splToken.MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    splToken.createInitializeMintInstruction(
      mintKeypair.publicKey,
      DECIMALS,
      payer.publicKey,
      payer.publicKey,
      TOKEN_2022_PROGRAM_ID
    )
  );
  const sig = await web3.sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
  console.log(`✅ Mint created: ${mintKeypair.publicKey.toBase58()} (tx: ${sig})`);
})();
