import type React from 'react'

import { setVideoCodecType } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { VIDEO_CODEC_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoCodecTypeForm: React.FC = () => {
  const videoCodecType = useSoraDevtoolsStore((state) => state.videoCodecType)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, VIDEO_CODEC_TYPES)) {
      setVideoCodecType(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="videoCodecType">videoCodecType:</TooltipFormLabel>
      <select
        name="videoCodecType"
        value={videoCodecType}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {VIDEO_CODEC_TYPES.map((value) => {
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
