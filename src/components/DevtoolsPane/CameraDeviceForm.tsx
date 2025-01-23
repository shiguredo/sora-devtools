import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { useStore } from '@/app/store2'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const CameraDeviceForm: React.FC = () => {
  const cameraDevice = useStore((state) => state.cameraDevice)
  const connectionStatus = useStore((state) => state.soraContents.connectionStatus)
  const sora = useStore((state) => state.soraContents.sora)
  const video = useStore((state) => state.video)
  const disabled = !(sora && connectionStatus === 'connected' ? sora.video : video)
  const setCameraDevice = useStore((state) => state.setCameraDevice)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCameraDevice(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="cameraDevice">
      <TooltipFormCheck
        kind="cameraDevice"
        checked={cameraDevice}
        onChange={onChange}
        disabled={disabled}
      >
        Enable camera device
      </TooltipFormCheck>
    </FormGroup>
  )
}
