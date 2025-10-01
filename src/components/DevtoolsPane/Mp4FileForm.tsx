import { Mp4MediaStream } from '@shiguredo/mp4-media-stream'

import type React from 'react'

import { setMp4MediaStream } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const Mp4FileForm: React.FC = () => {
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
  const localMediaStream = useSoraDevtoolsStore((state) => state.soraContents.localMediaStream)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = localMediaStream !== null || isFormDisabled(connectionStatus)
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files
    if (files === null || files.length === 0) {
      return
    }

    // MP4 ファイルをロードする
    try {
      const mp4MediaStream = await Mp4MediaStream.load(files[0])
      setMp4MediaStream(mp4MediaStream)
    } catch (e) {
      // ロードに失敗したらファイル選択をクリアする
      event.target.value = ''

      // 以前の内容が残っていた場合に備えて null を入れておく
      setMp4MediaStream(null)

      throw e
    }
  }
  if (mediaType !== 'mp4Media') {
    return null
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="mp4File">mp4File:</TooltipFormLabel>
      <input
        type="file"
        accept="video/mp4"
        disabled={disabled}
        onChange={onChange}
        className="flex-1 px-3 py-1.5 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  )
}
