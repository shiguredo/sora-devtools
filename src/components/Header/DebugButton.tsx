import React from 'react'

import { setDebug } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

export const DebugButton: React.FC = () => {
  const debug = useAppSelector((state) => state.debug)
  const dispatch = useAppDispatch()
  const onClick = (): void => {
    dispatch(setDebug(!debug))
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
