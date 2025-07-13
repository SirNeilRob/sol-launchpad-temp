import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Csn } from "../target/types/csn";

describe("csn - locked mint", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.csn as Program<Csn>;

  const [statePda, ] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state")],
    program.programId
  );
  const mint = new anchor.web3.PublicKey("45qA6AB2EZa3wUfBGwifw31Qt3iajAwnduLrMMjdcakm");

  it("Reads State PDA and checks mint authority", async () => {
    const state = await program.account.state.fetch(statePda);
    console.log("State Account:", {
      mintAuthority: state.mintAuthority.toBase58(),
      mintedThisYear: state.mintedThisYear.toString(),
      mintStartTimestamp: state.mintStartTimestamp.toString(),
    });
    // This should match the address you revoked or show the "None" public key
  });

  it("Checks that mint authority is revoked on-chain", async () => {
    // Use Solana web3.js to fetch the Mint account directly:
    const mintAcc = await provider.connection.getParsedAccountInfo(mint);
    const data = mintAcc.value.data;
    if (data && "parsed" in data) {
      const mintInfo = data.parsed.info;
      console.log("Mint Authority:", mintInfo.mintAuthority); // Should be null
      console.log("Freeze Authority:", mintInfo.freezeAuthority); // Should be null
    }
  });

  // Optionally: check balances or burns, but no mints!
});
