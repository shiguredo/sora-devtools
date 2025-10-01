import type React from 'react'

import { setEnabledVideoVP9Params, setVideoVP9Params } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoVP9ParamsForm: React.FC = () => {
  const enabledVideoVP9Params = useSoraDevtoolsStore((state) => state.enabledVideoVP9Params)
  const videoVP9Params = useSoraDevtoolsStore((state) => state.videoVP9Params)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoVP9Params(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="videoVP9Params"
              checked={enabledVideoVP9Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoVP9Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledVideoVP9Params ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="videoVP9Params"
              placeholder="videoVP9Paramsを指定"
              value={videoVP9Params}
              setValue={(value) => setVideoVP9Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
