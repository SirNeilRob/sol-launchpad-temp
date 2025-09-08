#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

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

async function testMetadataMint() {
    console.log("=== Testing Token-2022 Metadata on Devnet ===");
    console.log("Creating a new mint with metadata BEFORE finalizing...");
    console.log("");

    try {
        // Step 1: Create a new mint
        console.log("Step 1: Creating new mint...");
        const createOutput = runCommand('spl-token create-token --program-2022 --decimals 9');
        
        // Extract mint address from output
        const mintMatch = createOutput.match(/Creating token ([A-Za-z0-9]{32,44})/);
        if (!mintMatch) {
            throw new Error("Could not extract mint address from create output");
        }
        
        const mintAddress = mintMatch[1];
        console.log(`✅ Mint created: ${mintAddress}`);
        console.log("");

        // Step 2: Try to initialize metadata extension directly
        console.log("Step 2: Initializing metadata extension...");
        try {
            runCommand(`spl-token initialize-metadata --program-2022 ${mintAddress} "CSN Test Token" "CSN" "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/csn-token-3Mps6KXh.json"`);
            console.log("✅ Metadata extension initialized");
        } catch (error) {
            console.log("⚠️  Metadata extension failed, trying alternative approach...");
            // Try with a simpler URI
            runCommand(`spl-token initialize-metadata --program-2022 ${mintAddress} "CSN Test Token" "CSN" "https://example.com/metadata.json"`);
            console.log("✅ Metadata extension initialized with simple URI");
        }
        console.log("");

        // Step 3: Add additional metadata fields
        console.log("Step 3: Adding additional metadata fields...");
        
        try {
            runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "description" "CSN Test Token with metadata for devnet testing"`);
            console.log("✅ Description added");
        } catch (error) {
            console.log("⚠️  Could not add description");
        }

        try {
            runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "image" "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/assets/CryptoSun.jpeg"`);
            console.log("✅ Image added");
        } catch (error) {
            console.log("⚠️  Could not add image");
        }

        try {
            runCommand(`spl-token update-metadata --program-2022 ${mintAddress} "external_url" "https://csn-token.com"`);
            console.log("✅ External URL added");
        } catch (error) {
            console.log("⚠️  Could not add external URL");
        }

        console.log("");

        // Step 4: Display the mint with metadata
        console.log("Step 4: Displaying mint with metadata...");
        runCommand(`spl-token display ${mintAddress} --program-2022 --verbose`);

        console.log("");
        console.log("🎉 Test mint with metadata created successfully!");
        console.log(`Mint Address: ${mintAddress}`);
        console.log("");
        console.log("🔗 View on Solana Explorer:");
        console.log(`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
        console.log("");
        console.log("📋 Check if it shows 'CSN Test Token' instead of 'Unknown Token'");
        console.log("");

        // Save the mint address for reference
        fs.writeFileSync('test-mint-address.txt', mintAddress);
        console.log("✅ Mint address saved to test-mint-address.txt");

    } catch (error) {
        console.error("\n❌ Error testing metadata:");
        console.error(error.message);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    testMetadataMint();
}

module.exports = { testMetadataMint }; 