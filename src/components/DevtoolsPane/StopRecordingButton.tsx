import type React from 'react'

import { stopRec } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const StopRecordingButton: React.FC = () => {
  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const apiUrl = useSoraDevtoolsStore((state) => state.apiUrl)
    const onClick = async (): Promise<void> => {
    try {
      const response = await stopRec(apiUrl, channelId)
      setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`)
    } catch (error) {
      if (error instanceof Error) {
        setAPIErrorAlertMessage(error.message)
      }
    }
  }
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="stopRec"
        defaultValue="stop rec"
        onClick={onClick}
        disabled={connectionStatus === 'initializing'}
      />
    </div>
  )
}
