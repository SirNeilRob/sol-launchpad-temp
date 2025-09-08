#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// CSN Token metadata constants
const TOKEN_NAME = "CSN Token";
const TOKEN_SYMBOL = "CSN";
const TOKEN_URI = "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/csn-das-metadata.json";
const TOKEN_DESCRIPTION = "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution.";
const TOKEN_IMAGE = "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/assets/CryptoSun.jpeg";
const TOKEN_EXTERNAL_URL = "https://csn-token.com";

function runCommand(command) {
    try {
        console.log(`Running: ${command}`);
        const output = execSync(command, { encoding: 'utf8' });
        console.log(output);
        return output;
    } catch (error) {
        console.error(`Error running command: ${command}`);
        console.error(error.message);
        throw error;
    }
}

function addTokenMetadata(mintAddress, updateAuthority) {
    console.log("=== Adding Token-2022 Metadata to CSN Token ===");
    console.log(`Mint Address: ${mintAddress}`);
    console.log(`Update Authority: ${updateAuthority || 'Using default keypair'}`);
    console.log("");

    try {
        // Step 1: Initialize metadata extension
        console.log("Step 1: Initializing metadata extension...");
        runCommand(`spl-token initialize-metadata --program-2022 ${mintAddress} "${TOKEN_NAME}" "${TOKEN_SYMBOL}" "${TOKEN_URI}"`);
        console.log("✅ Metadata extension initialized\n");

        // Step 2: Add additional metadata fields
        console.log("Step 2: Adding additional metadata fields...");
        
        // Add description
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "description" "${TOKEN_DESCRIPTION}"`);
        console.log("✅ Description added");

        // Add image
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "image" "${TOKEN_IMAGE}"`);
        console.log("✅ Image added");

        // Add external URL
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "external_url" "${TOKEN_EXTERNAL_URL}"`);
        console.log("✅ External URL added");

        // Add decimals
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "decimals" "9"`);
        console.log("✅ Decimals added");

        // Add max supply
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "max_supply" "100000000"`);
        console.log("✅ Max supply added");

        // Add standard
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "standard" "Token-2022"`);
        console.log("✅ Standard added");

        // Add network
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "network" "Solana"`);
        console.log("✅ Network added");

        // Add minting type
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "minting" "Time-locked"`);
        console.log("✅ Minting type added");

        // Add authority type
        runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "authority" "PDA-controlled"`);
        console.log("✅ Authority type added");

        console.log("\n🎉 Token-2022 metadata successfully added!");
        console.log(`\nView your token on Solana Explorer:`);
        console.log(`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
        
        console.log(`\nView metadata JSON:`);
        console.log(TOKEN_URI);

    } catch (error) {
        console.error("\n❌ Error adding metadata:");
        console.error(error.message);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("Usage: node add_metadata.js <MINT_ADDRESS> [UPDATE_AUTHORITY]");
        console.log("");
        console.log("Example:");
        console.log("  node add_metadata.js HMJfQRgDxy7K9Dk9TjProMaYxpf6sCCiWbMG3pX1TeK4");
        console.log("");
        console.log("Note: Make sure you have spl-token CLI installed and configured");
        process.exit(1);
    }

    const mintAddress = args[0];
    const updateAuthority = args[1]; // Optional

    // Validate mint address format
    if (!mintAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        console.error("❌ Invalid mint address format");
        process.exit(1);
    }

    addTokenMetadata(mintAddress, updateAuthority);
}

module.exports = { addTokenMetadata }; 