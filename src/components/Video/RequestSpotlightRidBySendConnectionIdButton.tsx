import type React from 'react'
import { useRef } from 'react'
import { FormGroup, FormSelect } from 'react-bootstrap'
import type { SpotlightFocusRid } from 'sora-js-sdk'

import { requestSpotlightRid } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'

type Props = {
  sendConnectionId: string
}
export const RequestSpotlightRidBySendConnectionIdButton: React.FC<Props> = (props) => {
  const focusRidRef = useRef<HTMLSelectElement>(null)
  const unfocusRidRef = useRef<HTMLSelectElement>(null)
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const apiUrl = useSoraDevtoolsStore((state) => state.apiUrl)
  if (!sora?.connectionId) {
    return null
  }
  const onClick = async (): Promise<void> => {
    if (!sora?.connectionId) {
      return
    }
    if (focusRidRef.current === null || unfocusRidRef.current === null) {
      return
    }
    const focusRid = focusRidRef.current.value as SpotlightFocusRid
    const unfocusRid = unfocusRidRef.current.value as SpotlightFocusRid
    try {
      const response = await requestSpotlightRid(
        apiUrl,
        channelId,
        sora.connectionId,
        focusRid,
        unfocusRid,
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
    <div className="mx-1">
      <FormGroup className="form-inline">
        <FormSelect ref={focusRidRef}>
          {SPOTLIGHT_FOCUS_RIDS.map((value) => {
            if (value === '') {
              return null
            }
            return (
              <option key={value} value={value}>
                SpotlightFocusRid: {value}
              </option>
            )
          })}
        </FormSelect>
        <FormSelect ref={unfocusRidRef}>
          {SPOTLIGHT_FOCUS_RIDS.map((value) => {
            if (value === '') {
              return null
            }
            return (
              <option key={value} value={value}>
                SpotlightUnfocusRid: {value}&nbsp;&nbsp;&nbsp;
              </option>
            )
          })}
        </FormSelect>
        <input
          className="btn btn-secondary"
          type="button"
          name="requestSpotlightRidBySendConnectionId"
          defaultValue="requestSpotlightRid"
          onClick={onClick}
        />
      </FormGroup>
    </div>
  )
}
