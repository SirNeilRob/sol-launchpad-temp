# Solana Launchpad Template – Token-2022 Implementation

A secure and extensible token launchpad contract built on Solana using the Token-2022 standard.  
Includes support for fixed supply tokens, controlled minting, time-locked vesting, and PDA-managed authority controls.

---

## 🚀 Overview

This launchpad provides a reusable Solana smart contract framework for launching SPL Token-2022 assets with enhanced controls, supply caps, and vesting schedules.  
Originally built for the CSN token, this template can be customized for any project.

---

## ✨ Key Features

- **Fixed Supply Enforcement**: Cap total minted tokens at a preset maximum  
- **Time-Locked Minting**: Restrict minting frequency (e.g., once per year)  
- **Authority Controls**: Only authorized accounts can mint  
- **Token-2022 Support**: Built using the SPL Token-2022 standard  
- **Secure PDA-based State**: For mint authority and timestamp tracking  
- **Built-in Burn Function**: Token holders can burn their own tokens  
- **Vesting Ready**: Compatible with time-based token distribution via custom logic  

---

## 🏗️ Architecture

### Core Modules

- **State Account**: Stores mint authority, timestamps, and supply limits using a Program Derived Address (PDA)  
- **Mint Logic**: Enforces mint frequency and total supply constraints  
- **Burn Logic**: Allows holders to burn tokens without approval  

### Optional Extensions

- Vesting schedules per user or allocation type  
- Freeze or pause authority  
- DAO governance integration  

---

## 📊 Example Token Distribution

The original implementation included:

- **Staking Rewards**: 40%  
- **Treasury**: 15%  
- **Initial DEX Offering (IDO)**: 14%  
- **Liquidity Pools**: 4%  
- **Marketing**: 7%  

> Customize these values for your tokenomics model.

---

## 🛠️ Development Setup

### Prerequisites

- Rust 1.88  
- Solana CLI 2.2.19  
- Anchor 0.31.1  

### Local Setup

```bash
git clone https://github.com/SirNeilRob/sol-launchpad-temp.git
cd sol-launchpad-temp
npm install
anchor build
anchor test
