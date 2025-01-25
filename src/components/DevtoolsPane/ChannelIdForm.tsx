import type React from 'react'
import { FormControl, FormGroup } from 'react-bootstrap'

import { useAppSelector } from '@/app/hooks'
import { useStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ChannelIdForm: React.FC = () => {
  const { channelId, setChannelId } = useStore()
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChannelId(event.target.value)
  }
  return (
    <FormGroup className="form-inline" controlId="channelId">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <FormControl
        type="text"
        placeholder="ChannelIdを指定"
        value={channelId}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  )
}
