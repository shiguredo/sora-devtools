import type React from 'react'

import { setFrameRate } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { DropdownSelect } from './DropdownSelect.tsx'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

type FrameRateData = {
  label: string
  value: string
}

const FRAME_RATE_DATA = [
  { label: '未指定', value: '' },
  { label: '60', value: '60' },
  { label: '30', value: '30' },
  { label: '24', value: '24' },
  { label: '20', value: '20' },
  { label: '15', value: '15' },
  { label: '10', value: '10' },
  { label: '5', value: '5' },
]

export const FrameRateForm: React.FC = () => {
  const frameRate = useSoraDevtoolsStore((state) => state.frameRate)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFrameRate(event.target.value)
  }
  const onTemplateChange = (value: string): void => {
    setFrameRate(value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="frameRate">frameRate:</TooltipFormLabel>
      <div className="flex form-frame-rate">
        <input
          className="w-full px-3 py-1.5 text-base border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-0"
          type="text"
          value={frameRate}
          onChange={onChange}
          placeholder="未指定"
        />
        <DropdownSelect
          options={FRAME_RATE_DATA.map((item) => item.value)}
          value={frameRate}
          onChange={onTemplateChange}
          renderOption={(value) => ({
            label: value === '' ? '未指定' : value,
            disabled: false,
          })}
        />
      </div>
    </div>
  )
}
