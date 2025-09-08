import { PublicKey } from '@solana/web3.js';

// Your actual program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN');

// Browser-compatible text encoder
const textEncoder = new TextEncoder();

export const generateRealAddresses = (uniqueSeed: number) => {
  const seedBytes = new Uint8Array(new ArrayBuffer(8));
  const view = new DataView(seedBytes.buffer);
  view.setBigUint64(0, BigInt(uniqueSeed), true); // little-endian

  // Generate real PDAs using the same logic as your program
  const [statePda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("state"), seedBytes],
    PROGRAM_ID
  );

  const [distributionPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("distribution_vault"), seedBytes],
    PROGRAM_ID
  );

  const [teamPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("team_vault"), seedBytes],
    PROGRAM_ID
  );

  const [stakingPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("staking_vault"), seedBytes],
    PROGRAM_ID
  );

  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("treasury_vault"), seedBytes],
    PROGRAM_ID
  );

  const [idoPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("ido_vault"), seedBytes],
    PROGRAM_ID
  );

  const [lpPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("lp_vault"), seedBytes],
    PROGRAM_ID
  );

  const [marketingPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("marketing_vault"), seedBytes],
    PROGRAM_ID
  );

  const [airdropPda] = PublicKey.findProgramAddressSync(
    [textEncoder.encode("airdrop_vault"), seedBytes],
    PROGRAM_ID
  );

  return {
    programId: PROGRAM_ID.toBase58(),
    statePda: statePda.toBase58(),
    distributionPda: distributionPda.toBase58(),
    teamPda: teamPda.toBase58(),
    stakingPda: stakingPda.toBase58(),
    treasuryPda: treasuryPda.toBase58(),
    idoPda: idoPda.toBase58(),
    lpPda: lpPda.toBase58(),
    marketingPda: marketingPda.toBase58(),
    airdropPda: airdropPda.toBase58(),
  };
};

// Add a note about account status
export const getAccountStatusNote = () => {
  return {
    note: "⚠️ These are REAL addresses that will be created when you execute the launch steps. Click the buttons to create actual accounts on Solana.",
    status: "ready_to_create"
  };
}; 