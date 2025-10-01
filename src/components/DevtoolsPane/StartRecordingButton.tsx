import type React from 'react'

import { startRec } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const StartRecordingButton: React.FC = () => {
  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const apiUrl = useSoraDevtoolsStore((state) => state.apiUrl)
  const onClick = async (): Promise<void> => {
    try {
      const response = await startRec(apiUrl, channelId)
      setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`)
    } catch (error) {
      if (error instanceof Error) {
        setAPIErrorAlertMessage(error.message)
      }
    }
  }
  return (
    <div className="w-auto mb-1 mr-3">
      <button
        className="inline-block px-3 py-1.5 text-base font-normal text-center text-white align-middle cursor-pointer select-none bg-gray-custom-600 border border-gray-custom-600 rounded transition-colors hover:bg-gray-custom-700 hover:border-gray-custom-700 disabled:opacity-65 disabled:pointer-events-none"
        type="button"
        name="startRec"
        onClick={onClick}
        disabled={connectionStatus === 'initializing'}
      >
        start rec
      </button>
    </div>
  )
}
