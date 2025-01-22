'use client'
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks"
import { WebWalletLoginButton } from "@multiversx/sdk-dapp/UI"
import { logout } from "@multiversx/sdk-dapp/utils"
import { useState, useEffect } from "react"
import { Address, ContractFunction } from "@multiversx/sdk-core"
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers"
import { sendTransactions } from "@multiversx/sdk-dapp/services"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp'

if (!CONTRACT_ADDRESS) {
  throw new Error("Contract address not found in environment variables")
}
try {

  new Address(CONTRACT_ADDRESS)
} catch (error) {
  throw new Error("Invalid contract address format")
}
const provider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
interface Escrow {
  id: number
  seller: string
  buyer: string
  amount: string
  status: 'Active' | 'Released' | 'Cancelled'
}
export default function EscrowDashboard() {
  const { address } = useGetAccountInfo()
  const { isLoggedIn } = useGetLoginInfo()
  const [amount, setAmount] = useState('')
  const [seller, setSeller] = useState('')
  const [buyer, setBuyer] = useState('')
  const [loading, setLoading] = useState(false)
  const [escrows, setEscrows] = useState<Escrow[]>([])
  useEffect(() => {
    if (isLoggedIn && address) {
      fetchEscrows()
    }
  }, [isLoggedIn, address])
  const fetchEscrows = async () => {
    try {
      const contract = new Address(CONTRACT_ADDRESS)
      const userAddress = new Address(address)
      console.log('Fetching for address:', address)
      console.log('Contract address:', CONTRACT_ADDRESS)
      
      const positionQuery = await provider.queryContract({
        address: contract,
        func: new ContractFunction("getEscrows"),
        caller: userAddress,
        getEncodedArguments: () => []
      })
      console.log('Raw query response:', positionQuery)
      console.log('Return data:', positionQuery.returnData)
      const mockEscrows: Escrow[] = [
        { id: 1, seller: 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp', buyer: 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp', amount: '100', status: 'Active' },
        { id: 2, seller: 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp', buyer: 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp', amount: '1000', status: 'Released' },
        { id: 3, seller: 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp', buyer: 'erd1qqqqqqqqqqqqqpgqm2rfthchpx0q3zcwmuh04uynwszdksvm6yps82g2yp', amount: '3500', status: 'Cancelled' },
      ]
      setEscrows(mockEscrows)
    } catch (error) {
      console.error("Error fetching escrows:", error)
      toast.error('Escrow listesi alınırken bir hata oluştu')
    }
  }
  const createEscrow = async () => {
    if (!isLoggedIn || !address) return
    try {
      setLoading(true)
      const escrowValue = parseFloat(amount) * Math.pow(10, 18) 
      const tx = {
        value: escrowValue.toString(),
        data: `createEscrow@${seller}@${buyer}`,
        receiver: CONTRACT_ADDRESS,
        gasLimit: 60000000
      }
      console.log("Transaction:", tx)
      await sendTransactions({
        transactions: tx,
        transactionsDisplayInfo: {
          processingMessage: "Escrow oluşturuluyor...",
          errorMessage: "Escrow oluşturulurken bir hata oluştu",
          successMessage: "Escrow başarıyla oluşturuldu"
        }
      })
      setAmount('')
      setSeller('')
      setBuyer('')
      await fetchEscrows()
    } catch (error) {
      console.error('Error creating escrow:', error)
      toast.error('Escrow oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }
  const updateEscrowStatus = async (escrowId: number, newStatus: 'Released' | 'Cancelled') => {
    if (!isLoggedIn || !address) return
    try {
      setLoading(true)
      const functionName = newStatus === 'Released' ? 'releaseEscrow' : 'cancelEscrow'
      const tx = {
        value: "0",
        data: `${functionName}@${escrowId}`,
        receiver: CONTRACT_ADDRESS,
        gasLimit: 60000000
      }
      console.log("Transaction:", tx)
      await sendTransactions({
        transactions: tx,
        transactionsDisplayInfo: {
          processingMessage: "Escrow durumu güncelleniyor...",
          errorMessage: "Escrow durumu güncellenirken bir hata oluştu",
          successMessage: "Escrow durumu başarıyla güncellendi"
        }
      })
      await fetchEscrows()
    } catch (error) {
      console.error('Error updating escrow status:', error)
      toast.error('Escrow durumu güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }
  return (


    
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Escrow Dashboard</h1>
          {!isLoggedIn ? (
            <WebWalletLoginButton 
              loginButtonText="Cüzdanı Bağla" 
              callbackRoute="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-all duration-300 ease-in-out"
            />
          ) : (
            <Button
              onClick={() => logout()}
              variant="outline"
              disabled={loading}
              className="bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-6 rounded-md transition-all duration-300 ease-in-out"
            >
              {loading ? 'İşlem yapılıyor...' : 'Cüzdanı Ayır'}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Yeni Escrow Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <div className="space-y-4">
                  <p className="text-gray-400">Bağlı Adres: <span className="font-semibold text-white">{address}</span></p>
                  <Input
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    placeholder="Miktar (EGLD)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.001"
                    min="0"
                  />
                  <Input
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    placeholder="Satıcı Adresi"
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                  />
                  <Input
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    placeholder="Alıcı Adresi"
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                  />
                  <Button
                    onClick={createEscrow}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300 ease-in-out"
                  >
                    {loading ? 'Oluşturuluyor...' : 'Escrow Oluştur'}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400">Escrow işlemleri için lütfen cüzdanınızı bağlayın.</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Escrow Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-800">
                      <TableHead className="text-gray-400">ID</TableHead>
                      <TableHead className="text-gray-400">Satıcı</TableHead>
                      <TableHead className="text-gray-400">Alıcı</TableHead>
                      <TableHead className="text-gray-400">Miktar</TableHead>
                      <TableHead className="text-gray-400">Durum</TableHead>
                      <TableHead className="text-gray-400">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escrows.map((escrow) => (
                      <TableRow key={escrow.id} className="border-b border-gray-800">
                        <TableCell className="font-medium text-white">{escrow.id}</TableCell>
                        <TableCell className="text-gray-300">{escrow.seller}</TableCell>
                        <TableCell className="text-gray-300">{escrow.buyer}</TableCell>
                        <TableCell className="text-gray-300">{escrow.amount} EGLD</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            escrow.status === 'Active' ? 'bg-green-900 text-green-300' :
                            escrow.status === 'Released' ? 'bg-blue-900 text-blue-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {escrow.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {escrow.status === 'Active' && (
                            <div className="space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md transition-all duration-300 ease-in-out"
                                onClick={() => updateEscrowStatus(escrow.id, 'Released')}
                                disabled={loading}
                              >
                                Serbest Bırak
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition-all duration-300 ease-in-out"
                                onClick={() => updateEscrowStatus(escrow.id, 'Cancelled')}
                                disabled={loading}
                              >
                                İptal Et
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-400">Escrow listesini görmek için lütfen cüzdanınızı bağlayın.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}
