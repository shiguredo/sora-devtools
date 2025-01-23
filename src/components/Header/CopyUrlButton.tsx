import type React from 'react'

import { copyURL } from '@/app/actions'
import { useAppDispatch } from '@/app/hooks'
import { useStore } from '@/app/store'

export const CopyUrlButton: React.FC = () => {
  const setClipboard = useStore((state) => state.setClipboard)
  const dispatch = useAppDispatch()
  const onClick = (): void => {
    dispatch(copyURL())
    setClipboard()
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
