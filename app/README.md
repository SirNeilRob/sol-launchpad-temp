# CSN Token Launch GUI

A modern, user-friendly web interface for launching your CSN Token-2022 token with full security features.

## Features

- 🚀 **Step-by-step launch process** with visual progress indicators
- 🔐 **Wallet integration** for secure transactions
- 🏦 **Vault management** with real-time balance tracking
- 📊 **Token distribution** visualization
- 🎨 **Modern UI** with beautiful gradients and animations
- 📱 **Responsive design** that works on all devices

## Quick Start

1. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Launch Process

The GUI guides you through 5 main steps:

1. **Connect Wallet** - Link your Solana wallet
2. **Create Token Mint** - Initialize the Token-2022 mint
3. **Setup Vaults** - Create all PDA vaults
4. **Distribute Tokens** - Allocate tokens to vaults
5. **Finalize Launch** - Revoke authorities and complete

## Vault Distribution

The GUI shows real-time balances for all vaults:

- **Distribution** (100M) - Main distribution vault
- **Team** (10M) - Team allocation
- **Staking** (20M) - Staking rewards
- **Treasury** (15M) - Treasury management
- **IDO** (25M) - Initial DEX offering
- **Liquidity** (20M) - DEX liquidity
- **Marketing** (5M) - Marketing activities
- **Airdrop** (5M) - Community airdrops

## Integration with Your Program

This GUI is designed to work with your existing CSN program. To integrate:

1. Replace the mock functions with actual Solana transactions
2. Connect to your program's IDL
3. Add proper error handling
4. Implement real wallet connection

## Development

- **Framework:** React 18 + TypeScript
- **Styling:** CSS with modern gradients
- **Icons:** Lucide React
- **Build Tool:** Vite

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Customization

- Modify `src/App.tsx` to change the launch flow
- Update `src/index.css` for styling changes
- Add new components in the `src` folder
- Configure vault allocations in the component state 