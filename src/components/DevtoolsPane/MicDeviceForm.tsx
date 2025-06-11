import type React from 'react'
import { FormGroup } from 'react-bootstrap'

import { setMicDevice } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MicDeviceForm: React.FC = () => {
  const micDevice = useAppSelector((state) => state.micDevice)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const sora = useAppSelector((state) => state.soraContents.sora)
  const audio = useAppSelector((state) => state.audio)
  const disabled = !(sora && connectionStatus === 'connected' ? sora.audio : audio)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMicDevice(event.target.checked)
  }
  return (
    <FormGroup className="form-inline" controlId="micDevice">
      <TooltipFormCheck
        kind="micDevice"
        checked={micDevice}
        onChange={onChange}
        disabled={disabled}
      >
        Enable mic device
      </TooltipFormCheck>
    </FormGroup>
  )
}
