'use client'

import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider"
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal"
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals"
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList"

const dappConfig = {
  environment: 'devnet',
  customNetworkConfig: {
    name: 'devnet',
    apiTimeout: 6000,
    walletConnectV2ProjectId: '',
    chainId: 'D',
    walletAddress: 'https://devnet-wallet.multiversx.com',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com',
    walletConnectDeepLink: 'https://maiar.page.link/?apn=com.multiversx.maiar.wallet&isi=1519405832&ibi=com.multiversx.maiar.wallet&link=https://maiar.com/'
  },
  walletConnectV2: {
    projectId: '',
    relayUrl: 'wss://relay.walletconnect.com'
  },
  shouldUseWebViewProvider: false,
  mvxDappConfig: {
    loginRoute: window?.location?.origin || 'http://localhost:3000',
    callbackRoute: window?.location?.origin || 'http://localhost:3000',
    logoutRoute: window?.location?.origin || 'http://localhost:3000',
    nativeAuth: {
      enabled: true,
      allowedOrigins: [window?.location?.origin || 'http://localhost:3000'],
      loginButtonContent: 'Cüzdanı Bağla'
    }
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DappProvider {...dappConfig}>
      {children}
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
    </DappProvider>
  )
} 