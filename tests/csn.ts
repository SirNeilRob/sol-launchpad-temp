import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Csn } from "../target/types/csn";
import { assert } from "chai";

describe("csn - full launch flow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.csn as Program<Csn>;

  let mint = anchor.web3.Keypair.generate();
  let distribution = anchor.web3.Keypair.generate();
  let team = anchor.web3.Keypair.generate();
  let staking = anchor.web3.Keypair.generate();
  let treasury = anchor.web3.Keypair.generate();
  let ido = anchor.web3.Keypair.generate();
  let lp = anchor.web3.Keypair.generate();

  let statePda: anchor.web3.PublicKey;
  let bump: number;

  before(async () => {
    [statePda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state")],
      program.programId
    );
    // Airdrop SOL to payer for fees
    await provider.connection.requestAirdrop(provider.wallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Initializes the mint and mints full supply to distribution account", async () => {
    // TODO: Create mint and distribution token account, set up mint authority as state PDA
    // Call initialize()
    // Fetch and assert state, mint config, and distribution account balance
  });

  it("Distributes tokens to all 5 destinations", async () => {
    // TODO: Call distribute() and check balances for team, staking, treasury, ido, lp
  });

  it("Finalizes and revokes authorities", async () => {
    // TODO: Call finalize() and check mint/freeze authorities are null
  });

  it("Prevents further minting after finalize", async () => {
    // TODO: Try to mint again and expect failure
  });
});
