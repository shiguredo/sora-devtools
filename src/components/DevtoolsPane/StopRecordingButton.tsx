import React from 'react'

import { stopRec } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

export const StopRecordingButton: React.FC = () => {
  const channelId = useAppSelector((state) => state.channelId)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const apiUrl = useAppSelector((state) => state.apiUrl)
  const dispatch = useAppDispatch()
  const onClick = async (): Promise<void> => {
    try {
      const response = await stopRec(apiUrl, channelId)
      dispatch(setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setAPIErrorAlertMessage(error.message))
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
