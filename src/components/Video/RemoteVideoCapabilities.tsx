import { useAppSelector } from '@/app/hooks'
import type { RTCStatsCodec } from '@/types'
import { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'

export const RemoteVideoCapabilities = ({
  stream,
  onClose,
}: { stream: MediaStream; onClose: () => void }) => {
  const statsReport = useAppSelector((state) => state.soraContents.statsReport)
  const soraContents = useAppSelector((state) => state.soraContents)
  const [trackStats, setTrackStats] = useState<RTCStatsCodec | null>(null)
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
      for (const stats of statsReport) {
        const castedStats = stats as RTCStatsCodec
        if (stats.type !== 'codec') {
          continue
        }
        if (codecId === castedStats.id) {
          setTrackStats(castedStats)
          break
        }
      }
    })()
  }, [statsReport, stream, soraContents])

  return trackStats === null ? null : (
    <div className="videoOverlay">
      <div className="d-flex justify-content-end">
        <button className="btnClose" type="button" onClick={onClose}>
          [X]
        </button>
      </div>
      <Row className="">
        <Col>id</Col>
        <Col>{trackStats.id}</Col>
      </Row>
      <Row>
        <Col>mimeType</Col>
        <Col>{trackStats.mimeType}</Col>
      </Row>
      <Row>
        <Col>SdpFmtpLine</Col>
        <Col>{trackStats.sdpFmtpLine}</Col>
      </Row>
    </div>
  )
}
