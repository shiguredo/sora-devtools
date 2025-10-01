import type React from 'react'

import { setResolution } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

type ResolutionData = {
  label: string
  value: string
}

const RESOLUTION_DATA_LIST = [
  { label: '未指定', value: '' },
  { label: '144p', value: '256x144' },
  { label: '240p', value: '320x240' },
  { label: '360p', value: '640x360' },
  { label: '480p', value: '720x480' },
  { label: '540p', value: '960x540' },
  { label: '720p', value: '1280x720' },
  { label: '1080p', value: '1920x1080' },
  { label: '1440p', value: '2560x1440' },
  { label: '2160p', value: '3840x2160' },
]

export const ResolutionForm: React.FC = () => {
  const resolution = useSoraDevtoolsStore((state) => state.resolution)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setResolution(event.target.value)
  }
  const onTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setResolution(event.target.value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="resolution">resolution:</TooltipFormLabel>
      <div className="flex flex-1 gap-1">
        <input
          className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed form-resolution"
          type="text"
          value={resolution}
          onChange={onChange}
          placeholder="未指定"
        />
        <select
          onChange={onTemplateChange}
          value=""
          className="form-template-select px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">未指定</option>
          {RESOLUTION_DATA_LIST.map(({ label, value }) => {
            return (
              <option key={value} value={value}>
                {label} {value !== '' && `(${value})`}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}
