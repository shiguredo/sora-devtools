import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMediaStats } from '@/app/actions'
import { $mediaStats } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MediaStatsForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMediaStats(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="mediaStats">
      <TooltipFormCheck
        kind="mediaStats"
        checked={$mediaStats.value}
        onChange={onChange}
        disabled={false}
      >
        Show media stats
      </TooltipFormCheck>
    </FormGroup>
  )
}
