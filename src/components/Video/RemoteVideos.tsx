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

import { ConnectionStatusBar } from "./ConnectionStatusBar.tsx";
import { JitterButter } from "./JitterBuffer.tsx";
import { RemoteVideoCapabilities } from "./RemoteVideoCapabilities.tsx";
import { RequestSimulcastRidButton } from "./RequestSimulcastRidButton.tsx";
import { RequestSpotlightRidBySendConnectionIdButton } from "./RequestSpotlightRidBySendConnectionIdButton.tsx";
import { ResetSpotlightRidBySendConnectionIdButton } from "./ResetSpotlightRidBySendConnectionIdButton.tsx";
import { Video } from "./Video.tsx";
import { VolumeVisualizer } from "./VolumeVisualizer.tsx";

const rtcMediaStreamTrackRegex = /^RTCMediaStreamTrack/;

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
    if (stats.id && !rtcMediaStreamTrackRegex.test(stats.id)) {
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
            <ul className="list-none p-4">
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
  const wrapperClasses = focused
    ? "border-[5px] border-bs-primary rounded-[5px]"
    : "border-[5px] border-black/10 rounded-[5px]";
  return (
    <div className="col-auto">
      <div className="flex flex-col top-0 left-0 whitespace-nowrap">
        <div className="flex items-center mb-1 first:*:ml-0">
          <ConnectionStatusBar connectionId={connectionId} clientId={clientId} />
          <JitterButter type="audio" stream={mediaStream} />
          <JitterButter type="video" stream={mediaStream} />
        </div>
        <div className="flex items-center mb-1 first:*:ml-0">
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
      <div className="flex flex-wrap items-start overflow-y-hidden">
        {/* オーバーレイするため position-relative を付けておくこと */}
        <div className={`relative flex flex-nowrap items-start ${wrapperClasses}`}>
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
    <div className="row my-2">
      {remoteClients.value.map((client) => (
        <RemoteVideo key={client.connectionId} client={client} />
      ))}
    </div>
  );
}
