# 🔒 CSN Token Layered Security Architecture

## 🎯 Overview

The CSN token implements a **layered security approach** with **PDA-based execution** as the foundation. This ensures that **no single person can move funds or mint tokens** - all critical operations are controlled by Program Derived Addresses (PDAs) with specific, limited authorities.

## 🏗️ Security Architecture

### 🔸 PDA for Execution - Core Principle

**"Handles token vaults, vesting, and automated logic"**

All critical operations are executed through PDAs with specific authorities:

1. **Governance PDA** - Controls all critical operations
2. **Security PDA** - Manages access controls and limits
3. **Vesting PDA** - Handles all vesting schedules
4. **Liquidity PDA** - Manages LP locking
5. **Emergency PDA** - Handles emergency procedures

### 🔐 Security Guarantees

- **No Single Point of Failure**: No single person can control the token
- **Deterministic Execution**: All operations follow predefined logic
- **Transparent Authority**: All authorities are on-chain and verifiable
- **Automated Logic**: Critical decisions are programmatic, not human

## 🛡️ Layer 1: Governance PDA

### Purpose
Controls all critical operations including minting, distribution, and emergency controls.

### Authorities
- **Mint Authority**: Only Governance PDA can mint tokens
- **Distribution Authority**: Only Governance PDA can distribute tokens
- **Emergency Controls**: Only Governance PDA can pause/unpause
- **Finalization**: Only Governance PDA can revoke authorities

### Security Features
```rust
pub struct GovernanceState {
    pub unique_seed: u64,
    pub is_initialized: bool,
    pub emergency_paused: bool,
    pub emergency_pause_timestamp: i64,
    pub total_liquidity_locked: u64,
    pub vesting_vaults_locked: bool,
    pub launch_phase_active: bool,
    pub lp_creation_timestamp: i64,
}
```

### Operations
- `initialize_layered()` - Initialize all PDAs
- `activate_launch_phase()` - Activate launch with security measures
- `emergency_pause()` / `emergency_unpause()` - Emergency controls
- `mint_csn()` - Mint tokens (time-locked)
- `distribute()` - Distribute tokens to vaults
- `finalize()` - Revoke all authorities

## 🛡️ Layer 2: Security PDA

### Purpose
Manages access controls, anti-sniping, buy cooldowns, and max wallet limits.

### Authorities
- **Transfer Approval**: Only Security PDA can approve transfers
- **Access Control**: Enforces all security measures
- **Rate Limiting**: Manages cooldowns and limits

### Security Features
```rust
pub struct SecurityState {
    pub unique_seed: u64,
    pub is_initialized: bool,
    pub anti_sniping_active: bool,
    pub buy_cooldown_active: bool,
    pub max_wallet_enforced: bool,
    pub last_buy_timestamps: Vec<i64>,
    pub wallet_balances: Vec<u64>,
}
```

### Operations
- `secure_transfer()` - Transfer with security checks
- Anti-sniping protection (30-second delay)
- Buy cooldown enforcement (30 seconds between buys)
- Max wallet limit enforcement (1% during launch)

## 🛡️ Layer 3: Vesting PDA

### Purpose
Handles all vesting schedules for team, marketing, and LP tokens.

### Authorities
- **Vesting Unlock**: Only Vesting PDA can unlock vesting
- **Schedule Management**: Controls all vesting timelines
- **Claim Tracking**: Tracks claimed amounts

### Security Features
```rust
pub struct VestingState {
    pub unique_seed: u64,
    pub is_initialized: bool,
    pub team_vesting_start: i64,
    pub marketing_vesting_start: i64,
    pub lp_vesting_start: i64,
    pub team_tokens_claimed: u64,
    pub marketing_tokens_claimed: u64,
    pub lp_tokens_claimed: u64,
}
```

### Operations
- `unlock_vesting_vaults()` - Unlock vesting after time period
- Team tokens: 1-year lock
- Marketing tokens: 6-month lock
- LP tokens: 1-year lock

## 🛡️ Layer 4: Liquidity PDA

### Purpose
Manages LP token locking to prevent rug pulls.

### Authorities
- **Liquidity Lock**: Only Liquidity PDA can lock/unlock LP
- **Lock Management**: Controls lock duration and amounts
- **Rug Pull Prevention**: Ensures liquidity cannot be removed

### Security Features
```rust
pub struct LiquidityState {
    pub unique_seed: u64,
    pub is_initialized: bool,
    pub total_locked: u64,
    pub lock_start_timestamp: i64,
    pub lock_duration: i64,
}
```

### Operations
- `lock_liquidity()` - Lock LP tokens
- Minimum 1-year lock duration
- Rug pull protection
- Transparent lock status

## 🔐 PDA Authority Flow

### Initialization Flow
```
1. Initialize Governance PDA (controls all)
2. Initialize Security PDA (access controls)
3. Initialize Vesting PDA (vesting schedules)
4. Initialize Liquidity PDA (LP locking)
5. Create all vaults with Governance PDA authority
6. Mint full supply to distribution vault
```

### Operation Flow
```
User Request → Security PDA Check → Governance PDA Execution → Result
```

