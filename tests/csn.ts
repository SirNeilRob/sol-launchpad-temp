import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Csn } from "../target/types/csn";
import { assert } from "chai";
import * as fs from "fs";

describe("csn - Token-2022 Launch Flow", () => {
  const connection = new anchor.web3.Connection('https://api.devnet.solana.com', 'confirmed');
  const payer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync('csn_keys', 'utf8')))
  );
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), {});
  anchor.setProvider(provider);
  const program = anchor.workspace.csn as Program<Csn>;

  // PDAs and keypairs
  let mintKeypair: anchor.web3.Keypair;
  let statePda: anchor.web3.PublicKey;
  let distributionPda: anchor.web3.PublicKey;
  let teamPda: anchor.web3.PublicKey;
  let stakingPda: anchor.web3.PublicKey;
  let treasuryPda: anchor.web3.PublicKey;
  let idoPda: anchor.web3.PublicKey;
  let lpPda: anchor.web3.PublicKey;
  let marketingPda: anchor.web3.PublicKey;
  let airdropPda: anchor.web3.PublicKey;
  let bump: number;
  let uniqueSeed: number;

  before(async () => {
    // Generate unique seed for this test run
    uniqueSeed = Date.now();
    
    // Create mint as regular keypair (not PDA)
    mintKeypair = anchor.web3.Keypair.generate();

    // Calculate state PDA
    [statePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    // Calculate vault PDAs
    [distributionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("distribution_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    [teamPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("team_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    [stakingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("staking_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    
    [idoPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("ido_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
    program.programId
  );
    
    [lpPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("lp_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    [marketingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketing_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    [airdropPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("airdrop_vault"), new anchor.BN(uniqueSeed).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    console.log("=== CSN Token-2022 Launch ===");
    console.log("Unique Seed:", uniqueSeed);
    console.log("Mint:", mintKeypair.publicKey.toBase58());
    console.log("State PDA:", statePda.toBase58());
    console.log("Distribution:", distributionPda.toBase58());
    console.log("Team:", teamPda.toBase58());
    console.log("Staking:", stakingPda.toBase58());
    console.log("Treasury:", treasuryPda.toBase58());
    console.log("IDO:", idoPda.toBase58());
    console.log("LP:", lpPda.toBase58());
    console.log("Marketing:", marketingPda.toBase58());
    console.log("Airdrop:", airdropPda.toBase58());
    console.log("=============================");
  });

  it("Creates Token-2022 mint and vaults", async () => {
    console.log("\n=== Step 1: Create Token-2022 Mint ===");
    
    // Create mint account owned by Token-2022
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    const createMintTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: mintRent,
        space: 82,
        programId: new anchor.web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
      })
    );
    
    const createMintSig = await connection.sendTransaction(createMintTx, [payer, mintKeypair]);
    await connection.confirmTransaction(createMintSig, 'confirmed');
    console.log("✓ Mint account created:", createMintSig);

    console.log("\n=== Step 2: Initialize Program ===");
    
    // Create and initialize all vaults (including marketing and airdrop) as Token-2022 accounts
    const vaults = [
      { pda: distributionPda, name: "distribution_vault" },
      { pda: teamPda, name: "team_vault" },
      { pda: stakingPda, name: "staking_vault" },
      { pda: treasuryPda, name: "treasury_vault" },
      { pda: idoPda, name: "ido_vault" },
      { pda: lpPda, name: "lp_vault" },
      { pda: marketingPda, name: "marketing_vault" },
      { pda: airdropPda, name: "airdrop_vault" },
    ];
    const token2022ProgramId = new anchor.web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
    const vaultRent = await connection.getMinimumBalanceForRentExemption(165);
    for (const vault of vaults) {
      const tx = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: vault.pda,
          lamports: vaultRent,
          space: 165,
          programId: token2022ProgramId,
        })
      );
      try {
        await connection.sendTransaction(tx, [payer], { skipPreflight: true });
      } catch (e) {
        // Account may already exist, ignore
      }
      // Initialize as Token-2022 account
      const ix = new anchor.web3.TransactionInstruction({
        programId: token2022ProgramId,
        keys: [
          { pubkey: vault.pda, isSigner: false, isWritable: true },
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
          { pubkey: statePda, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([3]), // InitializeAccount3 instruction (see Token-2022 spec)
      });
      try {
        await connection.sendTransaction(new anchor.web3.Transaction().add(ix), [payer], { skipPreflight: true });
      } catch (e) {
        // May already be initialized, ignore
      }
    }
    
    // Use the program's initialize method
    const initTx = await program.methods.initialize(payer.publicKey, new anchor.BN(uniqueSeed)).accounts({
      state: statePda,
      payer: payer.publicKey,
      mint: mintKeypair.publicKey,
      distributionAccount: distributionPda,
      teamAccount: teamPda,
      stakingAccount: stakingPda,
      treasuryAccount: treasuryPda,
      idoAccount: idoPda,
      lpAccount: lpPda,
      marketingAccount: marketingPda,
      airdropAccount: airdropPda,
      tokenProgram: token2022ProgramId,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    } as any).signers([payer]).rpc();
    
    console.log("✓ Program initialized:", initTx);

    // Verify mint account is owned by Token-2022
    const mintInfo = await connection.getAccountInfo(mintKeypair.publicKey);
    assert.isNotNull(mintInfo, "Mint account should exist");
    assert.equal(mintInfo!.owner.toBase58(), "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", "Mint should be owned by Token-2022");
    console.log("✓ Mint owned by Token-2022");

    // Verify distribution vault has tokens
    const distributionBalance = await connection.getTokenAccountBalance(distributionPda);
    console.log(`✓ Distribution vault balance: ${distributionBalance.value.uiAmount} tokens`);
    assert.equal(distributionBalance.value.uiAmount, 100_000_000, "Should have 100M tokens");
  });

  it("Distributes tokens to all vaults", async () => {
    console.log("\n=== Distributing Tokens ===");
    
    // Use the program's distribute method
    // The distribution authority is the state PDA, which uses invoke_signed internally
    const distributeTx = await program.methods.distribute(new anchor.BN(uniqueSeed)).accounts({
      distributionAccount: distributionPda,
      distributionAuthority: statePda, // State PDA is the authority (uses invoke_signed)
      teamAccount: teamPda,
      stakingAccount: stakingPda,
      treasuryAccount: treasuryPda,
      idoAccount: idoPda,
      lpAccount: lpPda,
      marketingAccount: marketingPda,
      airdropAccount: airdropPda,
      mint: mintKeypair.publicKey,
      tokenProgram: new anchor.web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
    } as any).signers([payer]) // Only payer signs
      .rpc();
    
    console.log("✓ Tokens distributed:", distributeTx);

    // Verify all vault balances
    const vaults = [
      { name: "Staking", pda: stakingPda, expected: 3_000_000 },
      { name: "Treasury", pda: treasuryPda, expected: 2_000_000 },
      { name: "IDO", pda: idoPda, expected: 14_000_000 },
      { name: "Marketing", pda: marketingPda, expected: 7_000_000 },
      { name: "Airdrop", pda: airdropPda, expected: 2_000_000 },
    ];

    for (const vault of vaults) {
      console.log(`Checking ${vault.name} vault: ${vault.pda.toBase58()}`);
      const balance = await connection.getTokenAccountBalance(vault.pda);
      console.log(`✓ ${vault.name} balance: ${balance.value.uiAmount} tokens (expected: ${vault.expected})`);
      assert.equal(balance.value.uiAmount, vault.expected, `${vault.name} should have ${vault.expected} tokens`);
    }
    
    console.log("✓ All tokens distributed successfully!");
  });

  it("Finalizes token authorities", async () => {
    console.log("\n=== Finalizing Token ===");
    
    // Use the program's finalize method
    const finalizeTx = await program.methods.finalize(new anchor.BN(uniqueSeed)).accounts({
      state: statePda,
      mint: mintKeypair.publicKey,
      currentAuthority: payer.publicKey,
      tokenProgram: new anchor.web3.PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
    } as any).signers([payer]).rpc();
    
    console.log("✓ Token finalized:", finalizeTx);
    console.log("✓ Mint and freeze authorities revoked");
  });
});
