import type React from 'react'

import { setEnabledVideoAV1Params, setVideoAV1Params } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoAV1ParamsForm: React.FC = () => {
  const enabledVideoAV1Params = useSoraDevtoolsStore((state) => state.enabledVideoAV1Params)
  const videoAV1Params = useSoraDevtoolsStore((state) => state.videoAV1Params)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoAV1Params(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="videoAV1Params"
              checked={enabledVideoAV1Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoAV1Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledVideoAV1Params ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="videoAV1Params"
              placeholder="videoAV1Paramsを指定"
              value={videoAV1Params}
              setValue={(value) => setVideoAV1Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
