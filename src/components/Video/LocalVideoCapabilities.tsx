import { $statsReport } from '@/app/store'
import type { RTCStatsCodec } from '@/types'
import { useEffect, useState } from 'react'

type RTCStatsCodecPair = {
  codec?: RTCStatsCodec
  outboundRtpStats: RTCOutboundRtpStreamStats
}

const useLocalVideoTrackStats = (stream: MediaStream) => {
  const [trackStats, setTrackStats] = useState<RTCStatsCodecPair[]>([])
  const [selected, setSelected] = useState<RTCStatsCodecPair | null>(null)
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
      const stats = $statsReport.value.filter((stats) => {
        if (stats.type === 'outbound-rtp') {
          const castedStats = stats as RTCOutboundRtpStreamStats
          if (castedStats.kind === 'video') {
            return true
          }
        }
        return false
      })
      if (stats.length === 0) {
        return
      }

      const videoStats = stats.map((s) => {
        const outboundRtpStats = s as RTCOutboundRtpStreamStats

        // RTCStatsReport から codecId が一致する codec の情報を取得
        const codec = $statsReport.value.find((stats) => {
          if (stats.type === 'codec') {
            const castedStats = stats as RTCStatsCodec
            return castedStats.id === outboundRtpStats.codecId
          }
          return false
        })
        if (codec === undefined) {
          return {
            outboundRtpStats: outboundRtpStats,
          }
        }
        return {
          codec: codec as RTCStatsCodec,
          outboundRtpStats: outboundRtpStats,
        }
      })
      setTrackStats(
        videoStats.sort((a, b) => {
          if (a.outboundRtpStats.rid === undefined) {
            return 1
          }
          if (b.outboundRtpStats.rid === undefined) {
            return -1
          }
          return a.outboundRtpStats.rid.localeCompare(b.outboundRtpStats.rid)
        }),
      )
      if (selected === null) {
        // selected が未指定の場合は frameWidth が最大のものを選択
        const selectedVideoStats = videoStats
          .filter((s) => s.outboundRtpStats.frameWidth !== undefined)
          .sort((a, b) => {
            if (a.outboundRtpStats.frameWidth === undefined) {
              return 1
            }
            if (b.outboundRtpStats.frameWidth === undefined) {
              return -1
            }
            return b.outboundRtpStats.frameWidth - a.outboundRtpStats.frameWidth
          })
        if (selectedVideoStats.length > 0) {
          setSelected(selectedVideoStats[0])
        }
      } else {
        const selectedStats = videoStats.find(
          (s) => s.outboundRtpStats.rid === selected.outboundRtpStats.rid,
        )
        if (selectedStats !== undefined) {
          setSelected(selectedStats)
        }
      }
    })()
  }, [$statsReport.value, stream, selected])
  return { trackStats, selected, setSelected }
}

export const LocalVideoCapabilities = ({ stream }: { stream: MediaStream }) => {
  const { trackStats, selected, setSelected } = useLocalVideoTrackStats(stream)
  return (
    <div className="video-overlay">
      {trackStats.length === 0 ? (
        <p>loading...</p>
      ) : (
        <>
          {trackStats.length > 1 && (
            <div className="d-flex gap-2">
              {trackStats.map((trackStat) => (
                <div
                  key={trackStat.outboundRtpStats.rid}
                  className={
                    trackStat.outboundRtpStats.rid === selected?.outboundRtpStats.rid
                      ? 'rid-selected'
                      : 'rid'
                  }
                  onClick={() => setSelected(trackStat)}
                  onKeyDown={() => setSelected(trackStat)}
                >
                  [{trackStat.outboundRtpStats.rid}]
                </div>
              ))}
            </div>
          )}
          {selected && (
            <table className="table-video-capabilities">
              <tr>
                <th>mimeType</th>
                <td>{selected.codec?.mimeType}</td>
              </tr>
              <tr>
                <th>payloadType</th>
                <td>{selected.codec?.payloadType}</td>
              </tr>
              <tr>
                <th>sdpFmtpLine</th>
                <td>{selected.codec?.sdpFmtpLine}</td>
              </tr>
              <tr>
                <th>resolution</th>
                <td>
                  {selected.outboundRtpStats.frameWidth}x{selected.outboundRtpStats.frameHeight}
                </td>
              </tr>
              <tr>
                <th>fps</th>
                <td>
                  {selected.outboundRtpStats.framesPerSecond !== undefined
                    ? Math.floor(selected.outboundRtpStats.framesPerSecond)
                    : undefined}
                </td>
              </tr>
            </table>
          )}
        </>
      )}
    </div>
  )
}
