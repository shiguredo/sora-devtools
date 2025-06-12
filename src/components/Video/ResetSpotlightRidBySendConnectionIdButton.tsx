import type React from 'react'

import { resetSpotlightRid } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

type Props = {
  sendConnectionId: string
}
export const ResetSpotlightRidBySendConnectionIdButton: React.FC<Props> = (props) => {
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const apiUrl = useSoraDevtoolsStore((state) => state.apiUrl)
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return
    }
    try {
      const response = await resetSpotlightRid(
        apiUrl,
        channelId,
        sora.connectionId,
        props.sendConnectionId,
      )
      setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`)
    } catch (error) {
      if (error instanceof Error) {
        setAPIErrorAlertMessage(error.message)
      }
    }
  }
  return (
    <input
      className="btn btn-secondary mx-1"
      type="button"
      name="resetSpotlightRid"
      defaultValue="resetSpotlightRid"
      onClick={onClick}
    />
  )
}
