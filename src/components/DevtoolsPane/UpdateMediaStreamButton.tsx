import type React from 'react'

import { updateMediaStream } from '@/app/actions'

export const UpdateMediaStreamButton: React.FC = () => {
  const onClick = (): void => {
    updateMediaStream()
  }
  return (
    <div className="w-auto mb-1">
      <button
        className="inline-block px-3 py-1.5 text-base font-normal text-center text-gray-custom-600 align-middle cursor-pointer select-none bg-transparent border border-gray-custom-600 rounded transition-all hover:bg-gray-custom-600 hover:text-white disabled:opacity-65 disabled:pointer-events-none"
        type="button"
        name="update-mediastream"
        onClick={onClick}
      >
        update-mediastream
      </button>
    </div>
  )
}
