import type React from 'react'

import { useStore } from '@/app/store2'

export const CopyUrlButton: React.FC = () => {
  const copyURL = useStore((state) => state.copyURL)
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
