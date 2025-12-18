import type { FunctionComponent } from 'preact'

import { setMicDevice } from '@/app/actions'
import { $audio, $connectionStatus, $micDevice, $sora } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MicDeviceForm: FunctionComponent = () => {
  const disabled = !($sora.value && $connectionStatus.value === 'connected'
    ? $sora.value.audio
    : $audio.value)
  const onChange = (event: Event): void => {
    setMicDevice((event.target as HTMLInputElement).checked)
  }
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck
        kind="micDevice"
        checked={$micDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable mic device
      </TooltipFormCheck>
    </div>
  )
}
