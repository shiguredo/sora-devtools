import type React from 'react'

import { setAudioStreamingLanguageCode, setEnabledAudioStreamingLanguageCode } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioStreamingLanguageCodeForm: React.FC = () => {
  const enabledAudioStreamingLanguageCode = useSoraDevtoolsStore(
    (state) => state.enabledAudioStreamingLanguageCode,
  )
  const audioStreamingLanguageCode = useSoraDevtoolsStore(
    (state) => state.audioStreamingLanguageCode,
  )
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledAudioStreamingLanguageCode(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioStreamingLanguageCode(event.target.value)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="audioStreamingLanguageCode"
              checked={enabledAudioStreamingLanguageCode}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              audioStreamingLanguageCode
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledAudioStreamingLanguageCode ? (
        <div className="form-row">
          <div>
            <div className="flex items-center">
              <input
                className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed w-500"
                type="text"
                placeholder="audioStreamingLanguageCodeを指定"
                value={audioStreamingLanguageCode}
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
