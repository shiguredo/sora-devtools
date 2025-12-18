import type { FunctionComponent } from 'preact'
import { useRef } from 'preact/hooks'
import type { SpotlightFocusRid } from 'sora-js-sdk'

import { $connectionStatus, $sora } from '@/app/store'
import { SPOTLIGHT_FOCUS_RIDS } from '@/constants'
import { rpc } from '@/rpc'

export const RequestSpotlightRidButton: FunctionComponent = () => {
  const focusRidRef = useRef<HTMLSelectElement>(null)
  const unfocusRidRef = useRef<HTMLSelectElement>(null)

  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== 'connected') {
      return
    }
    if (focusRidRef.current === null || unfocusRidRef.current === null) {
      return
    }
    const focusRid = focusRidRef.current.value as SpotlightFocusRid
    const unfocusRid = unfocusRidRef.current.value as SpotlightFocusRid

    await rpc(
      $sora.value,
      '2025.2.0/RequestSpotlightRid',
      {
        spotlight_focus_rid: focusRid,
        spotlight_unfocus_rid: unfocusRid,
      },
      { notification: false, showMethodAlert: true },
    )
  }

  if (!$sora.value?.connectionId) {
    return null
  }

  return (
    <div className="mx-1">
      <div className="form-inline">
        <select
          className="px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref={focusRidRef}
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
          className="px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          ref={unfocusRidRef}
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
          className="px-2 py-1 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 rounded cursor-pointer"
          type="button"
          name="requestSpotlightRid"
          defaultValue="requestSpotlightRid"
          onClick={onClick}
        />
      </div>
    </div>
  )
}
