import type React from 'react'

import { setMediaStats } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaStatsForm: React.FC = () => {
  const mediaStats = useSoraDevtoolsStore((state) => state.mediaStats)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMediaStats(event.target.checked)
  }
  return (
    <div className="flex items-center">
      <TooltipFormCheck kind="mediaStats" checked={mediaStats} onChange={onChange} disabled={false}>
        Show media stats
      </TooltipFormCheck>
    </div>
  )
}
