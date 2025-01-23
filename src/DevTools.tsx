import type React from 'react'
import { useEffect } from 'react'

import { disconnectSora, setMediaDevices, unregisterServiceWorker } from '@/app/actions'
import { setInitialParameter } from '@/app/actions'
import { useAppDispatch } from '@/app/hooks'
import { useStore } from '@/app/store'
import { DebugPane } from '@/components/DebugPane'
import { DevtoolsPane } from '@/components/DevtoolsPane'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { MediacaptureRegionTarget } from '@/components/MediacaptureRegionTarget'

const Devtools: React.FC = () => {
  const setURLSearchParams = useStore((state) => state.setURLSearchParams)
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setInitialParameter())

    dispatch(setMediaDevices())
    dispatch(unregisterServiceWorker())

    // Zustand 化
    // URLSearchParams を取得して setURLSearchParams に渡す
    const params = new URLSearchParams(window.location.search)
    setURLSearchParams(params)

    return () => {
      dispatch(disconnectSora())
    }
  }, [dispatch, setURLSearchParams])
  return (
    <>
      <MediacaptureRegionTarget />
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
