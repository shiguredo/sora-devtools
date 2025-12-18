import type { FunctionComponent } from 'preact'

import { setVideoContentHint } from '@/app/actions'
import { $videoContentHint } from '@/app/store'
import { VIDEO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoContentHintForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, VIDEO_CONTENT_HINTS)) {
      setVideoContentHint(value as (typeof VIDEO_CONTENT_HINTS)[number])
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="videoContentHint">videoContentHint:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
