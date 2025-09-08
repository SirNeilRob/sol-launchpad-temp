# CSN Token-2022 Metadata Tools

This directory contains tools for adding and managing metadata for your CSN Token-2022 token.

## Files

- `add_metadata.js` - Script to add Token-2022 metadata to your mint
- `test_metadata.js` - Test script showing how to use the metadata tools
- `README.md` - This file

## Prerequisites

1. **spl-token CLI** - Install with:
   ```bash
   cargo install spl-token-cli
   ```

2. **Solana CLI** - Make sure you have Solana CLI configured with your keypair

3. **Your mint address** - The address of your deployed CSN token mint

## Usage

### Adding Metadata to Your Token

1. **Get your mint address** from your deployment or test output

2. **Run the metadata script**:
   ```bash
   node tools/add_metadata.js <YOUR_MINT_ADDRESS>
   ```

   Example:
   ```bash
   node tools/add_metadata.js HMJfQRgDxy7K9Dk9TjProMaYxpf6sCCiWbMG3pX1TeK4
   ```

### What the Script Does

The `add_metadata.js` script will:

1. **Initialize metadata extension** on your mint using `spl-token initialize-metadata --program-2022`
2. **Add basic metadata**:
   - Name: "CSN Token"
   - Symbol: "CSN"
   - URI: Points to your metadata JSON file
3. **Add additional fields**:
   - Description
   - Image URL (CryptoSun.jpeg)
   - External URL
   - Decimals (9)
   - Max Supply (100,000,000)
   - Standard (Token-2022)
   - Network (Solana)
   - Minting type (Time-locked)
   - Authority type (PDA-controlled)

### Manual Commands

If you prefer to run the commands manually:

```bash
# Initialize metadata
spl-token initialize-metadata --program-2022 <MINT_ADDRESS> "CSN Token" "CSN" "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/csn-das-metadata.json"

# Add description
spl-token update-metadata --program-2022 <MINT_ADDRESS> "description" "CSN is a Solana-based token with controlled minting, time-locks, and secure vault distribution."

# Add image
spl-token update-metadata --program-2022 <MINT_ADDRESS> "image" "https://raw.githubusercontent.com/SirNeilRob/csn-token/main/assets/CryptoSun.jpeg"

# Add other fields as needed...
```

### Viewing Metadata

After adding metadata, you can:

1. **View on Solana Explorer**:
   ```
   https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet
   ```

2. **View metadata JSON**:
   ```
   https://raw.githubusercontent.com/SirNeilRob/csn-token/main/csn-das-metadata.json
   ```

3. **Query metadata programmatically**:
   ```bash
   spl-token display <MINT_ADDRESS> --program-2022
   ```

## Token-2022 Metadata Features

Your CSN token metadata includes:

- ✅ **Standard Token-2022 metadata** (name, symbol, URI)
- ✅ **Custom fields** (description, image, etc.)
- ✅ **Professional branding** with CryptoSun.jpeg logo
- ✅ **Complete token information** (supply, decimals, etc.)
- ✅ **On-chain metadata** that wallets and dApps can read

## Troubleshooting

### Common Issues

1. **"spl-token: command not found"**
   - Install spl-token CLI: `cargo install spl-token-cli`

2. **"Invalid mint address"**
   - Make sure you're using the correct mint address from your deployment

3. **"Insufficient funds"**
   - Make sure your keypair has enough SOL for transaction fees

4. **"Already initialized"**
   - The metadata extension is already initialized on this mint

### Getting Help

- Check the [spl-token CLI documentation](https://spl.solana.com/token)
- Verify your Solana CLI configuration: `solana config get`
- Check your balance: `solana balance`

## Next Steps

After adding metadata:

1. **Test on devnet** to make sure everything works
2. **Deploy to mainnet** when ready
3. **Add metadata to mainnet** using the same process
4. **List on DEXs** and marketplaces
5. **Share your token** with the community!

Your CSN token will now have professional metadata that wallets, explorers, and dApps can display properly! 🎉 