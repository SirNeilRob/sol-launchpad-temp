#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 🚀 CSN Token Launch Deployment Script
// This script automates the complete launch process with security measures

const CONFIG = {
  // Network configuration
  NETWORK: process.env.NETWORK || 'mainnet', // devnet, testnet, mainnet
  PROGRAM_ID: '7ZZQ1sXhFh5pkwaqGxtukNo9ma4n4VLjszzk3hChj5tN',
  
  // Launch parameters
  MINT_AUTHORITY: process.env.MINT_AUTHORITY || '', // Multi-sig address
  UNIQUE_SEED: Date.now(), // Timestamp-based seed
  
  // Security settings
  ANTI_SNIPE_DELAY: 30, // seconds
  BUY_COOLDOWN: 30, // seconds
  MAX_WALLET_PERCENTAGE: 1, // 1%
  EMERGENCY_PAUSE_DURATION: 7 * 24 * 60 * 60, // 7 days
  
  // Liquidity settings
  INITIAL_LIQUIDITY_USD: 10000, // $10,000
  LP_LOCK_AMOUNT: 1000000, // LP tokens to lock
  
  // Vesting settings
  TEAM_LOCK_DURATION: 365 * 24 * 60 * 60, // 1 year
  MARKETING_LOCK_DURATION: 180 * 24 * 60 * 60, // 6 months
  LP_LOCK_DURATION: 365 * 24 * 60 * 60, // 1 year
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}=== ${step} ===${colors.reset}`, 'bright');
  log(message, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Execute command and return result
function executeCommand(command, description) {
  try {
    logInfo(`Executing: ${description}`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    logSuccess(`${description} completed successfully`);
    return result;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    throw error;
  }
}

// Check prerequisites
function checkPrerequisites() {
  logStep('PREREQUISITES', 'Checking system requirements...');
  
  // Check if Anchor is installed
  try {
    execSync('anchor --version', { stdio: 'pipe' });
    logSuccess('Anchor CLI installed');
  } catch (error) {
    logError('Anchor CLI not found. Please install Anchor first.');
    process.exit(1);
  }
  
  // Check if Solana CLI is installed
  try {
    execSync('solana --version', { stdio: 'pipe' });
    logSuccess('Solana CLI installed');
  } catch (error) {
    logError('Solana CLI not found. Please install Solana CLI first.');
    process.exit(1);
  }
  
  // Check if wallet is configured
  try {
    const wallet = execSync('solana address', { encoding: 'utf8' }).trim();
    logSuccess(`Wallet configured: ${wallet}`);
  } catch (error) {
    logError('No wallet configured. Please run: solana config set --keypair <path>');
    process.exit(1);
  }
  
  // Check if we're on the right network
  try {
    const network = execSync('solana config get', { encoding: 'utf8' });
    if (!network.includes(CONFIG.NETWORK)) {
      logWarning(`Current network doesn't match target (${CONFIG.NETWORK})`);
      logInfo(`Run: solana config set --url https://api.${CONFIG.NETWORK}.solana.com`);
    } else {
      logSuccess(`Connected to ${CONFIG.NETWORK}`);
    }
  } catch (error) {
    logError('Failed to check network configuration');
  }
}

// Build the program
function buildProgram() {
  logStep('BUILD', 'Building CSN token program...');
  
  try {
    executeCommand('anchor build', 'Building program');
    
    // Verify program ID
    const idlPath = path.join(__dirname, '../target/idl/csn.json');
    if (fs.existsSync(idlPath)) {
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
      logSuccess(`Program built successfully. IDL generated.`);
    } else {
      logError('IDL file not found after build');
      process.exit(1);
    }
  } catch (error) {
    logError('Build failed');
    process.exit(1);
  }
}

// Deploy to target network
function deployProgram() {
  logStep('DEPLOY', `Deploying to ${CONFIG.NETWORK}...`);
  
  try {
    const deployCommand = `anchor deploy --provider.cluster ${CONFIG.NETWORK}`;
    const result = executeCommand(deployCommand, 'Deploying program');
    
    // Extract program ID from deployment
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.includes('Program Id:')) {
        const programId = line.split('Program Id:')[1].trim();
        logSuccess(`Program deployed: ${programId}`);
        break;
      }
    }
  } catch (error) {
    logError('Deployment failed');
    process.exit(1);
  }
}

