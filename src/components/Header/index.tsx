import type React from 'react'

import { useSoraDevtoolsStore } from '@/app/store'

import { CopyUrlButton } from './CopyUrlButton.tsx'
import { DebugButton } from './DebugButton.tsx'
import { DownloadReportButton } from './DownloadReportButton.tsx'

export const Header: React.FC = () => {
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const turnUrl = useSoraDevtoolsStore((state) => state.soraContents.turnUrl)
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const turnUrlLabel = (() => {
    if (sora && connectionStatus === 'connected') {
      return turnUrl !== null ? turnUrl : '不明'
    }
    return 'TURN URL'
  })()
  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sora">
        <div className="container max-w-none">
          <div className="flex items-center justify-between py-2">
            <a href="/" className="text-white text-xl font-bold no-underline">
              Sora DevTools
            </a>
            <button className="lg:hidden" aria-controls="navbar-collapse">
              Menu
            </button>
            <div id="navbar-collapse" className="hidden lg:flex lg:items-center lg:w-auto lg:gap-2">
              <div className="flex-grow" />
              <div className="flex items-center gap-2">
                <p className="min-w-[250px] text-sm text-white border border-white rounded px-2 py-1 m-0 whitespace-nowrap">
                  {sora && connectionStatus === 'connected'
                    ? sora.connectedSignalingUrl
                    : 'Signaling URL'}
                </p>
                <p className="min-w-[250px] text-sm text-white border border-white rounded px-2 py-1 m-0 whitespace-nowrap">
                  {turnUrlLabel}
                </p>
                <DebugButton />
                <DownloadReportButton />
                <CopyUrlButton />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
