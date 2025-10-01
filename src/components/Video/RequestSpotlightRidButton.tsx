import type React from 'react'
import { useRef } from 'react'
import type { SpotlightFocusRid } from 'sora-js-sdk'

import { requestSpotlightRid } from '@/api'
import { setAPIErrorAlertMessage, setAPIInfoAlertMessage } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'

export const RequestSpotlightRidButton: React.FC = () => {
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
      )
      setAPIInfoAlertMessage(`POST successed. response: ${JSON.stringify(response)}`)
    } catch (error) {
      if (error instanceof Error) {
        setAPIErrorAlertMessage(error.message)
      }
    }
  }
  return (
    <div className="mx-1 flex items-center gap-2">
      <select
        ref={focusRidRef}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
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
      </select>
      <select
        ref={unfocusRidRef}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
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
      </select>
      <input
        className="btn btn-secondary"
        type="button"
        name="requestSpotlightRid"
        defaultValue="requestSpotlightRid"
        onClick={onClick}
      />
    </div>
  )
}
