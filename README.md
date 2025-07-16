# CSN Token - Solana Token-2022 Implementation

A secure, controlled-minting token contract built on Solana using the Token-2022 program with fixed supply, time-locked minting, and authority controls.

## 🚀 Overview

CSN is a Solana-based token with a maximum supply of 100,000,000 tokens. The contract implements controlled minting with time-lock mechanisms and supply cap enforcement.

## ✨ Features

- **Fixed Supply**: Maximum of 100,000,000 CSN tokens
- **Time-Locked Minting**: Restricted to once per year
- **Authority Control**: Only designated mint authority can mint
- **Token-2022 Support**: Uses the latest SPL token standard
- **Secure State Management**: PDA-based state storage
- **Burn Functionality**: Token holders can burn their own tokens

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

- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.31+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/csn-token.git
   cd csn-token
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the program**
   ```bash
   anchor build
   ```

4. **Run tests**
   ```bash
   anchor test
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

## 📝 TODO

- [ ] Multi-signature governance implementation
- [ ] Freeze authority enforcement
- [ ] Enhanced error handling
- [ ] Additional security audits

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
