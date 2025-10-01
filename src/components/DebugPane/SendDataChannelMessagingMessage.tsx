import type React from 'react'
import { useRef } from 'react'

import { useSoraDevtoolsStore } from '@/app/store'

export const SendDataChannelMessagingMessage: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null)
  const textareaRef = useRef<HTMLInputElement>(null)
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const dataChannels = useSoraDevtoolsStore((state) => state.soraContents.dataChannels)
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return
    }
    const label = selectRef.current.value
    if (sora && connectionStatus === 'connected') {
      sora.sendMessage(label, new TextEncoder().encode(textareaRef.current.value))
    }
  }
  return (
    <>
      <div className="flex mt-2 gap-2">
        <div className="flex-shrink-0">
          <select
            name="sendDataChannelMessageLabel"
            ref={selectRef}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dataChannels.map((datachannel) => {
              return (
                <option key={datachannel.label} value={datachannel.label}>
                  {datachannel.label}
                </option>
              )
            })}
          </select>
        </div>
        <div className="flex-grow">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sendDataChannelMessageを指定"
            type="text"
            ref={textareaRef}
          />
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
          disabled={dataChannels.length === 0}
        >
          send
        </button>
      </div>
      {dataChannels.length > 0 ? (
        <pre
          className="mt-2 p-3 border border-gray-300 rounded-md overflow-auto"
          style={{
            color: '#fff',
            backgroundColor: '#222222',
            maxHeight: '250px',
            minHeight: '250px',
          }}
        >
          {JSON.stringify(dataChannels, null, 2)}
        </pre>
      ) : null}
    </>
  )
}
