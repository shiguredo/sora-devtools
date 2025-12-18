import type { FunctionComponent } from 'preact'

import { setCameraDevice } from '@/app/actions'
import { $cameraDevice, $connectionStatus, $sora, $video } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const CameraDeviceForm: FunctionComponent = () => {
  const disabled = !($sora.value && $connectionStatus.value === 'connected'
    ? $sora.value.video
    : $video.value)
  const onChange = (event: Event): void => {
    setCameraDevice((event.target as HTMLInputElement).checked)
  }
  return (
    <div className="form-inline form-switch">
      <TooltipFormCheck
        kind="cameraDevice"
        checked={$cameraDevice.value}
        onChange={onChange}
        disabled={disabled}
      >
        Enable camera device
      </TooltipFormCheck>
    </div>
  )
}
