import type React from 'react'

import { setAudioBitRate } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { AUDIO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioBitRateForm: React.FC = () => {
  const audioBitRate = useSoraDevtoolsStore((state) => state.audioBitRate)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioBitRate(event.target.value)
  }
  const onTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setAudioBitRate(event.target.value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <div className="flex flex-1 gap-1">
        <input
          className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed form-audio-bit-rate"
          type="text"
          value={audioBitRate}
          onChange={onChange}
          placeholder="未指定"
          disabled={disabled}
        />
        <select
          onChange={onTemplateChange}
          value=""
          disabled={disabled}
          className="form-template-select px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">未指定</option>
          {AUDIO_BIT_RATES.map((value) => {
            return (
              <option key={value} value={value}>
                {value === '' ? '未指定' : value}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}
