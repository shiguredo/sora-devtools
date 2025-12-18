import type { FunctionComponent } from 'preact'

import { $connectionStatus, $sora } from '@/app/store'
import { rpc } from '@/rpc'

type Props = {
  sendConnectionId: string
}
export const ResetSpotlightRidBySendConnectionIdButton: FunctionComponent<Props> = (props) => {
  const onClick = async (): Promise<void> => {
    if (!$sora.value || $connectionStatus.value !== 'connected') {
      return
    }

    await rpc(
      $sora.value,
      '2025.2.0/ResetSpotlightRid',
      {
        send_connection_id: props.sendConnectionId,
      },
      { notification: false, showMethodAlert: true },
    )
  }

  return (
    <input
      className="px-2 py-1 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 rounded cursor-pointer mx-1"
      type="button"
      name="resetSpotlightRid"
      defaultValue="resetSpotlightRid"
      onClick={onClick}
    />
  )
}
