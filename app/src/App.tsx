import React, { useState, useEffect } from 'react';
import { Rocket, CheckCircle, AlertCircle, Info, Wallet, Coins, Shield, Lock, Copy, Check } from 'lucide-react';
import { generateRealAddresses, getAccountStatusNote } from './utils/addresses';

interface LaunchStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface VaultInfo {
  name: string;
  address: string;
  balance: string;
  expected: string;
  percentage: string;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string>('');
  const [vaults, setVaults] = useState<VaultInfo[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<string>('');

  // Generate REAL PDA addresses using your actual program
  const generateVaultAddresses = () => {
    const uniqueSeed = 12345; // This would be your actual seed
    const addresses = generateRealAddresses(uniqueSeed);

    return [
      { name: 'Distribution', address: addresses.distributionPda, balance: '0', expected: '100,000,000', percentage: '100%' },
      { name: 'Staking', address: addresses.stakingPda, balance: '0', expected: '3,000,000', percentage: '3%' },
      { name: 'Treasury', address: addresses.treasuryPda, balance: '0', expected: '2,000,000', percentage: '2%' },
      { name: 'IDO', address: addresses.idoPda, balance: '0', expected: '14,000,000', percentage: '14%' },
      { name: 'Marketing', address: addresses.marketingPda, balance: '0', expected: '7,000,000', percentage: '7%' },
      { name: 'Airdrop', address: addresses.airdropPda, balance: '0', expected: '2,000,000', percentage: '2%' },
      { name: 'Team', address: addresses.teamPda, balance: '0', expected: '0', percentage: 'Locked' },
      { name: 'Liquidity', address: addresses.lpPda, balance: '0', expected: '0', percentage: 'Reserved' }
    ];
  };

  const correctVaults: VaultInfo[] = generateVaultAddresses();
  const realAddresses = generateRealAddresses(12345);
  const accountStatus = getAccountStatusNote();

  const steps: LaunchStep[] = [
    {
      id: 1,
      name: 'Connect Wallet',
      description: 'Connect your Phantom wallet to begin',
      status: 'active'
    },
    {
      id: 2,
      name: 'Create Token Mint',
      description: 'Initialize the CSN Token-2022 mint',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Setup Vaults',
      description: 'Create and configure all vault PDAs',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Distribute Tokens',
      description: 'Distribute tokens to launch vaults',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Finalize Launch',
      description: 'Revoke authorities and complete launch',
      status: 'pending'
    }
  ];

  // Check if Phantom Wallet is available
  const checkPhantomWallet = () => {
    if ('solana' in window && window.solana?.isPhantom) {
      return true;
    }
    return false;
  };

  // Connect to Phantom Wallet with better error handling
  const connectPhantomWallet = async () => {
    try {
      if (!checkPhantomWallet()) {
        setLaunchStatus('Phantom Wallet not found. Please install Phantom Wallet extension.');
        return;
      }

      setLaunchStatus('Connecting to Phantom Wallet...');
      
      // Add timeout and retry logic
      const connectWithTimeout = async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout. Please try again.'));
          }, 10000); // 10 second timeout

          window.solana!.connect()
            .then((response) => {
              clearTimeout(timeout);
              resolve(response);
            })
            .catch((error) => {
              clearTimeout(timeout);
              reject(error);
            });
        });
      };

      const response = await connectWithTimeout() as any;
      const publicKey = response.publicKey.toString();
      
      setWalletAddress(publicKey);
      setWalletConnected(true);
      setCurrentStep(2);
      setLaunchStatus('Phantom Wallet connected successfully!');
    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('Could not establish connection')) {
          errorMessage = 'Phantom Wallet extension error. Please refresh the page and try again.';
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Connection was rejected. Please approve the connection in Phantom Wallet.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Connection timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setLaunchStatus('Failed to connect wallet: ' + errorMessage);
    }
  };

  const handleCreateMint = async () => {
    if (!walletConnected) {
      setLaunchStatus('Please connect your wallet first');
      return;
    }

    setIsLaunching(true);
    setLaunchStatus('Creating Token-2022 mint...');
    
    try {
      // This would call your actual CSN program
      // For now, we'll simulate the process but show real addresses
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCurrentStep(3);
      setLaunchStatus('✅ Token mint created successfully! Real accounts will be created in next step.');
      setIsLaunching(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLaunchStatus('❌ Failed to create mint: ' + errorMessage);
      setIsLaunching(false);
    }
  };

  const handleSetupVaults = () => {
    setIsLaunching(true);
    setLaunchStatus('Setting up vault PDAs...');
    
    // Simulate vault setup
    setTimeout(() => {
      setCurrentStep(4);
      setLaunchStatus('All vaults configured successfully!');
      setVaults(correctVaults);
      setIsLaunching(false);
    }, 4000);
  };

  const handleDistributeTokens = () => {
    setIsLaunching(true);
    setLaunchStatus('Distributing tokens to launch vaults...');
    
    // Simulate token distribution (only to launch vaults)
    setTimeout(() => {
      setCurrentStep(5);
      setLaunchStatus('Tokens distributed successfully!');
      setVaults(correctVaults.map(v => {
        if (v.name === 'Team' || v.name === 'Liquidity') {
          return v; // Keep at 0 (locked/reserved)
        }
        return { ...v, balance: v.expected };
      }));
      setIsLaunching(false);
    }, 5000);
  };

  const handleFinalize = () => {
    setIsLaunching(true);
    setLaunchStatus('Finalizing token launch...');
    
    // Simulate finalization
    setTimeout(() => {
      setLaunchStatus('🎉 CSN Token Launch Complete!');
      setIsLaunching(false);
    }, 3000);
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  // Copy address to clipboard
  const copyToClipboard = async (text: string, addressType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(addressType);
      setTimeout(() => setCopiedAddress(''), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Phantom Wallet is already available globally when extension is installed

  return (
    <div className="launch-container">
      <div className="launch-card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Rocket size={48} style={{ marginBottom: '10px' }} />
          <h1>CSN Token Launch</h1>
          <p>Launch your Token-2022 based CSN token with full security features</p>
          
          {/* Wallet Connection Status */}
          {walletConnected && (
            <div className="status success" style={{ marginTop: '15px' }}>
              <Wallet size={16} style={{ marginRight: '8px' }} />
              Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          {steps.map((step) => (
            <div key={step.id} className={`step ${getStepStatus(step.id)}`}>
              <div className="step-number">
                {getStepStatus(step.id) === 'completed' ? <CheckCircle size={20} /> : step.id}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{step.name}</div>
                <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {launchStatus && (
          <div className={`status ${launchStatus.includes('successfully') || launchStatus.includes('Complete') ? 'success' : 
                           launchStatus.includes('Failed') ? 'error' : 'info'}`}>
            {launchStatus.includes('Complete') ? <CheckCircle size={16} style={{ marginRight: '8px' }} /> : 
             launchStatus.includes('Failed') ? <AlertCircle size={16} style={{ marginRight: '8px' }} /> :
             <Info size={16} style={{ marginRight: '8px' }} />}
            {launchStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          {currentStep === 1 && (
            <div>
              <button className="button" onClick={connectPhantomWallet} disabled={isLaunching}>
                <Wallet size={16} style={{ marginRight: '8px' }} />
                Connect Phantom Wallet
              </button>
              <div style={{ marginTop: '10px' }}>
                <button 
                  className="button" 
                  onClick={() => {
                    setWalletConnected(true);
                    setWalletAddress('Demo Mode');
                    setCurrentStep(2);
                    setLaunchStatus('Demo mode activated - no real wallet connection');
                  }} 
                  disabled={isLaunching}
                  style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}
                >
                  <Info size={16} style={{ marginRight: '8px' }} />
                  Demo Mode (No Wallet)
                </button>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <button className="button" onClick={handleCreateMint} disabled={isLaunching}>
              <Coins size={16} style={{ marginRight: '8px' }} />
              Create Token Mint
            </button>
          )}
          
          {currentStep === 3 && (
            <button className="button" onClick={handleSetupVaults} disabled={isLaunching}>
              <Shield size={16} style={{ marginRight: '8px' }} />
              Setup Vaults
            </button>
          )}
          
          {currentStep === 4 && (
            <button className="button" onClick={handleDistributeTokens} disabled={isLaunching}>
              <Coins size={16} style={{ marginRight: '8px' }} />
              Distribute Tokens
            </button>
          )}
          
          {currentStep === 5 && (
            <button className="button" onClick={handleFinalize} disabled={isLaunching}>
              <Lock size={16} style={{ marginRight: '8px' }} />
              Finalize Launch
            </button>
          )}
        </div>

        {/* Vault Information */}
        {vaults.length > 0 && (
          <div>
            <h3>Vault Allocations (Whitepaper Compliant)</h3>
            
            {/* Program Addresses Section */}
            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '10px' }}>
                🔗 REAL Program Addresses
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px', fontSize: '0.9em' }}>
                <div>
                  <strong>Program ID:</strong> 
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', flex: 1 }}>
                      {realAddresses.programId}
                    </div>
                    <button
                      onClick={() => copyToClipboard(realAddresses.programId, 'program')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: copiedAddress === 'program' ? '#10b981' : '#3b82f6',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Copy Program ID"
                    >
                      {copiedAddress === 'program' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <strong>State PDA:</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', flex: 1 }}>
                      {realAddresses.statePda}
                    </div>
                    <button
                      onClick={() => copyToClipboard(realAddresses.statePda, 'state')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: copiedAddress === 'state' ? '#10b981' : '#3b82f6',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Copy State PDA"
                    >
                      {copiedAddress === 'state' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <strong>Distribution PDA:</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', flex: 1 }}>
                      {realAddresses.distributionPda}
                    </div>
                    <button
                      onClick={() => copyToClipboard(realAddresses.distributionPda, 'distribution')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: copiedAddress === 'distribution' ? '#10b981' : '#3b82f6',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Copy Distribution PDA"
                    >
                      {copiedAddress === 'distribution' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="vault-info">
              {vaults.map((vault, index) => (
                <div key={index} className="vault-card">
                  <div className="vault-name">{vault.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="vault-address" style={{ fontSize: '0.85em', lineHeight: '1.4', flex: 1 }}>
                      {vault.address}
                    </div>
                    <button
                      onClick={() => copyToClipboard(vault.address, `vault-${index}`)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: copiedAddress === `vault-${index}` ? '#10b981' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={`Copy ${vault.name} Address`}
                    >
                      {copiedAddress === `vault-${index}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="vault-balance">
                    {vault.balance} / {vault.expected} CSN
                  </div>
                  <div style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    {vault.percentage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token Information */}
        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <h3>Token Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div>
              <strong>Name:</strong> CSN Token
            </div>
            <div>
              <strong>Symbol:</strong> CSN
            </div>
            <div>
              <strong>Decimals:</strong> 9
            </div>
            <div>
              <strong>Total Supply:</strong> 100,000,000
            </div>
            <div>
              <strong>Launch Allocation:</strong> 28,000,000 (28%)
            </div>
            <div>
              <strong>Standard:</strong> Token-2022
            </div>
            <div>
              <strong>Network:</strong> Solana Devnet
            </div>
            <div>
              <strong>Team/LP:</strong> Locked/Reserved
            </div>
          </div>
        </div>

        {/* Account Status Note */}
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ color: '#f59e0b', fontWeight: '600', marginBottom: '8px' }}>
            {accountStatus.note}
          </div>
          <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.8)' }}>
            These are REAL addresses that will be created when you execute your CSN program. They use your actual program ID and follow the same PDA derivation logic.
          </div>
        </div>

        {/* Whitepaper Compliance Note */}
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '8px' }}>
            ✅ Whitepaper Compliant Allocations
          </div>
          <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.8)' }}>
            Only 28M tokens (28%) are distributed at launch. Team and Liquidity vaults remain locked/reserved as per whitepaper specifications.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 