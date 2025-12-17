import { $statsReport, $sora } from '@/app/store'
import type { RTCStatsCodec } from '@/types'
import { useEffect, useState } from 'react'

const useVideoTrackStats = (stream: MediaStream) => {
  const [trackStats, setTrackStats] = useState<{
    codec: RTCStatsCodec
    videoTrackStats: {
      width?: number
      height?: number
      frameRate?: number
    }
  } | null>(null)
  useEffect(() => {
    ;(async () => {
      if (!$sora.value?.pc) {
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
      const receiver = $sora.value.pc
        .getReceivers()
        .find((receiver) => receiver.track.id === track.id)
      if (receiver === undefined) {
        return
      }

      // RTCRtpReceiver の getStats から codecId を取得
      let codecId: string | undefined
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
      let codec: RTCStatsCodec | undefined
      for (const stats of $statsReport.value) {
        if (stats.type === 'codec') {
          const castedStats = stats as RTCStatsCodec
          if (codecId === castedStats.id) {
            codec = castedStats
          }
        }
      }
      if (codec) {
        setTrackStats({
          codec,
          videoTrackStats: {
            width: track.getSettings().width,
            height: track.getSettings().height,
            frameRate:
              track.getSettings().frameRate !== undefined
                ? Math.floor(track.getSettings().frameRate || 0)
                : undefined,
          },
        })
      }
    })()
  }, [$statsReport.value, stream])
  return {
    trackStats,
  }
}

export const RemoteVideoCapabilities = ({ stream }: { stream: MediaStream }) => {
  const { trackStats } = useVideoTrackStats(stream)
  return (
    <div className="video-overlay">
      {trackStats === null ? (
        <p>loading...</p>
      ) : (
        <table className="table-video-capabilities">
          <tr>
            <th>mimeType</th>
            <td>{trackStats.codec.mimeType}</td>
          </tr>
          <tr>
            <th>payloadType</th>
            <td>{trackStats.codec.payloadType}</td>
          </tr>
          <tr>
            <th>sdpFmtpLine</th>
            <td>{trackStats.codec.sdpFmtpLine}</td>
          </tr>
          <tr>
            <th>resolution</th>
            <td>
              {trackStats.videoTrackStats.width === undefined ||
              trackStats.videoTrackStats.height === undefined
                ? 'undefined'
                : `${trackStats.videoTrackStats.width}x${trackStats.videoTrackStats.height}`}
            </td>
          </tr>
          <tr>
            <th>fps</th>
            <td>
              {trackStats.videoTrackStats.frameRate === undefined
                ? 'undefined'
                : trackStats.videoTrackStats.frameRate}
            </td>
          </tr>
        </table>
      )}
    </div>
  )
}
