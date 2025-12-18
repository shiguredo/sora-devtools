import type { FunctionComponent } from 'preact'

import { setDebug } from '@/app/actions'
import { $debug } from '@/app/store'

export const DebugButton: FunctionComponent = () => {
  const onClick = (): void => {
    setDebug(!$debug.value)
  }
  const baseClasses = 'px-2 py-1 text-sm rounded ml-1 cursor-pointer'
  const activeClasses = $debug.value
    ? 'bg-pink-500 text-white hover:bg-pink-600'
    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  return (
    <input
      className={`${baseClasses} ${activeClasses}`}
      type="button"
      name="debug"
      defaultValue="debug"
      onClick={onClick}
    />
  )
}