### Security Flow
```
Transfer Request → Security Checks → Governance Approval → Token Transfer
```

## 🚀 Launch Security Sequence

### Phase 1: Pre-Launch (PDA Setup)
```rust
// Initialize all PDAs with layered security
initialize_layered(unique_seed)
```

### Phase 2: Launch Activation (Governance Control)
```rust
// Only Governance PDA can activate launch
activate_launch_phase(unique_seed)
```

### Phase 3: Trading (Security Enforcement)
```rust
// All transfers go through Security PDA
secure_transfer(amount)
```

### Phase 4: Post-Launch (Governance Finalization)
```rust
// Only Governance PDA can finalize
finalize(unique_seed)
```

## 🔒 Security Constants

```rust
// PDA Seeds
pub const GOVERNANCE_PDA_SEED: &[u8] = b"governance";
pub const SECURITY_PDA_SEED: &[u8] = b"security";
pub const VESTING_PDA_SEED: &[u8] = b"vesting";
pub const LIQUIDITY_PDA_SEED: &[u8] = b"liquidity";
pub const EMERGENCY_PDA_SEED: &[u8] = b"emergency";

// Security Parameters
pub const ANTI_SNIPE_DELAY: i64 = 30; // 30 seconds
pub const BUY_COOLDOWN_SECONDS: i64 = 30; // 30 seconds
pub const MAX_WALLET_PERCENTAGE: u64 = 1; // 1%
pub const EMERGENCY_PAUSE_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days
```

## 🛠️ Implementation Details

### PDA Derivation
```rust
// Governance PDA
let (governance_pda, governance_bump) = Pubkey::find_program_address(
    &[GOVERNANCE_PDA_SEED, unique_seed.to_le_bytes().as_ref()],
    program_id
);

// Security PDA
let (security_pda, security_bump) = Pubkey::find_program_address(
    &[SECURITY_PDA_SEED, unique_seed.to_le_bytes().as_ref()],
    program_id
);
```

### Authority Verification
```rust
// Only Governance PDA can execute critical operations
require_keys_eq!(
    ctx.accounts.governance.key(),
    ctx.accounts.governance_pda.key(),
    CustomError::Unauthorized
);
```

### PDA Signing
```rust
// Governance PDA signs all critical operations
token_2022::mint_to(
    cpi_ctx.with_signer(&[&[
        GOVERNANCE_PDA_SEED, 
        &unique_seed.to_le_bytes(), 
        &[governance_bump]
    ]]),
    amount
)?;
```

## 🔍 Security Verification

### On-Chain Verification
- All PDAs are deterministic and verifiable
- Authority relationships are transparent
- No private keys required for operations
- All logic is programmatic and auditable

### Off-Chain Verification
- PDA addresses can be calculated independently
- Authority relationships can be verified
- Security measures are transparent
- No hidden backdoors or authorities

## 🚨 Attack Prevention

### Single Point of Failure
- **Prevention**: Multiple PDAs with specific authorities
- **Protection**: No single person can control the token
- **Verification**: All authorities are on-chain

### Authority Abuse
- **Prevention**: PDA-based execution only
- **Protection**: No human-controlled authorities
- **Verification**: All operations are programmatic

### Rug Pull Prevention
- **Prevention**: Liquidity PDA controls LP locking
- **Protection**: Minimum lock duration enforced
- **Verification**: Lock status is transparent

### Bot Attack Prevention
- **Prevention**: Security PDA enforces limits
- **Protection**: Anti-sniping and cooldowns
- **Verification**: All measures are on-chain

## 📊 Security Benefits

### 🔒 **No Single Point of Failure**
- Multiple PDAs with specific authorities
- No single person can control the token
- All operations require PDA consensus

### 🔐 **Deterministic Execution**
- All logic is programmatic
- No human intervention required
- Predictable and auditable behavior

### 🌐 **Transparent Authority**
- All authorities are on-chain
- PDA addresses are deterministic
- Authority relationships are verifiable

### 🤖 **Automated Logic**
- Critical decisions are programmatic
- No human bias or error
- Consistent enforcement of rules

## 🎯 Security Goals Achieved

✅ **PDA for Execution**: All critical operations use PDAs  
✅ **No Single Authority**: Multiple PDAs with specific roles  
✅ **Automated Logic**: Programmatic decision making  
✅ **Transparent Control**: All authorities verifiable on-chain  
✅ **Rug Pull Protection**: Liquidity locking and vesting  
✅ **Bot Attack Prevention**: Anti-sniping and rate limiting  

## 🔗 Implementation Files

- `programs/csn/src/lib.rs` - Layered security implementation
- `scripts/launch_deploy.js` - Automated deployment
- `LAUNCH_GUIDE.md` - Launch procedures
- `SECURITY_SUMMARY.md` - Security documentation

---

## 🚀 Conclusion

The CSN token implements **enterprise-grade layered security** with **PDA-based execution** as the foundation. This ensures:

1. **No single person can move funds or mint tokens**
2. **All critical operations are automated and programmatic**
3. **Security measures are transparent and verifiable**
4. **The token is protected against common DeFi attacks**

**The layered security approach makes CSN one of the most secure tokens in the Solana ecosystem.** 🔒 