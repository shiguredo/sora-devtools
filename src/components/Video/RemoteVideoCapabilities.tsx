import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

import { sora, statsReport } from "@/app/signals";
import type { RTCStatsCodec } from "@/types";

import styles from "./Capabilities.module.css";

const useVideoTrackStats = (stream: MediaStream) => {
  const currentStatsReport = statsReport.value;
  const currentSora = sora.value;
  const trackStats = useSignal<{
    codec: RTCStatsCodec;
    videoTrackStats: {
      width?: number;
      height?: number;
      frameRate?: number;
      decoderImplementation?: string;
    };
  } | null>(null);
  useEffect(() => {
    void (async () => {
      if (!currentSora?.pc) {
        return;
      }
      // 現在の VideoTrack を取得
      const track = stream.getVideoTracks().find(Boolean);
      if (track === undefined) {
        return;
      }

      // track の RTCRtpReceiver を取得
      const receiver = currentSora.pc
        .getReceivers()
        .find((receiver) => receiver.track.id === track.id);
      if (receiver === undefined) {
        return;
      }

      // RTCRtpReceiver の getStats から codecId と decoderImplementation を取得
      let codecId: string | undefined;
      let decoderImplementation: string | undefined;
      const receiverStatsReport = await receiver.getStats();
      // RTCStatsReport は Map 互換だが lib.dom の型定義の generic が合わないためキャストする
      for (const [, value] of receiverStatsReport as ReadonlyMap<string, RTCStats>) {
        if (value.type === "inbound-rtp") {
          const inboundRtp = value as RTCInboundRtpStreamStats;
          if (inboundRtp.kind === "video") {
            ({ codecId, decoderImplementation } = inboundRtp);
            break;
          }
        }
      }
      if (codecId === undefined) {
        return;
      }

      // RTCStatsReport から codecId が一致する codec の情報を取得
      let codec: RTCStatsCodec | undefined;
      for (const stats of currentStatsReport) {
        if (stats.type === "codec") {
          const castedStats = stats as RTCStatsCodec;
          if (codecId === castedStats.id) {
            codec = castedStats;
          }
        }
      }
      if (codec) {
        trackStats.value = {
          codec,
          videoTrackStats: {
            width: track.getSettings().width,
            height: track.getSettings().height,
            frameRate:
              track.getSettings().frameRate !== undefined
                ? Math.floor(track.getSettings().frameRate ?? 0)
                : undefined,
            decoderImplementation,
          },
        };
      }
    })();
  }, [currentStatsReport, stream, currentSora, trackStats]);
  return {
    trackStats,
  };
};

export function RemoteVideoCapabilities({ stream }: { stream: MediaStream }) {
  const { trackStats } = useVideoTrackStats(stream);
  return (
    <div className={styles.root}>
      {trackStats.value === null ? (
        <p>loading...</p>
      ) : (
        <table className={styles.table}>
          <tbody>
            <tr>
              <th className={styles.headerCell}>mimeType</th>
              <td className={styles.cell}>{trackStats.value.codec.mimeType}</td>
            </tr>
            <tr>
              <th className={styles.headerCell}>payloadType</th>
              <td className={styles.cell}>{trackStats.value.codec.payloadType}</td>
            </tr>
            <tr>
              <th className={styles.headerCell}>sdpFmtpLine</th>
              <td className={styles.cell}>{trackStats.value.codec.sdpFmtpLine}</td>
            </tr>
            <tr>
              <th className={styles.headerCell}>resolution</th>
              <td className={styles.cell}>
                {trackStats.value.videoTrackStats.width === undefined ||
                trackStats.value.videoTrackStats.height === undefined
                  ? "undefined"
                  : `${trackStats.value.videoTrackStats.width}x${trackStats.value.videoTrackStats.height}`}
              </td>
            </tr>
            <tr>
              <th className={styles.headerCell}>fps</th>
              <td className={styles.cell}>
                {trackStats.value.videoTrackStats.frameRate ?? "undefined"}
              </td>
            </tr>
            {trackStats.value.videoTrackStats.decoderImplementation && (
              <tr>
                <th className={styles.headerCell}>decoder</th>
                <td className={styles.cell}>
                  {trackStats.value.videoTrackStats.decoderImplementation}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
