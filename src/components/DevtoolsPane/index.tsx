import type { ComponentChildren, FunctionComponent } from "preact";

import { $mediaType, $role, $simulcast, $spotlight, $visiblePanels } from "@/app/store";
import { AlertMessages } from "@/components/AlertMessages";
import { LocalVideo } from "@/components/Video/LocalVideo";
import { RemoteVideos } from "@/components/Video/RemoteVideos";

import { AudioBitRateForm } from "./AudioBitRateForm.tsx";
import { AudioCodecTypeForm } from "./AudioCodecTypeForm.tsx";
import { AudioForm } from "./AudioForm.tsx";
import { AudioInputForm } from "./AudioInputForm.tsx";
import { AudioOutputForm } from "./AudioOutputForm.tsx";
import { ChannelIdForm } from "./ChannelIdForm.tsx";
import { ConnectButton } from "./ConnectButton.tsx";
import { DevicePanel } from "./DevicePanel.tsx";
import { DisconnectButton } from "./DisconnectButton.tsx";
import { FrameRateForm } from "./FrameRateForm.tsx";
import { MediaPanel } from "./MediaPanel.tsx";
import { ResolutionForm } from "./ResolutionForm.tsx";
import { RoleForm } from "./RoleForm.tsx";
import { SignalingPanel } from "./SignalingPanel.tsx";
import { SimulcastForm } from "./SimulcastForm.tsx";
import { SimulcastRequestRidForm } from "./SimulcastRequestRidForm.tsx";
import { SimulcastRidForm } from "./SimulcastRidForm.tsx";
import { SpotlightFocusRidForm } from "./SpotlightFocusRidForm.tsx";
import { SpotlightForm } from "./SpotlightForm.tsx";
import { SpotlightNumberForm } from "./SpotlightNumberForm.tsx";
import { SpotlightUnfocusRidForm } from "./SpotlightUnfocusRidForm.tsx";
import { VideoBitRateForm } from "./VideoBitRateForm.tsx";
import { VideoCodecTypeForm } from "./VideoCodecTypeForm.tsx";
import { VideoForm } from "./VideoForm.tsx";
import { VideoInputForm } from "./VideoInputForm.tsx";

// セクションコンポーネント
type SectionProps = {
  children: ComponentChildren;
};

const Section: FunctionComponent<SectionProps> = ({ children }) => {
  return <div className="form-section-card">{children}</div>;
};

// 接続セクション
const ConnectionSection: FunctionComponent = () => {
  const showCodecForms = $role.value !== "recvonly";

  return (
    <Section>
      <div className="form-row">
        <div className="form-channel-id">
          <ChannelIdForm />
        </div>
      </div>
      <div className="form-row">
        <RoleForm />
        <SimulcastForm />
        <SpotlightForm />
      </div>
      {$simulcast.value === "true" && $role.value !== "sendonly" && (
        <div className="form-row">
          <SimulcastRequestRidForm />
          <SimulcastRidForm />
        </div>
      )}
      {$spotlight.value === "true" && (
        <div className="form-row">
          <SpotlightNumberForm />
          <SpotlightFocusRidForm />
          <SpotlightUnfocusRidForm />
        </div>
      )}
      <div className="form-row">
        <AudioForm />
        {showCodecForms && (
          <>
            <AudioCodecTypeForm />
            <AudioBitRateForm />
          </>
        )}
      </div>
      <div className="form-row">
        <VideoForm />
        {showCodecForms && (
          <>
            <VideoCodecTypeForm />
            <VideoBitRateForm />
          </>
        )}
      </div>
      {$role.value !== "recvonly" && (
        <div className="form-row">
          <ResolutionForm />
          <FrameRateForm />
        </div>
      )}
      <div className="form-row">
        {$role.value !== "recvonly" && $mediaType.value === "getUserMedia" && (
          <>
            <AudioInputForm />
            <VideoInputForm />
          </>
        )}
        {$role.value !== "sendonly" && <AudioOutputForm />}
      </div>
      <div className="form-row mt-3">
        <div className="btn-group">
          <ConnectButton />
          <DisconnectButton />
        </div>
      </div>
    </Section>
  );
};

export const DevtoolsPane: FunctionComponent = () => {
  return (
    <div className="col-devtools">
      <AlertMessages />
      <ConnectionSection />
      {$visiblePanels.value.has("signaling") && <SignalingPanel />}
      {$visiblePanels.value.has("media") && <MediaPanel />}
      {$visiblePanels.value.has("device") && <DevicePanel />}
      <LocalVideo />
      {$role.value === "recvonly" || $role.value === "sendrecv" ? <RemoteVideos /> : null}
    </div>
  );
};
