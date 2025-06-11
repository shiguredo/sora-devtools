import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMediaStats } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaStatsForm: React.FC = () => {
  const mediaStats = useSoraDevtoolsStore((state) => state.mediaStats)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMediaStats(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="mediaStats">
      <TooltipFormCheck kind="mediaStats" checked={mediaStats} onChange={onChange} disabled={false}>
        Show media stats
      </TooltipFormCheck>
    </FormGroup>
  )
}
