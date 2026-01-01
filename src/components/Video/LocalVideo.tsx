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
  if (audio.value === false && video.value === false) {
    return null;
  }
  const wrapperClasses = focused
    ? "border-[5px] border-bs-primary rounded-[5px]"
    : "border-[5px] border-black/10 rounded-[5px]";
  return (
    <div className="flex">
      <div className={`relative flex flex-nowrap items-start overflow-y-hidden ${wrapperClasses}`}>
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
          localVideo={true}
          mute={true}
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
    <div className="row my-1">
      <div className="col-auto">
        <div className="flex flex-col top-0 left-0 whitespace-nowrap mb-1">
          {sessionId.value !== null ? (
            <div className="flex items-center mb-1 first:*:ml-0">
              <SessionStatusBar sessionId={sessionId.value} />
            </div>
          ) : null}
          {connectionId.value !== null || soraClientId.value !== null ? (
            <div className="flex items-center mb-1 first:*:ml-0">
              <ConnectionStatusBar
                connectionId={connectionId.value}
                clientId={soraClientId.value}
                localVideo={true}
              />
            </div>
          ) : null}
          {connectionId.value !== null &&
          spotlight.value !== "true" &&
          simulcast.value === "true" &&
          role.value !== "sendonly" ? (
            <div className="flex items-center mb-1 first:*:ml-0">
              <TooltipFormLabel kind="changeAllRecvStream">change all:</TooltipFormLabel>
              <RequestSimulcastRidButton rid={"none"} />
              <RequestSimulcastRidButton rid={"r0"} />
              <RequestSimulcastRidButton rid={"r1"} />
              <RequestSimulcastRidButton rid={"r2"} />
            </div>
          ) : null}
          {connectionId.value !== null && spotlight.value === "true" ? (
            <div className="flex items-center mb-1 first:*:ml-0">
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