// Initialize the token
function initializeToken() {
  logStep('INITIALIZE', 'Initializing CSN token with security measures...');
  
  if (!CONFIG.MINT_AUTHORITY) {
    logError('MINT_AUTHORITY not set. Please set the multi-sig address.');
    process.exit(1);
  }
  
  try {
    const initCommand = `anchor run initialize --mint-authority ${CONFIG.MINT_AUTHORITY} --unique-seed ${CONFIG.UNIQUE_SEED}`;
    executeCommand(initCommand, 'Initializing token');
    
    logSuccess('Token initialized with security measures');
    logInfo(`Unique seed: ${CONFIG.UNIQUE_SEED}`);
    logInfo(`Mint authority: ${CONFIG.MINT_AUTHORITY}`);
  } catch (error) {
    logError('Token initialization failed');
    process.exit(1);
  }
}

// Distribute tokens to vaults
function distributeTokens() {
  logStep('DISTRIBUTE', 'Distributing tokens to launch vaults...');
  
  try {
    const distributeCommand = `anchor run distribute --unique-seed ${CONFIG.UNIQUE_SEED}`;
    executeCommand(distributeCommand, 'Distributing tokens');
    
    logSuccess('Tokens distributed to all vaults');
    logInfo('Launch allocations completed');
  } catch (error) {
    logError('Token distribution failed');
    process.exit(1);
  }
}

// Lock liquidity
function lockLiquidity() {
  logStep('LOCK LIQUIDITY', 'Locking initial liquidity...');
  
  try {
    const lockCommand = `anchor run lock-liquidity --unique-seed ${CONFIG.UNIQUE_SEED} --lock-amount ${CONFIG.LP_LOCK_AMOUNT}`;
    executeCommand(lockCommand, 'Locking liquidity');
    
    logSuccess(`Liquidity locked: ${CONFIG.LP_LOCK_AMOUNT} LP tokens`);
    logInfo('Rug pull protection activated');
  } catch (error) {
    logError('Liquidity locking failed');
    process.exit(1);
  }
}

// Activate launch phase
function activateLaunchPhase() {
  logStep('LAUNCH ACTIVATION', 'Activating launch phase with security measures...');
  
  try {
    const activateCommand = `anchor run activate-launch-phase --unique-seed ${CONFIG.UNIQUE_SEED}`;
    executeCommand(activateCommand, 'Activating launch phase');
    
    logSuccess('Launch phase activated');
    logInfo(`Anti-sniping protection: ${CONFIG.ANTI_SNIPE_DELAY} seconds`);
    logInfo(`Buy cooldown: ${CONFIG.BUY_COOLDOWN} seconds`);
    logInfo(`Max wallet limit: ${CONFIG.MAX_WALLET_PERCENTAGE}%`);
  } catch (error) {
    logError('Launch phase activation failed');
    process.exit(1);
  }
}

// Finalize authorities
function finalizeAuthorities() {
  logStep('FINALIZE', 'Finalizing token authorities...');
  
  try {
    const finalizeCommand = `anchor run finalize --unique-seed ${CONFIG.UNIQUE_SEED}`;
    executeCommand(finalizeCommand, 'Finalizing authorities');
    
    logSuccess('Token authorities finalized');
    logInfo('Token is now immutable');
  } catch (error) {
    logError('Authority finalization failed');
    process.exit(1);
  }
}

