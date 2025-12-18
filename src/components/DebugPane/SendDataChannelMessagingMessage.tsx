import type React from 'react'
import { useRef } from 'react'

import { $connectionStatus, $sora, $soraDataChannels } from '@/app/store'

export const SendDataChannelMessagingMessage: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null)
  const textareaRef = useRef<HTMLInputElement>(null)
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return
    }
    const label = selectRef.current.value
    if ($sora.value && $connectionStatus.value === 'connected') {
      $sora.value.sendMessage(label, new TextEncoder().encode(textareaRef.current.value))
    }
  }
  return (
    <>
      <div className="d-flex mt-2">
        <div className="me-1">
          <select
            className="form-select"
            name="sendDataChannelMessageLabel"
            id="sendDataChannelMessageLabel"
            ref={selectRef}
          >
            {$soraDataChannels.value.map((datachannel) => {
              return (
                <option key={datachannel.label} value={datachannel.label}>
                  {datachannel.label}
                </option>
              )
            })}
          </select>
        </div>
        <div className="flex-grow-1 me-1">
          <input
            type="text"
            id="sendDataChannelMessage"
            className="form-control flex-fill"
            placeholder="sendDataChannelMessageを指定"
            ref={textareaRef}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSendMessage}
          disabled={$soraDataChannels.value.length === 0}
        >
          send
        </button>
      </div>
      {$soraDataChannels.value.length > 0 ? (
        <pre
          className="form-control mt-2"
          style={{
            color: '#fff',
            backgroundColor: '#222222',
            maxHeight: '250px',
            minHeight: '250px',
          }}
        >
          {JSON.stringify($soraDataChannels.value, null, 2)}
        </pre>
      ) : null}
    </>
  )
}
