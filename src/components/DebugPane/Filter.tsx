import type React from 'react'

import { setDebugFilterText } from '@/app/actions'
import { $debugFilterText } from '@/app/store'

export const DebugFilter: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDebugFilterText(event.target.value)
  }
  return (
    <div className="form-inline debug-filter">
      <label className="form-label text-white" htmlFor="channelIdFilter">
        Filter:
      </label>
      <input
        type="text"
        id="channelIdFilter"
        className="form-control"
        placeholder="Filter"
        value={$debugFilterText.value}
        onChange={onChange}
        autoComplete="off"
      />
    </div>
  )
}
