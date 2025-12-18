import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setDebugFilterText } from '@/app/actions'
import { $debugFilterText } from '@/app/store'

export const DebugFilter: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setDebugFilterText(event.currentTarget.value)
  }
  return (
    <div className="form-inline debug-filter">
      <label className="form-label text-white" htmlFor="channelIdFilter">
        Filter:
      </label>
      <input
        type="text"
        id="channelIdFilter"
        className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Filter"
        value={$debugFilterText.value}
        onChange={onChange}
        autoComplete="off"
      />
    </div>
  )
}
