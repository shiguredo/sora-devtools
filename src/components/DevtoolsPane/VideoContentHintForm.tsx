import React from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'

import { setVideoContentHint } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { VIDEO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel'

export const VideoContentHintForm: React.FC = () => {
  const videoContentHint = useAppSelector((state) => state.videoContentHint)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, VIDEO_CONTENT_HINTS)) {
      dispatch(setVideoContentHint(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="videoContentHint">
      <TooltipFormLabel kind="videoContentHint">videoContentHint:</TooltipFormLabel>
      <FormSelect name="videoContentHint" value={videoContentHint} onChange={onChange}>
        {VIDEO_CONTENT_HINTS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}
