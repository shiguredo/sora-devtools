import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

import { statsReport } from "@/app/signals";
import type { RTCStatsCodec } from "@/types";

type RTCStatsCodecPair = {
  codec?: RTCStatsCodec;
  outboundRtpStats: RTCOutboundRtpStreamStats;
};

const useLocalVideoTrackStats = (stream: MediaStream) => {
  const currentStatsReport = statsReport.value;
  const trackStats = useSignal<RTCStatsCodecPair[]>([]);
  const selected = useSignal<RTCStatsCodecPair | null>(null);
  useEffect(() => {
    void (async () => {
      // 現在の VideoTrack を取得
      const track = stream.getVideoTracks().find((track) => {
        return track;
      });
      if (track === undefined) {
        return;
      }

      // track の RTCRtpStats を取得
      // 送信は 1 つだけなので outbound-rtp の kind=video を取得
      const stats = currentStatsReport.filter((stats) => {
        if (stats.type === "outbound-rtp") {
          const castedStats = stats as RTCOutboundRtpStreamStats;
          if (castedStats.kind === "video") {
            return true;
          }
        }
        return false;
      });
      if (stats.length === 0) {
        return;
      }

      const videoStats = stats.map((s) => {
        const outboundRtpStats = s as RTCOutboundRtpStreamStats;

        // RTCStatsReport から codecId が一致する codec の情報を取得
        const codec = currentStatsReport.find((stats) => {
          if (stats.type === "codec") {
            const castedStats = stats as RTCStatsCodec;
            return castedStats.id === outboundRtpStats.codecId;
          }
          return false;
        });
        if (codec === undefined) {
          return {
            outboundRtpStats: outboundRtpStats,
          };
        }
        return {
          codec: codec as RTCStatsCodec,
          outboundRtpStats: outboundRtpStats,
        };
      });
      trackStats.value = videoStats.sort((a, b) => {
        if (a.outboundRtpStats.rid === undefined) {
          return 1;
        }
        if (b.outboundRtpStats.rid === undefined) {
          return -1;
        }
        return a.outboundRtpStats.rid.localeCompare(b.outboundRtpStats.rid);
      });
      if (selected.value === null) {
        // selected が未指定の場合は frameWidth が最大のものを選択
        const selectedVideoStats = videoStats
          .filter((s) => s.outboundRtpStats.frameWidth !== undefined)
          .sort((a, b) => {
            if (a.outboundRtpStats.frameWidth === undefined) {
              return 1;
            }
            if (b.outboundRtpStats.frameWidth === undefined) {
              return -1;
            }
            return b.outboundRtpStats.frameWidth - a.outboundRtpStats.frameWidth;
          });
        if (selectedVideoStats.length > 0) {
          selected.value = selectedVideoStats[0];
        }
      } else {
        const selectedStats = videoStats.find(
          (s) => s.outboundRtpStats.rid === selected.value?.outboundRtpStats.rid,
        );
        if (selectedStats !== undefined) {
          selected.value = selectedStats;
        }
      }
    })();
  }, [currentStatsReport, stream, selected, trackStats]);
  return { trackStats, selected };
};

export const LocalVideoCapabilities = ({ stream }: { stream: MediaStream }) => {
  const { trackStats, selected } = useLocalVideoTrackStats(stream);
  return (
    <div className="absolute p-2 top-2 left-2 bg-black/30 rounded-lg text-white z-[999] max-w-max">
      {trackStats.value.length === 0 ? (
        <p>loading...</p>
      ) : (
        <>
          {trackStats.value.length > 1 && (
            <div className="flex gap-2">
              {trackStats.value.map((trackStat) => (
                <div
                  key={trackStat.outboundRtpStats.rid}
                  className={`cursor-pointer ${
                    trackStat.outboundRtpStats.rid === selected.value?.outboundRtpStats.rid
                      ? "font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    selected.value = trackStat;
                  }}
                  onKeyDown={() => {
                    selected.value = trackStat;
                  }}
                >
                  [{trackStat.outboundRtpStats.rid}]
                </div>
              ))}
            </div>
          )}
          {selected.value && (
            <table className="border-collapse border-spacing-[0.2rem]">
              <tr>
                <th>mimeType</th>
                <td>{selected.value.codec?.mimeType}</td>
              </tr>
              <tr>
                <th>payloadType</th>
                <td>{selected.value.codec?.payloadType}</td>
              </tr>
              <tr>
                <th>sdpFmtpLine</th>
                <td>{selected.value.codec?.sdpFmtpLine}</td>
              </tr>
              <tr>
                <th>resolution</th>
                <td>
                  {selected.value.outboundRtpStats.frameWidth}x
                  {selected.value.outboundRtpStats.frameHeight}
                </td>
              </tr>
              <tr>
                <th>fps</th>
                <td>
                  {selected.value.outboundRtpStats.framesPerSecond !== undefined
                    ? Math.floor(selected.value.outboundRtpStats.framesPerSecond)
                    : undefined}
                </td>
              </tr>
            </table>
          )}
        </>
      )}
    </div>
  );
};
