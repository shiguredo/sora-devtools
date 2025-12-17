import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMicDevice } from '@/app/actions'
import { $audio, $connectionStatus, $micDevice, $sora } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MicDeviceForm: React.FC = () => {
  const disabled = !($sora.value && $connectionStatus.value === 'connected'
    ? $sora.value.audio
    : $audio.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMicDevice(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="micDevice">
      <TooltipFormCheck
        kind="micDevice"
        checked={$micDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable mic device
      </TooltipFormCheck>
    </FormGroup>
  )
}
