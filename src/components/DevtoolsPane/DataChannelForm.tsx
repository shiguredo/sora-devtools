import type React from 'react'

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

const IgnoreDisconnectWebSocketForm: React.FC<{ disabled: boolean }> = (props) => {
  const ignoreDisconnectWebSocket = useSoraDevtoolsStore((state) => state.ignoreDisconnectWebSocket)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <select
        name="ignoreDisconnectWebSocket"
        value={ignoreDisconnectWebSocket}
        onChange={onChange}
        disabled={props.disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {IGNORE_DISCONNECT_WEBSOCKET.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </select>
    </div>
  )
}

const DataChannelSignalingForm: React.FC<{ disabled: boolean }> = (props) => {
  const dataChannelSignaling = useSoraDevtoolsStore((state) => state.dataChannelSignaling)
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, DATA_CHANNEL_SIGNALING)) {
      setDataChannelSignaling(event.target.value)
    }
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <select
        name="dataChannelSignaling"
        value={dataChannelSignaling}
        onChange={onChange}
        disabled={props.disabled}
        className="px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {DATA_CHANNEL_SIGNALING.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export const DataChannelForm: React.FC = () => {
  const enabledDataChannel = useSoraDevtoolsStore((state) => state.enabledDataChannel)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledDataChannel(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enabledDataChannel"
                checked={enabledDataChannel}
                onChange={onChangeSwitch}
                disabled={disabled}
                className="w-10 h-5 relative appearance-none bg-gray-300 rounded-full cursor-pointer transition-colors duration-200 ease-in-out checked:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-transform before:duration-200 before:ease-in-out checked:before:translate-x-5"
              />
              <span className="ml-2 text-base">dataChannel</span>
            </label>
          </div>
        </div>
      </div>
      {enabledDataChannel ? (
        <div className="form-row">
          <div>
            <div className="flex flex-wrap gap-4">
              <DataChannelSignalingForm disabled={disabled} />
              <IgnoreDisconnectWebSocketForm disabled={disabled} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
