import type { FunctionComponent } from "preact";

import { $role } from "@/app/store";

import { AudioTrackForm } from "./AudioTrackForm.tsx";
import { CameraDeviceForm } from "./CameraDeviceForm.tsx";
import { DisplayResolutionForm } from "./DisplayResolutionForm.tsx";
import { DisposeMediaButton } from "./DisposeMediaButton.tsx";
import { MediaStatsForm } from "./MediaStatsForm.tsx";
import { MicDeviceForm } from "./MicDeviceForm.tsx";
import { ReloadDevicesButton } from "./ReloadDevicesButton.tsx";
import { RequestMediaButton } from "./RequestMediaButton.tsx";
import { VideoTrackForm } from "./VideoTrackForm.tsx";

export const DevicePanel: FunctionComponent = () => {
  return (
    <div className="panel-card">
      <h3 className="panel-title">Device</h3>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="btn-group">
            <ReloadDevicesButton />
            {$role.value !== "recvonly" && (
              <>
                <RequestMediaButton />
                <DisposeMediaButton />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <DisplayResolutionForm />
          <MediaStatsForm />
        </div>
        {$role.value !== "recvonly" && (
          <div className="flex flex-wrap gap-2">
            <MicDeviceForm />
            <CameraDeviceForm />
            <AudioTrackForm />
            <VideoTrackForm />
          </div>
        )}
      </div>
    </div>
  );
};
