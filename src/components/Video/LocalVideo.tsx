import { useSignal } from "@preact/signals";

import {
  audio,
  audioOutput,
  connectionId,
  displayResolution,
  focusedSpotlightConnectionIds,
  localMediaStream,
  mediaStats,
  micDevice,
  role,
  sessionId,
  simulcast,
  soraClientId,
  spotlight,
  video,
} from "@/app/signals";

import styles from "./LocalVideo.module.css";

import { TooltipFormLabel } from "../DevtoolsPane/TooltipFormLabel.tsx";
import { ConnectionStatusBar } from "./ConnectionStatusBar.tsx";
import { LocalVideoCapabilities } from "./LocalVideoCapabilities.tsx";
import { RequestSimulcastRidButton } from "./RequestSimulcastRidButton.tsx";
import { RequestSpotlightRidButton } from "./RequestSpotlightRidButton.tsx";
import { ResetSpotlightRidButton } from "./ResetSpotlightRidButton.tsx";
import { SessionStatusBar } from "./SessionStatusBar.tsx";
import { Video } from "./Video.tsx";
import { VolumeVisualizer } from "./VolumeVisualizer.tsx";

function VideoBox() {
  const height = useSignal<number>(0);
  const focused = connectionId.value && focusedSpotlightConnectionIds.value[connectionId.value];
  if (!audio.value && !video.value) {
    return null;
  }
  const wrapperClasses = focused ? styles.focused : styles.unfocused;
  return (
    <div className={styles.videoContainer}>
      <div className={`${styles.videoWrapper} ${wrapperClasses}`}>
        {mediaStats.value &&
          localMediaStream.value &&
          localMediaStream.value.getVideoTracks().length > 0 && (
            <LocalVideoCapabilities stream={localMediaStream.value} />
          )}
        <Video
          stream={localMediaStream.value}
          setHeight={(value: number) => {
            height.value = value;
          }}
          audioOutput={audioOutput.value}
          displayResolution={displayResolution.value}
          localVideo
          mute
        />
        {localMediaStream.value !== null ? (
          <VolumeVisualizer
            micDevice={micDevice.value}
            stream={localMediaStream.value}
            height={height.value}
          />
        ) : null}
      </div>
    </div>
  );
}

export function LocalVideo() {
  return (
    <div className={`row ${styles.root}`}>
      <div className="col-auto">
        <div className={styles.statusList}>
          {sessionId.value !== null ? (
            <div className={styles.statusRow}>
              <SessionStatusBar sessionId={sessionId.value} />
            </div>
          ) : null}
          {connectionId.value !== null || soraClientId.value !== null ? (
            <div className={styles.statusRow}>
              <ConnectionStatusBar
                connectionId={connectionId.value}
                clientId={soraClientId.value}
                localVideo
              />
            </div>
          ) : null}
          {connectionId.value !== null &&
          spotlight.value !== "true" &&
          simulcast.value === "true" &&
          role.value !== "sendonly" ? (
            <div className={styles.statusRow}>
              <TooltipFormLabel kind="changeAllRecvStream">change all:</TooltipFormLabel>
              <RequestSimulcastRidButton rid="none" />
              <RequestSimulcastRidButton rid="r0" />
              <RequestSimulcastRidButton rid="r1" />
              <RequestSimulcastRidButton rid="r2" />
            </div>
          ) : null}
          {connectionId.value !== null && spotlight.value === "true" ? (
            <div className={styles.statusRow}>
              <RequestSpotlightRidButton />
              <ResetSpotlightRidButton />
            </div>
          ) : null}
        </div>
        {localMediaStream.value !== null && role.value !== "recvonly" ? <VideoBox /> : null}
      </div>
    </div>
  );
}
