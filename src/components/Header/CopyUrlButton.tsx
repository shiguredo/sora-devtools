import type React from 'react'

import { copyURL } from '@/app/actions'

export const CopyUrlButton: React.FC = () => {
  const onClick = (): void => {
    copyURL()
  }
  return (
    <input
      className="btn btn-light btn-sm ms-1"
      type="button"
      name="copyUrl"
      defaultValue="copy URL"
      onClick={onClick}
    />
  )
}
