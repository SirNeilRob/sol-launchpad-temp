import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Csn } from "../target/types/csn";
import { assert } from "chai";
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  createAccount,
  getAccount,
  getMint,
} from "@solana/spl-token-2022";

describe("csn - full launch flow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.csn as Program<Csn>;
  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  let mint: anchor.web3.PublicKey;
  let distribution: anchor.web3.PublicKey;
  let team: anchor.web3.PublicKey;
  let staking: anchor.web3.PublicKey;
  let treasury: anchor.web3.PublicKey;
  let ido: anchor.web3.PublicKey;
  let lp: anchor.web3.PublicKey;

  let statePda: anchor.web3.PublicKey;
  let bump: number;

  before(async () => {
    [statePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state")],
      program.programId
    );
    // Airdrop SOL to payer for fees
    await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    // Create the Token-2022 mint
    mint = await createMint(
      connection,
      payer.payer,
      statePda, // state PDA as mint authority
      statePda, // state PDA as freeze authority (will be revoked)
      9,
      undefined,
      { commitment: "confirmed" },
      TOKEN_2022_PROGRAM_ID
    );

    // Create all required token accounts
    distribution = await createAccount(connection, payer.payer, mint, payer.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
    team = await createAccount(connection, payer.payer, mint, payer.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
    staking = await createAccount(connection, payer.payer, mint, payer.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
    treasury = await createAccount(connection, payer.payer, mint, payer.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
    ido = await createAccount(connection, payer.payer, mint, payer.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
    lp = await createAccount(connection, payer.payer, mint, payer.publicKey, undefined, TOKEN_2022_PROGRAM_ID);
  });

  it("Initializes the mint and mints full supply to distribution account", async () => {
    await program.methods.initialize(statePda).accounts({
      state: statePda,
      payer: payer.publicKey,
      mint,
      distributionAccount: distribution,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([]).rpc();

    const distAcc = await getAccount(connection, distribution, undefined, TOKEN_2022_PROGRAM_ID);
    assert.equal(Number(distAcc.amount), 100_000_000 * 1_000_000_000, "Distribution account should have full supply");
  });

  it("Distributes tokens to all 5 destinations", async () => {
    await program.methods.distribute().accounts({
      distributionAccount: distribution,
      distributionAuthority: payer.publicKey,
      teamAccount: team,
      stakingAccount: staking,
      treasuryAccount: treasury,
      idoAccount: ido,
      lpAccount: lp,
    }).signers([]).rpc();

    const teamAcc = await getAccount(connection, team, undefined, TOKEN_2022_PROGRAM_ID);
    const stakingAcc = await getAccount(connection, staking, undefined, TOKEN_2022_PROGRAM_ID);
    const treasuryAcc = await getAccount(connection, treasury, undefined, TOKEN_2022_PROGRAM_ID);
    const idoAcc = await getAccount(connection, ido, undefined, TOKEN_2022_PROGRAM_ID);
    const lpAcc = await getAccount(connection, lp, undefined, TOKEN_2022_PROGRAM_ID);

    assert.equal(Number(teamAcc.amount), 27_500_000 * 1_000_000_000, "Team allocation correct");
    assert.equal(Number(stakingAcc.amount), 40_000_000 * 1_000_000_000, "Staking allocation correct");
    assert.equal(Number(treasuryAcc.amount), 15_000_000 * 1_000_000_000, "Treasury allocation correct");
    assert.equal(Number(idoAcc.amount), 14_000_000 * 1_000_000_000, "IDO allocation correct");
    assert.equal(Number(lpAcc.amount), 4_000_000 * 1_000_000_000, "LP allocation correct");
  });

  it("Finalizes and revokes authorities", async () => {
    await program.methods.finalize().accounts({
      mint,
      currentAuthority: statePda,
    }).signers([]).rpc();

    const mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    assert.isNull(mintInfo.mintAuthority, "Mint authority should be null");
    assert.isNull(mintInfo.freezeAuthority, "Freeze authority should be null");
  });

  it("Prevents further minting after finalize", async () => {
    try {
      await program.methods.mintCsn(new anchor.BN(1_000_000_000)).accounts({
        state: statePda,
        mint,
        mintAuthority: statePda,
        to: team,
      }).signers([]).rpc();
      assert.fail("Minting should fail after authorities are revoked");
    } catch (e) {
      assert.include(e.toString(), "Custom error", "Should fail with custom error or authority error");
    }
  });
});