// Generate launch report
function generateLaunchReport() {
  logStep('REPORT', 'Generating launch report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    network: CONFIG.NETWORK,
    programId: CONFIG.PROGRAM_ID,
    uniqueSeed: CONFIG.UNIQUE_SEED,
    mintAuthority: CONFIG.MINT_AUTHORITY,
    securityMeasures: {
      antiSnipingDelay: CONFIG.ANTI_SNIPE_DELAY,
      buyCooldown: CONFIG.BUY_COOLDOWN,
      maxWalletPercentage: CONFIG.MAX_WALLET_PERCENTAGE,
      emergencyPauseDuration: CONFIG.EMERGENCY_PAUSE_DURATION,
      lpLockAmount: CONFIG.LP_LOCK_AMOUNT,
    },
    vestingSchedule: {
      teamLockDuration: CONFIG.TEAM_LOCK_DURATION,
      marketingLockDuration: CONFIG.MARKETING_LOCK_DURATION,
      lpLockDuration: CONFIG.LP_LOCK_DURATION,
    },
    tokenDistribution: {
      stakingRewards: '3M CSN (3%)',
      treasury: '2M CSN (2%)',
      ido: '14M CSN (14%)',
      marketing: '7M CSN (7%)',
      airdrop: '2M CSN (2%)',
      team: 'Locked (1 year)',
      lp: 'Locked (1 year)',
    },
  };
  
  const reportPath = path.join(__dirname, `../launch-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Launch report generated: ${reportPath}`);
  return report;
}

// Main launch sequence
async function launchSequence() {
  log(`${colors.bright}${colors.magenta}🚀 CSN Token Launch Sequence${colors.reset}`, 'bright');
  log(`${colors.cyan}Network: ${CONFIG.NETWORK}${colors.reset}`, 'cyan');
  log(`${colors.cyan}Program ID: ${CONFIG.PROGRAM_ID}${colors.reset}`, 'cyan');
  log(`${colors.cyan}Unique Seed: ${CONFIG.UNIQUE_SEED}${colors.reset}`, 'cyan');
  
  try {
    // Phase 1: Pre-launch setup
    checkPrerequisites();
    buildProgram();
    deployProgram();
    
    // Phase 2: Token initialization
    initializeToken();
    distributeTokens();
    lockLiquidity();
    
    // Phase 3: Launch activation
    activateLaunchPhase();
    
    // Phase 4: Post-launch (optional - can be done later)
    // finalizeAuthorities();
    
    // Generate report
    const report = generateLaunchReport();
    
    log(`\n${colors.bright}${colors.green}🎉 LAUNCH SEQUENCE COMPLETED SUCCESSFULLY!${colors.reset}`, 'bright');
    log(`${colors.green}CSN Token is now live on ${CONFIG.NETWORK} with full security measures.${colors.reset}`, 'green');
    
    log(`\n${colors.yellow}Next steps:${colors.reset}`, 'yellow');
    log('1. Create liquidity pool on DEX', 'yellow');
    log('2. Monitor trading activity', 'yellow');
    log('3. Engage with community', 'yellow');
    log('4. Finalize authorities when ready', 'yellow');
    
  } catch (error) {
    logError('Launch sequence failed');
    logError(error.message);
    process.exit(1);
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log(`${colors.cyan}CSN Token Launch Script${colors.reset}`, 'bright');
    log('Usage: node launch_deploy.js [options]', 'cyan');
    log('', 'cyan');
    log('Options:', 'cyan');
    log('  --network <network>    Target network (devnet, testnet, mainnet)', 'cyan');
    log('  --mint-authority <addr> Multi-sig wallet address', 'cyan');
    log('  --help, -h            Show this help message', 'cyan');
    log('', 'cyan');
    log('Environment Variables:', 'cyan');
    log('  NETWORK              Target network', 'cyan');
    log('  MINT_AUTHORITY       Multi-sig wallet address', 'cyan');
    return;
  }
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      CONFIG.NETWORK = args[i + 1];
    } else if (args[i] === '--mint-authority' && i + 1 < args.length) {
      CONFIG.MINT_AUTHORITY = args[i + 1];
    }
  }
  
  // Validate configuration
  if (!['devnet', 'testnet', 'mainnet'].includes(CONFIG.NETWORK)) {
    logError('Invalid network. Use: devnet, testnet, or mainnet');
    process.exit(1);
  }
  
  if (!CONFIG.MINT_AUTHORITY) {
    logError('MINT_AUTHORITY is required. Set via --mint-authority or MINT_AUTHORITY env var');
    process.exit(1);
  }
  
  // Start launch sequence
  launchSequence();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  CONFIG,
  launchSequence,
  checkPrerequisites,
  buildProgram,
  deployProgram,
  initializeToken,
  distributeTokens,
  lockLiquidity,
  activateLaunchPhase,
  finalizeAuthorities,
  generateLaunchReport,
}; 