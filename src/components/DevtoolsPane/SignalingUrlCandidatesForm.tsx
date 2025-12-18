import type React from 'react'

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from '@/app/actions'
import {
  $connectionStatus,
  $enabledSignalingUrlCandidates,
  $signalingUrlCandidates,
} from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const SignalingUrlCandidatesForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
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
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline">
            <TooltipFormCheck
              kind="signalingUrlCandidates"
              checked={$enabledSignalingUrlCandidates.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingUrlCandidates
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledSignalingUrlCandidates.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <div className="form-inline">
              <textarea
                className="form-control flex-fill"
                placeholder={textareaPlaceholder}
                value={$signalingUrlCandidates.value.join('\n')}
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
