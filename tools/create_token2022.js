const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

// ---- CONFIG ----
const SUPPLY = 100_000_000;         // Adjust for your supply
const DECIMALS = 9;                 // SPL standard
const MINT_AUTHORITY = null;        // null = you, or set to a multisig pubkey
const FREEZE_AUTHORITY = null;      // null = no freeze authority
const TOKEN_2022_PROGRAM_ID = new web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const NETWORK = "https://api.devnet.solana.com";
const KEYPAIR_PATH = "/home/gc/.config/solana/id.json"; // Change to your wallet path

(async () => {
  // 1. Load wallet
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH)));
  const payer = web3.Keypair.fromSecretKey(secret);
  const connection = new web3.Connection(NETWORK, "confirmed");

  // 2. Airdrop if needed (devnet only)
  const balance = await connection.getBalance(payer.publicKey);
  if (balance < 1e8) {
    const sig = await connection.requestAirdrop(payer.publicKey, 2e9);
    await connection.confirmTransaction(sig, "confirmed");
    console.log("Airdropped SOL for fees");
  }

  // 3. Create Token-2022 mint
  const mintKeypair = web3.Keypair.generate();
  const mintRent = await connection.getMinimumBalanceForRentExemption(splToken.MINT_SIZE);

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
      MINT_AUTHORITY ? new web3.PublicKey(MINT_AUTHORITY) : payer.publicKey,
      FREEZE_AUTHORITY ? new web3.PublicKey(FREEZE_AUTHORITY) : null,
      TOKEN_2022_PROGRAM_ID
    )
  );
  await web3.sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
  console.log(`✅ Mint created: ${mintKeypair.publicKey.toBase58()}`);

  // 4. Create your vault ATA (Associated Token Account)
  const ata = await splToken.getOrCreateAssociatedTokenAccount(
    connection,
    payer,                  // payer
    mintKeypair.publicKey,  // mint
    payer.publicKey,        // owner
    false,                  // allow owner off curve (no multisig)
    "confirmed",
    TOKEN_2022_PROGRAM_ID
  );
  console.log(`✅ Vault ATA: ${ata.address.toBase58()}`);

  // 5. Mint total supply to vault
  const mintTx = new web3.Transaction().add(
    splToken.createMintToInstruction(
      mintKeypair.publicKey,
      ata.address,
      payer.publicKey,        // Mint authority (change if using multisig)
      BigInt(SUPPLY) * BigInt(10 ** DECIMALS),
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );
  await web3.sendAndConfirmTransaction(connection, mintTx, [payer]);
  console.log(`✅ Minted ${SUPPLY} tokens to vault`);

  // 6. Set authorities to null (revoke)
  // (If you want to revoke, uncomment below)
  // const setAuthIx = splToken.createSetAuthorityInstruction(
  //   mintKeypair.publicKey,
  //   payer.publicKey,
  //   splToken.AuthorityType.MintTokens,
  //   null,
  //   [],
  //   TOKEN_2022_PROGRAM_ID
  // );
  // await web3.sendAndConfirmTransaction(connection, new web3.Transaction().add(setAuthIx), [payer]);
  // console.log("✅ Mint authority revoked (set to null)");

  // 7. Output
  console.log("Mint address:", mintKeypair.publicKey.toBase58());
  console.log("Vault ATA:", ata.address.toBase58());
  console.log("Owner:", payer.publicKey.toBase58());
})();
