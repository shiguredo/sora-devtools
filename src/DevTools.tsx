import type React from 'react'
import { useEffect } from 'react'

import { disconnectSora, setMediaDevices, unregisterServiceWorker } from '@/app/actions'
import { setInitialParameter } from '@/app/actions'
import { DebugPane } from '@/components/DebugPane'
import { DevtoolsPane } from '@/components/DevtoolsPane'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

const Devtools: React.FC = () => {
  useEffect(() => {
    setInitialParameter()
    setMediaDevices()
    unregisterServiceWorker()
    return () => {
      disconnectSora()
    }
  }, [])
  return (
    <>
      <Header />
      <main>
        <div className="container max-w-none">
          <div className="flex flex-wrap">
            <DevtoolsPane />
            <DebugPane />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Devtools
