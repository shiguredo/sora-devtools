import type React from 'react'

import { setVideoContentHint } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { VIDEO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoContentHintForm: React.FC = () => {
  const videoContentHint = useSoraDevtoolsStore((state) => state.videoContentHint)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, VIDEO_CONTENT_HINTS)) {
      setVideoContentHint(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="videoContentHint">videoContentHint:</TooltipFormLabel>
      <select
        name="videoContentHint"
        value={videoContentHint}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
