import type React from 'react'

import { setDebug } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'

export const DebugButton: React.FC = () => {
  const debug = useAppSelector((state) => state.debug)
  const onClick = (): void => {
    setDebug(!debug)
  }
  const className = debug ? 'btn btn-footer-debug-mode active' : 'btn btn-footer-debug-mode'
  return (
    <div>
      <button type="button" className={className} onClick={onClick}>
        debug
      </button>
    </div>
  )
}
