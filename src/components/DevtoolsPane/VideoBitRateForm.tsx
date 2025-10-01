import type React from 'react'

import { setVideoBitRate } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { VIDEO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

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
  const onTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (event.target.value !== 'support-message') {
      setVideoBitRate(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="videoBitRate">videoBitRate:</TooltipFormLabel>
      <div className="flex flex-1 gap-1">
        <input
          className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed form-video-bit-rate"
          type="text"
          value={videoBitRate}
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
          {DISPLAY_VIDEO_BIT_RATE.map((value) => {
            return (
              <option key={value} value={value} disabled={value === 'support-message'}>
                {dropdownItemLabel(value)}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}
