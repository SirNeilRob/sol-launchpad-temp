#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CSN Token metadata for finalized tokens
const TOKEN_METADATA = {
  name: "CSN Token",
  symbol: "CSN",
  description: "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution.",
  image: "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/assets/CryptoSun.jpeg",
  external_url: "https://csn-token.com",
  attributes: [
    {
      trait_type: "Supply Cap",
      value: "100,000,000"
    },
    {
      trait_type: "Decimals",
      value: "9"
    },
    {
      trait_type: "Standard",
      value: "Token-2022"
    },
    {
      trait_type: "Network",
      value: "Solana"
    },
    {
      trait_type: "Minting",
      value: "Time-locked"
    },
    {
      trait_type: "Authority",
      value: "PDA-controlled"
    },
    {
      trait_type: "Status",
      value: "Finalized (Authorities Revoked)"
    }
  ],
  properties: {
    files: [
      {
        type: "image/jpeg",
        uri: "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/assets/CryptoSun.jpeg"
      }
    ],
    category: "image",
    maxSupply: 100000000,
    decimals: 9,
    creators: [
      {
        address: "YOUR_CREATOR_ADDRESS_HERE",
        share: 100,
        verified: true
      }
    ]
  }
};

function generateFinalizedTokenMetadata(mintAddress) {
  console.log("=== CSN Token-2022 Finalized Token Metadata ===");
  console.log(`Mint Address: ${mintAddress}`);
  console.log("");

  // Create metadata file for this specific mint
  const metadataFileName = `csn-token-${mintAddress.slice(0, 8)}.json`;
  const metadataPath = path.join(__dirname, '..', metadataFileName);
  
  // Add mint address to metadata
  const finalMetadata = {
    ...TOKEN_METADATA,
    mint: mintAddress,
    properties: {
      ...TOKEN_METADATA.properties,
      mint: mintAddress
    }
  };

  // Write metadata file
  fs.writeFileSync(metadataPath, JSON.stringify(finalMetadata, null, 2));
  
  console.log("✅ Generated metadata file:", metadataFileName);
  console.log("✅ Metadata includes your CryptoSun.jpeg logo");
  console.log("✅ Token information properly formatted");
  console.log("");

  console.log("📋 Metadata Summary:");
  console.log("   Name: CSN Token");
  console.log("   Symbol: CSN");
  console.log("   Logo: CryptoSun.jpeg");
  console.log("   Supply: 100,000,000");
  console.log("   Decimals: 9");
  console.log("   Standard: Token-2022");
  console.log("   Status: Finalized (Secure)");
  console.log("");

  console.log("🌐 Next Steps:");
  console.log("1. Upload the metadata file to GitHub or IPFS");
  console.log("2. Update the image URL in the metadata if needed");
  console.log("3. Share the metadata URL with wallets and explorers");
  console.log("");

  console.log("📁 Files created:");
  console.log(`   - ${metadataFileName} (metadata JSON)`);
  console.log(`   - assets/CryptoSun.jpeg (logo)`);
  console.log("");

  console.log("🔗 View your token:");
  console.log(`   Solana Explorer: https://explorer.solana.com/address/${mintAddress}?cluster=devnet`);
  console.log(`   Metadata: ${metadataPath}`);
  console.log("");

  console.log("💡 Note: This token is finalized (authorities revoked) for security.");
  console.log("   Off-chain metadata is the recommended approach for finalized tokens.");
  console.log("   Wallets and explorers can still read and display this metadata.");

  return metadataPath;
}

function createMetadataPointerFile(mintAddress) {
  console.log("\n=== Creating Metadata Pointer File ===");
  
  const pointerFileName = `metadata-pointer-${mintAddress.slice(0, 8)}.json`;
  const pointerPath = path.join(__dirname, '..', pointerFileName);
  
  const pointerData = {
    mint: mintAddress,
    metadata_url: `https://raw.githubusercontent.com/SirNeilRob/csn-token/main/csn-token-${mintAddress.slice(0, 8)}.json`,
    image_url: "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/assets/CryptoSun.jpeg",
    explorer_url: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
    token_info: {
      name: "CSN Token",
      symbol: "CSN",
      decimals: 9,
      supply: "100,000,000",
      standard: "Token-2022"
    }
  };

  fs.writeFileSync(pointerPath, JSON.stringify(pointerData, null, 2));
  
  console.log("✅ Created metadata pointer file:", pointerFileName);
  console.log("✅ Use this for wallet integrations and listings");
  
  return pointerPath;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Usage: node finalized_token_metadata.js <MINT_ADDRESS>");
    console.log("");
    console.log("Example:");
    console.log("  node finalized_token_metadata.js 3Mps6KXh8zzJDMYCnucUJLtqgRRJQ6NpAZ7kEkxEWnm5");
    console.log("");
    console.log("This script generates off-chain metadata for finalized tokens.");
    process.exit(1);
  }

  const mintAddress = args[0];

  // Validate mint address format
  if (!mintAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
    console.error("❌ Invalid mint address format");
    process.exit(1);
  }

  try {
    const metadataPath = generateFinalizedTokenMetadata(mintAddress);
    const pointerPath = createMetadataPointerFile(mintAddress);
    
    console.log("\n🎉 Finalized token metadata generated successfully!");
    console.log(`📄 Metadata: ${metadataPath}`);
    console.log(`📄 Pointer: ${pointerPath}`);
    
  } catch (error) {
    console.error("\n❌ Error generating metadata:");
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { generateFinalizedTokenMetadata, createMetadataPointerFile }; 