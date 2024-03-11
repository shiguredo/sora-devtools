import type React from 'react'

import { copyURL } from '@/app/actions'
import { useAppDispatch } from '@/app/hooks'

export const CopyUrlButton: React.FC = () => {
  const dispatch = useAppDispatch()
  const onClick = (): void => {
    dispatch(copyURL())
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
