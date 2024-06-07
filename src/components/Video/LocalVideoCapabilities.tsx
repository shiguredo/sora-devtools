import { useAppSelector } from '@/app/hooks'
import type { RTCStatsCodec } from '@/types'
import { useEffect, useState } from 'react'

const useLocalVideoTrackStats = (stream: MediaStream) => {
  const statsReport = useAppSelector((state) => state.soraContents.statsReport)
  const [trackStats, setTrackStats] = useState<{
    codec: RTCStatsCodec
    outboundRtpStats: RTCOutboundRtpStreamStats
  } | null>(null)
  useEffect(() => {
    ;(async () => {
      // 現在の VideoTrack を取得
      const track = stream.getVideoTracks().find((track) => {
        return track
      })
      if (track === undefined) {
        return
      }

      // track の RTCRtpStats を取得
      // 送信は 1 つだけなので outbound-rtp の kind=video を取得
      const stats = statsReport.find((stats) => {
        if (stats.type === 'outbound-rtp') {
          const castedStats = stats as RTCOutboundRtpStreamStats
          if (castedStats.kind === 'video') {
            return true
          }
        }
      })
      if (stats === undefined) {
        return
      }
      const outboundRtpStats = stats as RTCOutboundRtpStreamStats

      // RTCStatsReport から codecId が一致する codec の情報を取得
      const codec = statsReport.find((stats) => {
        if (stats.type === 'codec') {
          const castedStats = stats as RTCStatsCodec
          return castedStats.id === outboundRtpStats.codecId
        }
      })
      if (codec === undefined) {
        return
      }
      setTrackStats({
        codec: codec as RTCStatsCodec,
        outboundRtpStats: outboundRtpStats,
      })
    })()
  }, [statsReport, stream])
  return trackStats
}

export const LocalVideoCapabilities = ({ stream }: { stream: MediaStream }) => {
  const trackStats = useLocalVideoTrackStats(stream)
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
              {trackStats.outboundRtpStats.frameWidth}x{trackStats.outboundRtpStats.frameHeight}
            </td>
          </tr>
          <tr>
            <th>fps</th>
            <td>
              {trackStats.outboundRtpStats.framesPerSecond !== undefined
                ? Math.floor(trackStats.outboundRtpStats.framesPerSecond)
                : undefined}
            </td>
          </tr>
        </table>
      )}
    </div>
  )
}
