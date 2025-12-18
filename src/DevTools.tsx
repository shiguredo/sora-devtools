import type { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'
import {
  disconnectSora,
  setInitialParameter,
  setMediaDevices,
  unregisterServiceWorker,
} from '@/app/actions'
import { DebugPane } from '@/components/DebugPane'
import { DevtoolsPane } from '@/components/DevtoolsPane'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

const Devtools: FunctionComponent = () => {
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
        <div className="container mx-auto px-4">
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
