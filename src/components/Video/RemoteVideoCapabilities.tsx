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
      const track = stream.getVideoTracks().find((track) => {
        return track
      })
      if (track === undefined) {
        return
      }
      const receiver = await soraContents.sora.pc
        .getReceivers()
        .find((receiver) => receiver.track.id === track.id)
      if (receiver === undefined) {
        console.log('receiver is undefined')
        return
      }

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

      console.log(codecId)
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
