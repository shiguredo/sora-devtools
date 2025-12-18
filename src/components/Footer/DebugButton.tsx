import type { FunctionComponent } from 'preact'

import { setDebug } from '@/app/actions'
import { $debug } from '@/app/store'

export const DebugButton: FunctionComponent = () => {
  const onClick = (): void => {
    setDebug(!$debug.value)
  }
  const baseClasses =
    'hidden md:hidden w-16 h-16 rounded-full fixed bottom-6 right-6 opacity-90 cursor-pointer text-white'
  const activeClasses = $debug.value
    ? 'bg-pink-500 hover:bg-pink-600'
    : 'bg-gray-500 hover:bg-gray-600'
  return (
    <div>
      <button type="button" className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
        debug
      </button>
    </div>
  )
}
