import React from 'react'

import { resetRtpStream } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

type Props = {
  sendConnectionId: string
}
export const ResetRtpStreamBySendConnectionIdButton: React.FC<Props> = (props) => {
  const sora = useAppSelector((state) => state.soraContents.sora)
  const channelId = useAppSelector((state) => state.channelId)
  const apiUrl = useAppSelector((state) => state.apiUrl)
  const dispatch = useAppDispatch()
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return
    }
    try {
      const response = await resetRtpStream(
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
      className="btn btn-secondary btn-sm mx-1"
      type="button"
      name="resetRtpStream"
      defaultValue="reset rid"
      onClick={onClick}
    />
  )
}
