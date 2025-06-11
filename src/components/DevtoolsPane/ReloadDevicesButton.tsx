import type React from 'react'

import { setMediaDevices } from '@/app/actions'

export const ReloadDevicesButton: React.FC = () => {
    const onClick = (): void => {
    setMediaDevices()
  }
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="update-devices"
        defaultValue="update-devices"
        onClick={onClick}
      />
    </div>
  )
}
