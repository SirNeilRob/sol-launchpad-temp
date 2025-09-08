const { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } = require("@solana/web3.js");
const { Program, AnchorProvider, BN } = require("@coral-xyz/anchor");
const fs = require("fs");
const path = require("path");

// CSN Program ID
const CSN_PROGRAM_ID = new PublicKey("7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN");

// Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

async function initializeCSN() {
    console.log("🚀 Initializing CSN Token with 100M supply...");
    
    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load your keypair
    const keypairFile = fs.readFileSync(path.join(__dirname, "../csn_keys"), "utf8");
    const keypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));
    
    const provider = new AnchorProvider(connection, { publicKey: keypair.publicKey, signTransaction: (tx) => tx }, {});
    
    // Generate unique seed
    const uniqueSeed = new BN(Math.floor(Math.random() * 1000000));
    console.log("🔢 Unique seed:", uniqueSeed.toString());
    
    // Create mint keypair
    const mintKeypair = Keypair.generate();
    console.log("🪙 Mint address:", mintKeypair.publicKey.toString());
    
    // Derive PDAs
    const [governancePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("governance"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [securityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("security"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [vestingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vesting"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [liquidityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("liquidity"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    // Derive vault PDAs
    const [distributionVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("distribution_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [teamVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("team_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [stakingVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("staking_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [treasuryVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [idoVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("ido_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [lpVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("lp_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [marketingVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("marketing_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    const [airdropVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("airdrop_vault"), uniqueSeed.toArrayLike(Buffer, "le", 8)],
        CSN_PROGRAM_ID
    );
    
    console.log("🔒 Governance PDA:", governancePda.toString());
    console.log("🛡️ Security PDA:", securityPda.toString());
    console.log("🔐 Vesting PDA:", vestingPda.toString());
    console.log("💧 Liquidity PDA:", liquidityPda.toString());
    console.log("🏦 Distribution vault:", distributionVaultPda.toString());
    console.log("👥 Team vault:", teamVaultPda.toString());
    console.log("🔒 Staking vault:", stakingVaultPda.toString());
    console.log("💰 Treasury vault:", treasuryVaultPda.toString());
    console.log("🚀 IDO vault:", idoVaultPda.toString());
    console.log("💧 LP vault:", lpVaultPda.toString());
    console.log("📢 Marketing vault:", marketingVaultPda.toString());
    console.log("🎁 Airdrop vault:", airdropVaultPda.toString());
    
    console.log("\n🎯 CSN Token Configuration Complete!");
    console.log("🔑 Program ID:", CSN_PROGRAM_ID.toString());
    console.log("🪙 Mint address:", mintKeypair.publicKey.toString());
    console.log("💰 Total supply: 100,000,000 CSN tokens ready for minting");
    console.log("🔒 All PDAs derived and ready for initialization");
    console.log("🚀 Ready to initialize on-chain!");
    
    // Save the configuration
    const config = {
        programId: CSN_PROGRAM_ID.toString(),
        mintAddress: mintKeypair.publicKey.toString(),
        uniqueSeed: uniqueSeed.toString(),
        governancePda: governancePda.toString(),
        securityPda: securityPda.toString(),
        vestingPda: vestingPda.toString(),
        liquidityPda: liquidityPda.toString(),
        distributionVaultPda: distributionVaultPda.toString(),
        teamVaultPda: teamVaultPda.toString(),
        stakingVaultPda: stakingVaultPda.toString(),
        treasuryVaultPda: treasuryVaultPda.toString(),
        idoVaultPda: idoVaultPda.toString(),
        lpVaultPda: lpVaultPda.toString(),
        marketingVaultPda: marketingVaultPda.toString(),
        airdropVaultPda: airdropVaultPda.toString(),
        tokenProgram: TOKEN_2022_PROGRAM_ID.toString()
    };
    
    fs.writeFileSync(path.join(__dirname, "csn_config.json"), JSON.stringify(config, null, 2));
    console.log("📄 Configuration saved to csn_config.json");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Run: anchor test --skip-local-validator");
    console.log("2. Check the addresses in Solana explorer");
    console.log("3. The PDAs will show as 'Account exists' after initialization");
    console.log("4. Your CSN token will be live with 100M supply!");
}

// Run the initialization
initializeCSN().catch(console.error); 