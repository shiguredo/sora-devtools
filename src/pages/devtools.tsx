import type React from 'react'
import { useEffect } from 'react'

import { disconnectSora, setMediaDevices, unregisterServiceWorker } from '@/app/actions'
import { setInitialParameter } from '@/app/actions'
import { useAppDispatch } from '@/app/hooks'
import { DebugPane } from '@/components/DebugPane'
import { DevtoolsPane } from '@/components/DevtoolsPane'
import { Footer } from '@/components/Footer'
import { Head } from '@/components/Head'
import { Header } from '@/components/Header'
import { MediacaptureRegionTarget } from '@/components/MediacaptureRegionTarget'

const Devtools: React.FC = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setInitialParameter())
    dispatch(setMediaDevices())
    dispatch(unregisterServiceWorker())
    return () => {
      dispatch(disconnectSora())
    }
  }, [dispatch])
  return (
    <>
      <MediacaptureRegionTarget />
      <Head />
      <Header />
      <main>
        <div className="container">
          <div className="row">
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
