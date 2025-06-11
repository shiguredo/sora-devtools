import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setCameraDevice } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const CameraDeviceForm: React.FC = () => {
  const cameraDevice = useSoraDevtoolsStore((state) => state.cameraDevice)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const video = useSoraDevtoolsStore((state) => state.video)
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
