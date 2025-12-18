import type React from 'react'

import { setChannelId } from '@/app/actions'
import { $channelId, $connectionStatus } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ChannelIdForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChannelId(event.target.value)
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <input
        className="form-control"
        type="text"
        placeholder="ChannelIdを指定"
        value={$channelId.value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
