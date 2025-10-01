import type React from 'react'

import { setEnabledVideoH264Params, setVideoH264Params } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH264ParamsForm: React.FC = () => {
  const enabledVideoH264Params = useSoraDevtoolsStore((state) => state.enabledVideoH264Params)
  const videoH264Params = useSoraDevtoolsStore((state) => state.videoH264Params)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoH264Params(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="videoH264Params"
              checked={enabledVideoH264Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH264Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledVideoH264Params ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="videoH264Params"
              placeholder="videoH264Paramsを指定"
              value={videoH264Params}
              setValue={(value) => setVideoH264Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
