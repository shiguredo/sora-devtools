import type React from 'react'

import { setChannelId } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const ChannelIdForm: React.FC = () => {
  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChannelId(event.target.value)
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <input
        id="channelId"
        type="text"
        placeholder="ChannelIdを指定"
        value={channelId}
        onChange={onChange}
        disabled={disabled}
        className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  )
}
