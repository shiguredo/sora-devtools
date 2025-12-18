import type { FunctionComponent } from 'preact'

import { setAudioContentHint } from '@/app/actions'
import { $audioContentHint } from '@/app/store'
import { AUDIO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioContentHintForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    const value = (event.target as HTMLSelectElement).value
    if (checkFormValue(value, AUDIO_CONTENT_HINTS)) {
      setAudioContentHint(value as (typeof AUDIO_CONTENT_HINTS)[number])
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioContentHint">audioContentHint:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="audioContentHint"
        value={$audioContentHint.value}
        onChange={onChange}
      >
        {AUDIO_CONTENT_HINTS.map((value) => {
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
