import { useSignal } from "@preact/signals";
import type { FunctionComponent } from "preact";

import {
  $audio,
  $audioOutput,
  $connectionId,
  $displayResolution,
  $focusedSpotlightConnectionIds,
  $localMediaStream,
  $mediaStats,
  $micDevice,
  $role,
  $sessionId,
  $simulcast,
  $soraClientId,
  $spotlight,
  $video,
} from "@/app/store";

import { TooltipFormLabel } from "../DevtoolsPane/TooltipFormLabel.tsx";
import { ConnectionStatusBar } from "./ConnectionStatusBar.tsx";
import { LocalVideoCapabilities } from "./LocalVideoCapabilities.tsx";
import { RequestSimulcastRidButton } from "./RequestSimulcastRidButton.tsx";
import { RequestSpotlightRidButton } from "./RequestSpotlightRidButton.tsx";
import { ResetSpotlightRidButton } from "./ResetSpotlightRidButton.tsx";
import { SessionStatusBar } from "./SessionStatusBar.tsx";
import { Video } from "./Video.tsx";
import { VolumeVisualizer } from "./VolumeVisualizer.tsx";

const VideoBox: FunctionComponent = () => {
  const height = useSignal(0);
  const focused = $connectionId.value && $focusedSpotlightConnectionIds.value[$connectionId.value];
  if ($audio.value === false && $video.value === false) {
    return null;
  }
  return (
    <div className="flex">
      <div
        className={`relative flex flex-nowrap items-start video-wrapper overflow-y-hidden${
          focused ? " spotlight-focused" : ""
        }`}
      >
        {$mediaStats.value &&
          $localMediaStream.value &&
          $localMediaStream.value.getVideoTracks().length > 0 && (
            <LocalVideoCapabilities stream={$localMediaStream.value} />
          )}
        <Video
          stream={$localMediaStream.value}
          height={height}
          audioOutput={$audioOutput.value}
          displayResolution={$displayResolution.value}
          localVideo={true}
          mute={true}
        />
        {$localMediaStream.value !== null ? (
          <VolumeVisualizer
            micDevice={$micDevice.value}
            stream={$localMediaStream.value}
            height={height}
          />
        ) : null}
      </div>
    </div>
  );
};

export const LocalVideo: FunctionComponent = () => {
  return (
    <div className="flex flex-wrap my-1">
      <div className="flex-none">
        <div className="video-status mb-1">
          {$sessionId.value !== null ? (
            <div className="flex items-center mb-1 video-status-inner">
              <SessionStatusBar sessionId={$sessionId.value} />
            </div>
          ) : null}
          {$connectionId.value !== null || $soraClientId.value !== null ? (
            <div className="flex items-center mb-1 video-status-inner">
              <ConnectionStatusBar
                connectionId={$connectionId.value}
                clientId={$soraClientId.value}
                localVideo={true}
              />
            </div>
          ) : null}
          {$connectionId.value !== null &&
          $spotlight.value !== "true" &&
          $simulcast.value === "true" &&
          $role.value !== "sendonly" ? (
            <div className="flex items-center mb-1 video-status-inner">
              <TooltipFormLabel kind="changeAllRecvStream">change all:</TooltipFormLabel>
              <RequestSimulcastRidButton rid={"none"} />
              <RequestSimulcastRidButton rid={"r0"} />
              <RequestSimulcastRidButton rid={"r1"} />
              <RequestSimulcastRidButton rid={"r2"} />
            </div>
          ) : null}
          {$connectionId.value !== null && $spotlight.value === "true" ? (
            <div className="flex items-center mb-1 video-status-inner">
              <RequestSpotlightRidButton />
              <ResetSpotlightRidButton />
            </div>
          ) : null}
        </div>
        {$localMediaStream.value !== null && $role.value !== "recvonly" ? <VideoBox /> : null}
      </div>
    </div>
  );
};
