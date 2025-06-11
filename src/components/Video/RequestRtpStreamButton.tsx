import type React from 'react'
import type { SimulcastRid } from 'sora-js-sdk'

import { requestRtpStream } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useAppSelector } from '@/app/hooks'

type Props = {
  rid: SimulcastRid
}
export const RequestRtpStreamButton: React.FC<Props> = (props) => {
  const sora = useAppSelector((state) => state.soraContents.sora)
  const apiUrl = useAppSelector((state) => state.apiUrl)
  const channelId = useAppSelector((state) => state.channelId)
    const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return
    }
    try {
      const response = await requestRtpStream(apiUrl, channelId, sora.connectionId, props.rid)
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
        name={`requestSimulcastRidTo${props.rid.charAt(0).toUpperCase() + props.rid.slice(1)}`}
        defaultValue={`${props.rid} rid`}
        onClick={onClick}
      />
    </div>
  )
}
