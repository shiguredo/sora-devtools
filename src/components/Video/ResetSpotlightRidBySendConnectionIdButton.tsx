import type React from 'react'

import { resetSpotlightRid } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useAppDispatch } from '@/app/hooks'
import { useStore } from '@/app/store2'

type Props = {
  sendConnectionId: string
}
export const ResetSpotlightRidBySendConnectionIdButton: React.FC<Props> = (props) => {
  const sora = useStore((state) => state.soraContents.sora)
  const channelId = useStore((state) => state.channelId)
  const apiUrl = useStore((state) => state.apiUrl)
  const dispatch = useAppDispatch()
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
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message))
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
