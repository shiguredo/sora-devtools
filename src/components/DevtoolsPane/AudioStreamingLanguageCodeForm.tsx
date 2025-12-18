import type React from 'react'

import { setAudioStreamingLanguageCode, setEnabledAudioStreamingLanguageCode } from '@/app/actions'
import {
  $audioStreamingLanguageCode,
  $connectionStatus,
  $enabledAudioStreamingLanguageCode,
} from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioStreamingLanguageCodeForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledAudioStreamingLanguageCode(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioStreamingLanguageCode(event.target.value)
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
                className="form-control flex-fill w-500"
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
