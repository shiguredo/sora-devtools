import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setAudioStreamingLanguageCode, setEnabledAudioStreamingLanguageCode } from '@/app/actions'
import {
  $audioStreamingLanguageCode,
  $connectionStatus,
  $enabledAudioStreamingLanguageCode,
} from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioStreamingLanguageCodeForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledAudioStreamingLanguageCode(event.currentTarget.checked)
  }
  const onChangeText = (event: TargetedEvent<HTMLInputElement>): void => {
    setAudioStreamingLanguageCode(event.currentTarget.value)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="audioStreamingLanguageCode"
              checked={$enabledAudioStreamingLanguageCode.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              audioStreamingLanguageCode
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledAudioStreamingLanguageCode.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <div className="form-inline form-switch">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-fill w-500"
                type="text"
                placeholder="audioStreamingLanguageCodeを指定"
                value={$audioStreamingLanguageCode.value}
                onChange={onChangeText}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
