import { useState, useEffect } from 'react'
import { ExtensionProvider } from '@multiversx/sdk-extension-provider'

export function useProvider() {
  const [provider, setProvider] = useState<ExtensionProvider | null>(null)
  const [isProviderReady, setIsProviderReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initProvider = async () => {
      try {
        const extensionProvider = ExtensionProvider.getInstance()
        await extensionProvider.init()
        if (isMounted) {
          setProvider(extensionProvider)
          setIsProviderReady(true)
          console.log("Provider initialized successfully")
        }
      } catch (error) {
        console.error("Failed to initialize provider:", error)
        if (isMounted) {
          setIsProviderReady(false)
        }
      }
    }

    initProvider()

    return () => {
      isMounted = false
    }
  }, [])

  return { provider, isProviderReady }
}

