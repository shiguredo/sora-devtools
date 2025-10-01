import type React from 'react'

import { setDebugFilterText } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const DebugFilter: React.FC = () => {
  const debugFilterText = useSoraDevtoolsStore((state) => state.debugFilterText)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDebugFilterText(event.target.value)
  }
  return (
    <div className="flex items-center gap-2 debug-filter">
      <label className="text-white text-sm font-medium" htmlFor="channelId">
        Filter:
      </label>
      <input
        id="channelId"
        type="text"
        placeholder="Filter"
        value={debugFilterText}
        onChange={onChange}
        autoComplete="off"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
