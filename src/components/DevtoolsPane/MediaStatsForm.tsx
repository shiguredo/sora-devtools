import type React from 'react'

import { setMediaStats } from '@/app/actions'
import { $mediaStats } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaStatsForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMediaStats(event.target.checked)
  }
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck
        kind="mediaStats"
        checked={$mediaStats.value}
        onChange={onChange}
        disabled={false}
      >
        Show media stats
      </TooltipFormCheck>
    </div>
  )
}
