import type React from 'react'
import { FormControl, FormGroup } from 'react-bootstrap'

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
    <FormGroup className="form-inline" controlId="channelId">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <FormControl
        type="text"
        placeholder="ChannelIdを指定"
        value={$channelId.value}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  )
}
