import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setVideoCodecType } from '@/app/actions'
import { $connectionStatus, $videoCodecType } from '@/app/store'
import { VIDEO_CODEC_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const VideoCodecTypeForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, VIDEO_CODEC_TYPES)) {
      setVideoCodecType(event.currentTarget.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="videoCodecType">videoCodecType:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        name="videoCodecType"
        value={$videoCodecType.value}
        onChange={onChange}
        disabled={disabled}
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
