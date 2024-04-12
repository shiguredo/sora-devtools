import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMediaStats } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormCheck } from './TooltipFormCheck'

export const MediaStatsForm: React.FC = () => {
  const mediaStats = useAppSelector((state) => state.mediaStats)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMediaStats(event.target.checked))
  }
  return (
    <FormGroup className="form-inline" controlId="mediaStats">
      <TooltipFormCheck kind="mediaStats" checked={mediaStats} onChange={onChange} disabled={false}>
        Show media stats
      </TooltipFormCheck>
    </FormGroup>
  )
}
