import type React from 'react'

import { setDataChannels, setEnabledDataChannels } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const DataChannelsForm: React.FC = () => {
  const enabledDataChannels = useSoraDevtoolsStore((state) => state.enabledDataChannels)
  const dataChannels = useSoraDevtoolsStore((state) => state.dataChannels)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const exampleJsonString = JSON.stringify(
    [
      {
        label: '#devtools',
        maxPacketLifeTime: 10,
        ordered: true,
        compress: false,
        direction: 'sendrecv',
      },
    ],
    null,
    2,
  )
  const textareaPlaceholder = `dataChannelsを指定\n(例)\n${exampleJsonString}`
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledDataChannels(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="dataChannels"
              checked={enabledDataChannels}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              dataChannels
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledDataChannels ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="dataChannels"
              placeholder={textareaPlaceholder}
              value={dataChannels}
              setValue={(value) => setDataChannels(value)}
              disabled={disabled}
              rows={12}
              extraControls={
                <button
                  type="button"
                  onClick={() => setDataChannels(exampleJsonString)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  load template
                </button>
              }
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
