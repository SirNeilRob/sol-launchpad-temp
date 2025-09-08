# 🚀 CSN Token Setup Guide

Complete setup instructions for running and testing the CSN Token-2022 implementation.

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18.20.8 or higher)
   ```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Rust** (1.88+)
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   
   # Check version
   rustc --version
   ```

3. **Solana CLI** (2.2+)
   ```bash
   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/v2.2.0/install)"
   
   # Add to PATH
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   
   # Check version
   solana --version
   ```

4. **Anchor Framework** (0.31+)
   ```bash
   # Install Anchor
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   
   # Check version
   anchor --version
   ```

### Optional Tools

5. **Phantom Wallet** (for frontend testing)
   - Install Phantom browser extension
   - Create or import a wallet
   - Switch to Devnet

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/SirNeilRob/csn-token.git
cd csn-token
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install --legacy-peer-deps

# Install frontend dependencies
cd app
npm install --legacy-peer-deps
cd ..
```

### 3. Configure Solana CLI

```bash
# Set to devnet
solana config set --url devnet

# Create a new keypair (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Check balance and airdrop if needed
solana balance
solana airdrop 2
```

### 4. Build the Program

```bash
# Build the Anchor program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 🧪 Testing

### Run Tests

```bash
# Run the complete test suite
npm test

# Or run with Anchor
anchor test
```

### Expected Test Output

The tests will:
1. ✅ Create Token-2022 mint
2. ✅ Initialize all vault PDAs
3. ✅ Distribute tokens to launch vaults
4. ✅ Finalize token authorities

### Test Results

```
csn - Token-2022 Launch Flow
=== CSN Token-2022 Launch ===
Unique Seed: [timestamp]
Mint: [mint_address]
State PDA: [state_address]
Distribution: [distribution_address]
...

✓ Creates Token-2022 mint and vaults
✓ Distributes tokens to all vaults  
✓ Finalizes token authorities

3 passing (16s)
```

## 🌐 Frontend Testing

### Start Development Server

```bash
cd app
npm run dev
```

### Access the Application

- Open browser to `http://localhost:5173`
- Connect Phantom wallet
- Follow the launch wizard

### Frontend Features

- ✅ Phantom wallet integration
- ✅ Real PDA address generation
- ✅ Step-by-step launch process
- ✅ Token distribution visualization
- ✅ Professional UI with security features

## 🛠️ Development Commands

### Smart Contract

```bash
# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test

# Generate IDL
anchor build
```

### Frontend

```bash
cd app

# Development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

### Tools

```bash
# Initialize token
node tools/initialize_csn.js

# Add metadata
node tools/add_metadata.js <MINT_ADDRESS>

# Test metadata
node tools/test_metadata_mint.js
```

## 🔍 Troubleshooting

### Common Issues

1. **Node.js Version Warnings**
   ```bash
   # Use --legacy-peer-deps flag
   npm install --legacy-peer-deps
   ```

2. **Solana CLI Not Found**
   ```bash
   # Add to PATH
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   ```

3. **Anchor Not Found**
   ```bash
   # Reinstall Anchor
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

4. **Insufficient SOL Balance**
   ```bash
   # Airdrop SOL
   solana airdrop 2
   ```

5. **Build Errors**
   ```bash
   # Clean and rebuild
   anchor clean
   anchor build
   ```

### Getting Help

- Check the [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) for detailed launch procedures
- Review [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) for security features
- See [tools/README.md](tools/README.md) for tool usage

## 📊 Project Structure

```
csn-token/
├── programs/csn/src/lib.rs    # Smart contract
├── tests/csn.ts               # Test suite
├── app/                       # React frontend
├── tools/                     # Development tools
├── scripts/                   # Deployment scripts
├── LAUNCH_GUIDE.md           # Launch procedures
├── SECURITY_SUMMARY.md       # Security features
└── SETUP_GUIDE.md           # This file
```

## 🎯 What You Can Test

### Smart Contract Features

- ✅ Token-2022 mint creation
- ✅ PDA-based vault system
- ✅ Controlled token distribution
- ✅ Authority finalization
- ✅ Supply cap enforcement
- ✅ Time-locked minting

### Frontend Features

- ✅ Wallet connection
- ✅ Launch wizard
- ✅ Real address generation
- ✅ Token distribution visualization
- ✅ Professional UI

### Security Features

- ✅ Anti-sniping protection
- ✅ Buy cooldowns
- ✅ Max wallet limits
- ✅ Emergency pause system
- ✅ Liquidity locking
- ✅ Vesting controls

## 🚀 Next Steps

After successful setup:

1. **Customize the Token**: Modify constants in `lib.rs`
2. **Deploy to Mainnet**: Follow the launch guide
3. **Add Metadata**: Use the metadata tools
4. **Integrate DEXs**: Connect to Raydium/Jupiter
5. **Community Launch**: Execute the launch sequence

## 📞 Support

- **Issues**: Open GitHub issues
- **Documentation**: Check the guides in the repo
- **Security**: Review security documentation

---

**Happy Testing!** 🎉

This setup guide ensures anyone can clone, build, and test your CSN token implementation successfully.