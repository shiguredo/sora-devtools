import type React from 'react'
import Sora from 'sora-js-sdk'

import { $version } from '@/app/store'

import { DebugButton } from './DebugButton.tsx'

export const Footer: React.FC = () => {
  return (
    <footer>
      <nav className="navbar navbar-dark bg-sora navbar-expand-md fixed-bottom">
        <div className="navbar-nav me-auto" />
        <div className="navbar-nav">
          <div className="collapse navbar-collapse show" id="navbar-collapse">
            <a
              href="https://github.com/shiguredo/sora-devtools"
              className="btn btn-outline-light m-1"
            >
              GitHub: shiguredo/sora-devtools: {$version.value}
            </a>
            <a
              href="https://github.com/shiguredo/sora-js-sdk"
              className="btn btn-outline-light m-1"
            >
              GitHub: shiguredo/sora-js-sdk: {Sora.version()}
            </a>
          </div>
        </div>
      </nav>
      <DebugButton />
    </footer>
  )
}
