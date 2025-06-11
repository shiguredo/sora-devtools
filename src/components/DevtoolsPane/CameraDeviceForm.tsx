import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setCameraDevice } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const CameraDeviceForm: React.FC = () => {
  const cameraDevice = useAppSelector((state) => state.cameraDevice)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const sora = useAppSelector((state) => state.soraContents.sora)
  const video = useAppSelector((state) => state.video)
  const disabled = !(sora && connectionStatus === 'connected' ? sora.video : video)
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
