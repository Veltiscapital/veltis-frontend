interface Window {
  ethereum: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    isWalletConnect?: boolean;
    providers?: any[];
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
    networkVersion?: string;
    _metamask?: {
      isUnlocked: () => Promise<boolean>;
    };
  };
}

interface EthereumEvent {
  connect: { chainId: string };
  disconnect: { code: number; message: string };
  accountsChanged: string[];
  chainChanged: string;
  message: { type: string; data: unknown };
}

type EthereumEventKeys = keyof EthereumEvent;
type EthereumEventHandler<K extends EthereumEventKeys> = (event: EthereumEvent[K]) => void;
