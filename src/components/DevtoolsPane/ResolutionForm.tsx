import type { FunctionComponent } from 'preact'

import { setResolution } from '@/app/actions'
import { $resolution } from '@/app/store'

import { DropdownInput } from './DropdownInput.tsx'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

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

export const ResolutionForm: FunctionComponent = () => {
  const onChange = (event: Event): void => {
    setResolution((event.target as HTMLInputElement).value)
  }
  const items = RESOLUTION_DATA_LIST.map(({ label, value }) => ({
    label: value !== '' ? `${label} (${value})` : label,
    value,
  }))
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="resolution">resolution:</TooltipFormLabel>
      <DropdownInput
        inputClassName="form-resolution"
        inputValue={$resolution.value}
        inputPlaceholder="未指定"
        onInputChange={onChange}
        items={items}
        onItemClick={setResolution}
      />
    </div>
  )
}
