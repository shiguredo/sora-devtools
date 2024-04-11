import { useAppSelector } from '@/app/hooks'
import type { RTCStatsCodec } from '@/types'
import { useEffect, useState } from 'react'
import { CloseButton } from 'react-bootstrap'

const useVideoTrackStats = (stream: MediaStream) => {
  const statsReport = useAppSelector((state) => state.soraContents.statsReport)
  const soraContents = useAppSelector((state) => state.soraContents)
  const [trackStats, setTrackStats] = useState<{
    codec: RTCStatsCodec
    inboundRtp: RTCInboundRtpStreamStats
  } | null>(null)
  useEffect(() => {
    ;(async () => {
      if (!soraContents.sora?.pc) {
        return
      }
      // 現在の VideoTrack を取得
      const track = stream.getVideoTracks().find((track) => {
        return track
      })
      if (track === undefined) {
        return
      }

      // track の RTCRtpReceiver を取得
      const receiver = await soraContents.sora.pc
        .getReceivers()
        .find((receiver) => receiver.track.id === track.id)
      if (receiver === undefined) {
        return
      }

      // RTCRtpReceiver の getStats から codecId を取得
      let codecId = undefined
      const receiverStatsReport = await receiver.getStats()
      for (const stats of receiverStatsReport) {
        const [_key, value] = stats
        if (value.codecId) {
          codecId = value.codecId
          break
        }
      }
      if (codecId === undefined) {
        return
      }

      // RTCStatsReport から codecId が一致する codec の情報を取得
      let codec = undefined
      let inboundRtp = undefined
      for (const stats of statsReport) {
        if (stats.type === 'codec') {
          const castedStats = stats as RTCStatsCodec
          if (codecId === castedStats.id) {
            codec = castedStats
          }
        }
        if (stats.type === 'inbound-rtp') {
          const castedStats = stats as RTCInboundRtpStreamStats
          if (codecId === castedStats.codecId) {
            inboundRtp = castedStats
          }
        }
      }
      if (codec && inboundRtp) {
        setTrackStats({ codec, inboundRtp })
      }
    })()
  }, [statsReport, stream, soraContents])
  return {
    trackStats,
  }
}

export const RemoteVideoCapabilities = ({
  stream,
  onClose,
}: { stream: MediaStream; onClose: () => void }) => {
  const { trackStats } = useVideoTrackStats(stream)
  return (
    <div className="video-overlay">
      <div className="d-flex justify-content-end">
        <CloseButton onClick={onClose} />
      </div>
      {trackStats === null ? (
        <p>loading...</p>
      ) : (
        <table className="table-video-capabilities">
          <tr>
            <th>mimeType</th>
            <td>{trackStats.codec.mimeType}</td>
          </tr>
          <tr>
            <th>payloadTpe</th>
            <td>{trackStats.codec.payloadType}</td>
          </tr>
          <tr>
            <th>sdpFmtpLine</th>
            <td>{trackStats.codec.sdpFmtpLine}</td>
          </tr>
          <tr>
            <th>resolution</th>
            <td>
              {trackStats.inboundRtp.frameWidth}x{trackStats.inboundRtp.frameHeight}
            </td>
          </tr>
          <tr>
            <th>fps</th>
            <td>{trackStats.inboundRtp.framesPerSecond}</td>
          </tr>
        </table>
      )}
    </div>
  )
}
