import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { idl } from '../idl/csn';

// Your actual program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN');

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export class CSNProgramManager {
  private program: Program;
  private provider: AnchorProvider;
  private uniqueSeed: number;

  constructor(wallet: any, uniqueSeed: number = 12345) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    this.program = new Program(idl, PROGRAM_ID, this.provider);
    this.uniqueSeed = uniqueSeed;
  }

  // Generate PDAs (same as your program)
  private generatePDAs() {
    const seedBytes = new Uint8Array(new ArrayBuffer(8));
    const view = new DataView(seedBytes.buffer);
    view.setBigUint64(0, BigInt(this.uniqueSeed), true);

    const [statePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), seedBytes],
      PROGRAM_ID
    );

    const [distributionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("distribution_vault"), seedBytes],
      PROGRAM_ID
    );

    const [teamPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("team_vault"), seedBytes],
      PROGRAM_ID
    );

    const [stakingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking_vault"), seedBytes],
      PROGRAM_ID
    );

    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury_vault"), seedBytes],
      PROGRAM_ID
    );

    const [idoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ido_vault"), seedBytes],
      PROGRAM_ID
    );

    const [lpPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_vault"), seedBytes],
      PROGRAM_ID
    );

    const [marketingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketing_vault"), seedBytes],
      PROGRAM_ID
    );

    const [airdropPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("airdrop_vault"), seedBytes],
      PROGRAM_ID
    );

    return {
      statePda,
      distributionPda,
      teamPda,
      stakingPda,
      treasuryPda,
      idoPda,
      lpPda,
      marketingPda,
      airdropPda,
    };
  }

  // Step 1: Create Token-2022 Mint
  async createMint(): Promise<string> {
    const mintKeypair = Keypair.generate();
    
    // Create mint account owned by Token-2022
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    const createMintTx = new Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: this.provider.wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: mintRent,
        space: 82,
        programId: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
      })
    );

    const createMintSig = await connection.sendTransaction(createMintTx, [this.provider.wallet, mintKeypair]);
    await connection.confirmTransaction(createMintSig, 'confirmed');
    
    return createMintSig;
  }

  // Step 2: Initialize Program (creates all vaults)
  async initialize(): Promise<string> {
    const pdas = this.generatePDAs();
    
    // Call your program's initialize method
    const initTx = await this.program.methods
      .initialize(this.provider.wallet.publicKey, new BN(this.uniqueSeed))
      .accounts({
        state: pdas.statePda,
        payer: this.provider.wallet.publicKey,
        mint: pdas.distributionPda, // This would be your mint keypair
        distributionAccount: pdas.distributionPda,
        teamAccount: pdas.teamPda,
        stakingAccount: pdas.stakingPda,
        treasuryAccount: pdas.treasuryPda,
        idoAccount: pdas.idoPda,
        lpAccount: pdas.lpPda,
        marketingAccount: pdas.marketingPda,
        airdropAccount: pdas.airdropPda,
        tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([this.provider.wallet])
      .rpc();

    return initTx;
  }

  // Step 3: Distribute Tokens
  async distribute(): Promise<string> {
    const pdas = this.generatePDAs();
    
    const distributeTx = await this.program.methods
      .distribute(new BN(this.uniqueSeed))
      .accounts({
        distributionAccount: pdas.distributionPda,
        distributionAuthority: pdas.statePda,
        teamAccount: pdas.teamPda,
        stakingAccount: pdas.stakingPda,
        treasuryAccount: pdas.treasuryPda,
        idoAccount: pdas.idoPda,
        lpAccount: pdas.lpPda,
        marketingAccount: pdas.marketingPda,
        airdropAccount: pdas.airdropPda,
        mint: pdas.distributionPda, // This would be your mint
        tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
      })
      .signers([this.provider.wallet])
      .rpc();

    return distributeTx;
  }

  // Step 4: Finalize (revoke authorities)
  async finalize(): Promise<string> {
    const pdas = this.generatePDAs();
    
    const finalizeTx = await this.program.methods
      .finalize(new BN(this.uniqueSeed))
      .accounts({
        state: pdas.statePda,
        mint: pdas.distributionPda, // This would be your mint
        currentAuthority: this.provider.wallet.publicKey,
        tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
      })
      .signers([this.provider.wallet])
      .rpc();

    return finalizeTx;
  }

  // Check if accounts exist
  async checkAccountStatus() {
    const pdas = this.generatePDAs();
    
    const accountInfos = await Promise.all([
      connection.getAccountInfo(pdas.statePda),
      connection.getAccountInfo(pdas.distributionPda),
      connection.getAccountInfo(pdas.teamPda),
      connection.getAccountInfo(pdas.stakingPda),
      connection.getAccountInfo(pdas.treasuryPda),
      connection.getAccountInfo(pdas.idoPda),
      connection.getAccountInfo(pdas.lpPda),
      connection.getAccountInfo(pdas.marketingPda),
      connection.getAccountInfo(pdas.airdropPda),
    ]);

    return {
      state: accountInfos[0] !== null,
      distribution: accountInfos[1] !== null,
      team: accountInfos[2] !== null,
      staking: accountInfos[3] !== null,
      treasury: accountInfos[4] !== null,
      ido: accountInfos[5] !== null,
      lp: accountInfos[6] !== null,
      marketing: accountInfos[7] !== null,
      airdrop: accountInfos[8] !== null,
    };
  }
} 