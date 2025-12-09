import type React from 'react'

import { setDebug } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const DebugButton: React.FC = () => {
  const debug = useSoraDevtoolsStore((state) => state.debug)
  const onClick = (): void => {
    setDebug(!debug)
  }
  const classNames = ['btn', 'btn-light', 'btn-header-debug-mode', 'btn-sm', 'ms-1']
  if (debug) {
    classNames.push('active')
  }
  return (
    <input
      className={classNames.join(' ')}
      type="button"
      name="debug"
      defaultValue="debug"
      onClick={onClick}
    />
  )
}
