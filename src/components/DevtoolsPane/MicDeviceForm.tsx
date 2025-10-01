import type React from 'react'

import { setMicDevice } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MicDeviceForm: React.FC = () => {
  const micDevice = useSoraDevtoolsStore((state) => state.micDevice)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const audio = useSoraDevtoolsStore((state) => state.audio)
  const disabled = !(sora && connectionStatus === 'connected' ? sora.audio : audio)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMicDevice(event.target.checked)
  }
  return (
    <div className="flex items-center">
      <TooltipFormCheck
        kind="micDevice"
        checked={micDevice}
        onChange={onChange}
        disabled={disabled}
      >
        Enable mic device
      </TooltipFormCheck>
    </div>
  )
}
