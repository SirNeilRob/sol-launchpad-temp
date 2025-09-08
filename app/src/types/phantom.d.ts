interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  publicKey: { toString: () => string } | null;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export {}; 