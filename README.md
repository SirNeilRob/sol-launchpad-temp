# CSN Token - Enterprise-Grade Solana Token Launchpad

**This project emphasizes secure data handling and controlled access, with clear documentation for reliability

**A production-ready token launchpad that prevents rug pulls and ensures fair distribution.** Built on Solana's Token-2022 standard with enterprise security features including anti-sniping protection, time-locked minting, and automated vesting controls. Every aspect prioritizes security and transparent data handling—from PDA-based state management to comprehensive audit trails. This isn't just another token contract; it's a complete launch infrastructure that protects both founders and investors.

**Try it now:** `git clone https://github.com/SirNeilRob/csn-token.git && cd csn-token && ./setup.sh`

## ✨ Features

- **Fixed Supply**: Maximum of 100,000,000 CSN tokens
- **Time-Locked Minting**: Restricted to once per year
- **Authority Control**: Only designated mint authority can mint
- **Token-2022 Support**: Uses the latest SPL token standard
- **Secure State Management**: PDA-based state storage
- **Burn Functionality**: Token holders can burn their own tokens
- **Professional Frontend**: React app with Phantom wallet integration
- **Comprehensive Security**: Anti-sniping, cooldowns, emergency pause

## 🏗️ Architecture

### Smart Contract Components

- **State Management**: PDA-based state account storing mint authority and timestamps
- **Minting Logic**: Controlled minting with supply cap and time-lock enforcement
- **Burning Logic**: Self-service token burning for holders
- **Security**: Authority checks and supply validation

### Token Distribution (Planned)

- **Staking Rewards**: 40% (40,000,000 CSN)
- **Treasury**: 15% (15,000,000 CSN)
- **Initial DEX Offering**: 14% (14,000,000 CSN)
- **Liquidity Pools**: 4% (4,000,000 CSN)
- **Marketing**: 7% (7,000,000 CSN)

## 🛠️ Development

### Prerequisites

- Rust 1.88+
- Solana CLI 2.2+
- Anchor Framework 0.31+
- Node.js 18+
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SirNeilRob/csn-token.git
   cd csn-token
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   cd app && npm install --legacy-peer-deps && cd ..
   ```

3. **Build the program**
   ```bash
   anchor build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Program ID

```
7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN
```

## 📋 Smart Contract Functions

### `initialize`
- Creates the state PDA
- Sets the mint authority
- Initializes timestamps and counters

### `mint_csn`
- Mints new CSN tokens (authority only)
- Enforces supply cap (100M maximum)
- Enforces time-lock (once per year)
- Updates state timestamps

### `burn_csn`
- Burns tokens from holder's account
- No special restrictions

## 🔒 Security Features

- **Supply Cap Enforcement**: Prevents minting beyond 100M tokens
- **Time-Lock Mechanism**: Restricts minting frequency
- **Authority Validation**: Only authorized parties can mint
- **PDA State**: Secure state management using Program Derived Addresses

## 📝 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Complete setup instructions
- **[LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)**: Launch procedures and security
- **[SECURITY_SUMMARY.md](SECURITY_SUMMARY.md)**: Security features overview
- **[tools/README.md](tools/README.md)**: Development tools usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

## ⚠️ Intellectual Property Notice

This code is proprietary and protected under U.S. copyright law.  
No license is granted for use, distribution, or modification without explicit written permission from the author.  
Any unauthorized use may result in legal consequences.

## 🔗 Links

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [SPL Token-2022](https://spl.solana.com/token-2022)

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This is a development version. Production deployment should include additional security audits and testing.
