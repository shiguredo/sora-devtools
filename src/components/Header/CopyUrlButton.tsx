import type { FunctionComponent } from 'preact'

import { copyURL } from '@/app/actions'

export const CopyUrlButton: FunctionComponent = () => {
  const onClick = (): void => {
    copyURL()
  }
  return (
    <input
      className="px-2 py-1 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 rounded ml-1 cursor-pointer"
      type="button"
      name="copyUrl"
      defaultValue="copy URL"
      onClick={onClick}
    />
  )
}
