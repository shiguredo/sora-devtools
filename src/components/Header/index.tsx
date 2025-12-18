import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'

import { $connectionStatus, $sora, $turnUrl } from '@/app/store'

import { CopyUrlButton } from './CopyUrlButton.tsx'
import { DebugButton } from './DebugButton.tsx'
import { DownloadReportButton } from './DownloadReportButton.tsx'

export const Header: FunctionComponent = () => {
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sora flex items-center px-4 h-14">
        <div className="container mx-auto flex items-center justify-between">
          <a className="text-white font-bold text-xl no-underline" href="/">
            Sora DevTools
          </a>
          <button
            className="lg:hidden p-2 text-white"
            type="button"
            aria-controls="navbar-collapse"
            aria-expanded={!isNavCollapsed.value}
            aria-label="Toggle navigation"
            onClick={toggleNavbar}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>メニュー</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div
            className={`${isNavCollapsed.value ? 'hidden' : 'flex'} lg:flex items-center gap-2 absolute lg:relative top-14 lg:top-0 left-0 right-0 bg-sora lg:bg-transparent p-4 lg:p-0 flex-col lg:flex-row`}
            id="navbar-collapse"
          >
            <div className="flex-grow" />
            <div className="flex items-center gap-2 flex-col lg:flex-row">
              <span className="text-white py-0 my-1 mx-1">
                <p className="navbar-signaling-url border border-white/30 rounded px-2 py-1">
                  {$sora.value && $connectionStatus.value === 'connected'
                    ? $sora.value.connectedSignalingUrl
                    : 'Signaling URL'}
                </p>
              </span>
              <span className="text-white py-0 my-1 mx-1">
                <p className="navbar-turn-url border border-white/30 rounded px-2 py-1">
                  {turnUrlLabel}
                </p>
              </span>
              <span className="text-white py-0 my-1 mx-1">
                <DebugButton />
              </span>
              <span className="text-white py-0 my-1 mx-1">
                <DownloadReportButton />
              </span>
              <span className="text-white py-0 my-1 ml-1">
                <CopyUrlButton />
              </span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
