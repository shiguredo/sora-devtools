import type React from 'react'

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const SignalingUrlCandidatesForm: React.FC = () => {
  const enabledSignalingUrlCandidates = useSoraDevtoolsStore(
    (state) => state.enabledSignalingUrlCandidates,
  )
  const signalingUrlCandidates = useSoraDevtoolsStore((state) => state.signalingUrlCandidates)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledSignalingUrlCandidates(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setSignalingUrlCandidates(event.target.value.split('\n'))
  }
  const textareaPlaceholder = `signalingUrlCandidatesを指定
(例)
wss://sora0.example.com/signaling
wss://sora1.example.com/signaling
`
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="signalingUrlCandidates"
              checked={enabledSignalingUrlCandidates}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingUrlCandidates
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledSignalingUrlCandidates ? (
        <div className="form-row">
          <div>
            <div className="flex items-center">
              <textarea
                className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={textareaPlaceholder}
                value={signalingUrlCandidates.join('\n')}
                onChange={onChangeText}
                rows={5}
                cols={100}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
