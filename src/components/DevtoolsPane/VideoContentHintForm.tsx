import type React from 'react'

import { setVideoContentHint } from '@/app/actions'
import { $videoContentHint } from '@/app/store'
import { VIDEO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoContentHintForm: React.FC = () => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, VIDEO_CONTENT_HINTS)) {
      setVideoContentHint(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="videoContentHint">videoContentHint:</TooltipFormLabel>
      <select
        className="form-select"
        name="videoContentHint"
        value={$videoContentHint.value}
        onChange={onChange}
      >
        {VIDEO_CONTENT_HINTS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </select>
    </div>
  )
}
