import type React from 'react'

import { setVideoBitRate } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { VIDEO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

import { DropdownSelect } from './DropdownSelect.tsx'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

// 15000 を超える場合にサポート外であることを表示するためのカスタム
const DISPLAY_VIDEO_BIT_RATE: string[] = VIDEO_BIT_RATES.slice()
DISPLAY_VIDEO_BIT_RATE.splice(VIDEO_BIT_RATES.indexOf('15000') + 1, 0, 'support-message')

const dropdownItemLabel = (value: string) => {
  if (value === 'support-message') {
    return '以下はサポート外です'
  }
  return value === '' ? '未指定' : value
}

export const VideoBitRateForm: React.FC = () => {
  const videoBitRate = useSoraDevtoolsStore((state) => state.videoBitRate)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideoBitRate(event.target.value)
  }
  const onTemplateChange = (value: string): void => {
    if (value !== 'support-message') {
      setVideoBitRate(value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="videoBitRate">videoBitRate:</TooltipFormLabel>
      <div className="flex form-video-bit-rate">
        <input
          className="w-full px-3 py-1.5 text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-0"
          type="text"
          value={videoBitRate}
          onChange={onChange}
          placeholder="未指定"
          disabled={disabled}
        />
        <DropdownSelect
          options={DISPLAY_VIDEO_BIT_RATE}
          value={videoBitRate}
          onChange={onTemplateChange}
          disabled={disabled}
          renderOption={(value) => ({
            label: dropdownItemLabel(value),
            disabled: value === 'support-message',
          })}
        />
      </div>
    </div>
  )
}
