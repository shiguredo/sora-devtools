import type React from 'react'

import { resetRtpStream } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const ResetRtpStreamButton: React.FC = () => {
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const apiUrl = useSoraDevtoolsStore((state) => state.apiUrl)
    const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return
    }
    try {
      const response = await resetRtpStream(apiUrl, channelId, sora.connectionId)
      setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`)
    } catch (error) {
      if (error instanceof Error) {
        setAPIErrorAlertMessage(error.message)
      }
    }
  }
  return (
    <div className="mx-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="resetAllSimulcastRid"
        defaultValue="reset rid"
        onClick={onClick}
      />
    </div>
  )
}
