import type React from 'react'

import { useStore } from '@/app/store2'

export const DebugButton: React.FC = () => {
  const debug = useStore((state) => state.debug)
  const setDebug = useStore((state) => state.setDebug)
  const onClick = (): void => {
    setDebug(!debug)
  }
  const classNames = ['btn', 'btn-header-debug-mode', 'btn-sm', 'ms-1']
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
