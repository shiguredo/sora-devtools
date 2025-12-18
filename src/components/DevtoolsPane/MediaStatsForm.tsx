import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setMediaStats } from '@/app/actions'
import { $mediaStats } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaStatsForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setMediaStats(event.currentTarget.checked)
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
