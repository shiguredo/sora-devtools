import type React from 'react'

import { setAudioBitRate } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { AUDIO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

import { DropdownSelect } from './DropdownSelect.tsx'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioBitRateForm: React.FC = () => {
  const audioBitRate = useSoraDevtoolsStore((state) => state.audioBitRate)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioBitRate(event.target.value)
  }
  const onTemplateChange = (value: string): void => {
    setAudioBitRate(value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <div className="flex form-audio-bit-rate">
        <input
          className="w-full px-3 py-1.5 text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-0"
          type="text"
          value={audioBitRate}
          onChange={onChange}
          placeholder="未指定"
          disabled={disabled}
        />
        <DropdownSelect
          options={AUDIO_BIT_RATES}
          value={audioBitRate}
          onChange={onTemplateChange}
          disabled={disabled}
          renderOption={(value) => ({
            label: value === '' ? '未指定' : value,
            disabled: false,
          })}
        />
      </div>
    </div>
  )
}
