import { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setMp4MediaStream } from '@/app/actions'
import { $connectionStatus, $localMediaStream, $mediaType } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const Mp4FileForm: FunctionComponent = () => {
  const disabled = $localMediaStream.value !== null || isFormDisabled($connectionStatus.value)
  const onChange = async (event: TargetedEvent<HTMLInputElement>): Promise<void> => {
    const files = event.currentTarget.files
    if (files === null || files.length === 0) {
      return
    }

    // MP4 ファイルをロードする
    try {
      const mp4MediaStream = await Mp4MediaStream.load(files[0])
      setMp4MediaStream(mp4MediaStream)
    } catch (e) {
      // ロードに失敗したらファイル選択をクリアする
      event.currentTarget.value = ''

      // 以前の内容が残っていた場合に備えて null を入れておく
      setMp4MediaStream(null)

      throw e
    }
  }
  if ($mediaType.value !== 'mp4Media') {
    return null
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="mp4File">mp4File:</TooltipFormLabel>
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="file"
        accept="video/mp4"
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  )
}
