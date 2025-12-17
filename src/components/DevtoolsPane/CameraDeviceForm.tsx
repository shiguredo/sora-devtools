import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setCameraDevice } from '@/app/actions'
import { $cameraDevice, $connectionStatus, $sora, $video } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const CameraDeviceForm: React.FC = () => {
  const disabled = !($sora.value && $connectionStatus.value === 'connected'
    ? $sora.value.video
    : $video.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCameraDevice(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="cameraDevice">
      <TooltipFormCheck
        kind="cameraDevice"
        checked={$cameraDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable camera device
      </TooltipFormCheck>
    </FormGroup>
  )
}
