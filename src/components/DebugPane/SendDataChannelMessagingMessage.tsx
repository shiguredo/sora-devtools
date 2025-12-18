import type { FunctionComponent } from 'preact'
import { useRef } from 'preact/hooks'

import { $connectionStatus, $sora, $soraDataChannels } from '@/app/store'

export const SendDataChannelMessagingMessage: FunctionComponent = () => {
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
      <div className="flex mt-2">
        <div className="mr-1">
          <select
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="flex-grow mr-1">
          <input
            type="text"
            id="sendDataChannelMessage"
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sendDataChannelMessageを指定"
            ref={textareaRef}
          />
        </div>
        <button
          type="button"
          className="px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
          disabled={$soraDataChannels.value.length === 0}
        >
          send
        </button>
      </div>
      {$soraDataChannels.value.length > 0 ? (
        <pre
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
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
