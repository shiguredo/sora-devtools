import { useSignal } from "@preact/signals";

import {
  audioOutput,
  displayResolution,
  focusedSpotlightConnectionIds,
  mediaStats,
  mute,
  prevStatsReport,
  remoteClients,
  showStats,
  simulcast,
  spotlight,
  statsReport,
} from "@/app/signals";
import type { RTCMediaStreamTrackStats, RemoteClient } from "@/types";

import styles from "./RemoteVideos.module.css";

import { ConnectionStatusBar } from "./ConnectionStatusBar.tsx";
import { JitterButter } from "./JitterBuffer.tsx";
import { RemoteVideoCapabilities } from "./RemoteVideoCapabilities.tsx";
import { RequestSimulcastRidButton } from "./RequestSimulcastRidButton.tsx";
import { RequestSpotlightRidBySendConnectionIdButton } from "./RequestSpotlightRidBySendConnectionIdButton.tsx";
import { ResetSpotlightRidBySendConnectionIdButton } from "./ResetSpotlightRidBySendConnectionIdButton.tsx";
import { Video } from "./Video.tsx";
import { VolumeVisualizer } from "./VolumeVisualizer.tsx";

function mediaStreamStatsReportFilter(
  report: RTCStats[],
  mediaStream: MediaStream | null,
): RTCMediaStreamTrackStats[] {
  if (mediaStream === null) {
    return [];
  }
  const trackIds = new Set(mediaStream.getTracks().map((t) => t.id));
  const result: RTCMediaStreamTrackStats[] = [];
  for (const stats of report) {
    if (stats.id && !stats.id.startsWith("RTCMediaStreamTrack")) {
      continue;
    }
    if ("trackIdentifier" in stats) {
      const mediaStreamStats = stats as RTCMediaStreamTrackStats;
      if (mediaStreamStats.trackIdentifier && trackIds.has(mediaStreamStats.trackIdentifier)) {
        result.push(mediaStreamStats);
      }
    }
  }
  return result;
}

function MediaStreamStatsReport({ stream }: { stream: MediaStream }) {
  if (!showStats.value) {
    return null;
  }
  const currentMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    statsReport.value,
    stream,
  );
  const prevMediaStreamTrackStatsReport = mediaStreamStatsReportFilter(
    prevStatsReport.value,
    stream,
  );
  return (
    <>
      {currentMediaStreamTrackStatsReport.map((s) => {
        let jitterBufferDelay = 0;
        let jitterBufferEmittedCount = 0;
        const prevStats = prevMediaStreamTrackStatsReport.find((p) => s.id === p.id);
        if (prevStats) {
          jitterBufferDelay = s.jitterBufferDelay - prevStats.jitterBufferDelay;
          jitterBufferEmittedCount =
            s.jitterBufferEmittedCount - prevStats.jitterBufferEmittedCount;
        }
        return (
          <div key={s.id}>
            <ul className={styles.statsList}>
              {Object.entries(s).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
              <li>
                <strong>[jitterBufferDelay/jitterBufferEmittedCount_in_ms]</strong>{" "}
                {Math.floor((jitterBufferDelay / jitterBufferEmittedCount) * 1000)}
              </li>
            </ul>
          </div>
        );
      })}
    </>
  );
}

function RemoteVideo({ client }: { client: RemoteClient }) {
  const { mediaStream, connectionId, clientId } = client;
  const height = useSignal<number>(0);
  const focused = connectionId && focusedSpotlightConnectionIds.value[connectionId];
  const wrapperClasses = focused ? styles.focused : styles.unfocused;
  return (
    <div className="col-auto">
      <div className={styles.statusList}>
        <div className={styles.statusRow}>
          <ConnectionStatusBar connectionId={connectionId} clientId={clientId} />
          <JitterButter type="audio" stream={mediaStream} />
          <JitterButter type="video" stream={mediaStream} />
        </div>
        <div className={styles.statusRow}>
          {spotlight.value !== "true" && simulcast.value === "true" ? (
            <>
              <RequestSimulcastRidButton rid="none" sendConnectionId={connectionId} />
              <RequestSimulcastRidButton rid="r0" sendConnectionId={connectionId} />
              <RequestSimulcastRidButton rid="r1" sendConnectionId={connectionId} />
              <RequestSimulcastRidButton rid="r2" sendConnectionId={connectionId} />
            </>
          ) : null}
          {spotlight.value === "true" && simulcast.value === "true" ? (
            <>
              <RequestSpotlightRidBySendConnectionIdButton sendConnectionId={connectionId} />
              <ResetSpotlightRidBySendConnectionIdButton sendConnectionId={connectionId} />
            </>
          ) : null}
        </div>
      </div>
      <div className={styles.streamArea}>
        {/* オーバーレイするため position-relative を付けておくこと */}
        <div className={`${styles.videoWrapper} ${wrapperClasses}`}>
          {mediaStats.value && mediaStream.getVideoTracks().length > 0 && (
            <RemoteVideoCapabilities stream={mediaStream} />
          )}
          <Video
            stream={mediaStream}
            setHeight={(value: number) => {
              height.value = value;
            }}
            mute={mute.value}
            audioOutput={audioOutput.value}
            displayResolution={displayResolution.value}
          />
          <VolumeVisualizer micDevice stream={mediaStream} height={height.value} />
        </div>
        <MediaStreamStatsReport stream={mediaStream} />
      </div>
    </div>
  );
}

export function RemoteVideos() {
  return (
    <div className={`row ${styles.root}`}>
      {remoteClients.value.map((client) => (
        <RemoteVideo key={client.connectionId} client={client} />
      ))}
    </div>
  );
}
