import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setChannelId } from '@/app/actions'
import { $channelId, $connectionStatus } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ChannelIdForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setChannelId(event.currentTarget.value)
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        type="text"
        placeholder="ChannelIdを指定"
        value={$channelId.value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
