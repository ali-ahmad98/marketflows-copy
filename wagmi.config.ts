import { http, createConfig, createStorage, injected } from 'wagmi'
import { mainnet, base, baseSepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  storage: createStorage({ storage: window.localStorage }), 
  connectors: [walletConnect({projectId: '0897d453eda6dd603d65558c9c593edc'})],
})