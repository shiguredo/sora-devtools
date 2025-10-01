import type React from 'react'

import { setAudioContentHint } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { AUDIO_CONTENT_HINTS } from '@/constants'
import { checkFormValue } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioContentHintForm: React.FC = () => {
  const audioContentHint = useSoraDevtoolsStore((state) => state.audioContentHint)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, AUDIO_CONTENT_HINTS)) {
      setAudioContentHint(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="audioContentHint">audioContentHint:</TooltipFormLabel>
      <select
        name="audioContentHint"
        value={audioContentHint}
        onChange={onChange}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
