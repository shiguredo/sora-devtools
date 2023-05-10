import React from 'react'

import { resetRtpStream } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

export const ResetRtpStreamButton: React.FC = () => {
  const sora = useAppSelector((state) => state.soraContents.sora)
  const channelId = useAppSelector((state) => state.channelId)
  const apiUrl = useAppSelector((state) => state.apiUrl)
  const dispatch = useAppDispatch()
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return
    }
    try {
      const response = await resetRtpStream(apiUrl, channelId, sora.connectionId)
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message))
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
