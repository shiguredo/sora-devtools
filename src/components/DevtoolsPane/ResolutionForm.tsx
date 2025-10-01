import type React from 'react'

import { setResolution } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { DropdownSelect } from './DropdownSelect.tsx'
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
  const onTemplateChange = (value: string): void => {
    setResolution(value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="resolution">resolution:</TooltipFormLabel>
      <div className="flex form-resolution">
        <input
          className="w-full px-3 py-1.5 text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-0"
          type="text"
          value={resolution}
          onChange={onChange}
          placeholder="未指定"
        />
        <DropdownSelect
          options={RESOLUTION_DATA_LIST.map((item) => item.value)}
          value={resolution}
          onChange={onTemplateChange}
          renderOption={(value) => {
            const item = RESOLUTION_DATA_LIST.find((d) => d.value === value)
            return {
              label: item ? `${item.label} ${value !== '' ? `(${value})` : ''}` : value,
              disabled: false,
            }
          }}
        />
      </div>
    </div>
  )
}
