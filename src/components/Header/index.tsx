import { useSignal } from '@preact/signals'
import type React from 'react'

import { $connectionStatus, $sora, $turnUrl } from '@/app/store'

import { CopyUrlButton } from './CopyUrlButton.tsx'
import { DebugButton } from './DebugButton.tsx'
import { DownloadReportButton } from './DownloadReportButton.tsx'

export const Header: React.FC = () => {
  const isNavCollapsed = useSignal(true)

  const turnUrlLabel = (() => {
    if ($sora.value && $connectionStatus.value === 'connected') {
      return $turnUrl.value !== null ? $turnUrl.value : '不明'
    }
    return 'TURN URL'
  })()

  const toggleNavbar = () => {
    isNavCollapsed.value = !isNavCollapsed.value
  }

  return (
    <header>
      <nav className="navbar navbar-dark bg-sora navbar-expand-lg fixed-top">
        <div className="container">
          <a className="navbar-brand" href="/">
            Sora DevTools
          </a>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbar-collapse"
            aria-expanded={!isNavCollapsed.value}
            aria-label="Toggle navigation"
            onClick={toggleNavbar}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`collapse navbar-collapse${isNavCollapsed.value ? '' : ' show'}`}
            id="navbar-collapse"
          >
            <div className="navbar-nav me-auto" />
            <div className="navbar-nav">
              <span className="navbar-text py-0 my-1 mx-1">
                <p className="navbar-signaling-url border rounded">
                  {$sora.value && $connectionStatus.value === 'connected'
                    ? $sora.value.connectedSignalingUrl
                    : 'Signaling URL'}
                </p>
              </span>
              <span className="navbar-text py-0 my-1 mx-1">
                <p className="navbar-turn-url border rounded">{turnUrlLabel}</p>
              </span>
              <span className="navbar-text py-0 my-1 mx-1">
                <DebugButton />
              </span>
              <span className="navbar-text py-0 my-1 mx-1">
                <DownloadReportButton />
              </span>
              <span className="navbar-text py-0 my-1 ms-1">
                <CopyUrlButton />
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
