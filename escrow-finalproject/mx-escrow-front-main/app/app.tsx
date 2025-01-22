'use client'

import { DappProvider } from "@multiversx/sdk-dapp/wrappers/DappProvider"
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal"
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals"
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList"
import EscrowDashboard from "./page"

const App = () => {
  const network = process.env.NEXT_PUBLIC_NETWORK || "devnet"
  
  return (
    <DappProvider
      environment={network}
      customNetworkConfig={{
        name: network,
        apiTimeout: 6000,
        walletConnectV2ProjectId: "",
        chainId: 'D',
        walletAddress: 'https://devnet-wallet.multiversx.com',
        apiAddress: 'https://devnet-api.multiversx.com',
        explorerAddress: 'https://devnet-explorer.multiversx.com'
      }}
    >
      <EscrowDashboard />
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
    </DappProvider>
  )
}

export default App 