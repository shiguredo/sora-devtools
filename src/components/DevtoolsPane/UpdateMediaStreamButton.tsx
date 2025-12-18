import type { FunctionComponent } from 'preact'

import { updateMediaStream } from '@/app/actions'

export const UpdateMediaStreamButton: FunctionComponent = () => {
  const onClick = (): void => {
    updateMediaStream()
  }
  return (
    <div className="flex-none mb-1">
      <input
        className="px-4 py-2 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        name="update-mediastream"
        defaultValue="update-mediastream"
        onClick={onClick}
      />
    </div>
  )
}
