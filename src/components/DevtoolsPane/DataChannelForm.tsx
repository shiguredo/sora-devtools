import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from '@/app/actions'
import {
  $connectionStatus,
  $dataChannelSignaling,
  $enabledDataChannel,
  $ignoreDisconnectWebSocket,
} from '@/app/store'
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

const IgnoreDisconnectWebSocketForm: FunctionComponent<{ disabled: boolean }> = (props) => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(event.currentTarget.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="ignoreDisconnectWebSocket"
        value={$ignoreDisconnectWebSocket.value}
        onChange={onChange}
        disabled={props.disabled}
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

const DataChannelSignalingForm: FunctionComponent<{ disabled: boolean }> = (props) => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, DATA_CHANNEL_SIGNALING)) {
      setDataChannelSignaling(event.currentTarget.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        name="dataChannelSignaling"
        value={$dataChannelSignaling.value}
        onChange={onChange}
        disabled={props.disabled}
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

export const DataChannelForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledDataChannel(event.currentTarget.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="flex-none pr-4 pb-2">
          <div className="form-inline">
            <div className="relative inline-flex items-center">
              <input
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                type="checkbox"
                role="switch"
                id="enabledDataChannel"
                checked={$enabledDataChannel.value}
                onChange={onChangeSwitch}
                disabled={disabled}
                aria-checked={$enabledDataChannel.value}
              />
              <label className="ml-2 text-sm text-gray-900" htmlFor="enabledDataChannel">
                dataChannel
              </label>
            </div>
          </div>
        </div>
      </div>
      {$enabledDataChannel.value ? (
        <div className="row form-row">
          <div className="flex-none pr-4 pb-2">
            <div className="row">
              <div className="flex-none pr-4 pb-2">
                <DataChannelSignalingForm disabled={disabled} />
              </div>
              <div className="flex-none pr-4 pb-2">
                <IgnoreDisconnectWebSocketForm disabled={disabled} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
