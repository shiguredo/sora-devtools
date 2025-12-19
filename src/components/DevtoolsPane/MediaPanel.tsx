import type { FunctionComponent } from "preact";

import { $mediaType, $role } from "@/app/store";

import { AspectRatioForm } from "./AspectRatioForm.tsx";
import { AudioContentHintForm } from "./AudioContentHintForm.tsx";
import { AutoGainControlForm } from "./AutoGainControlForm.tsx";
import { BlurRadiusForm } from "./BlurRadiusForm.tsx";
import { EchoCancellationForm } from "./EchoCancellationForm.tsx";
import { EchoCancellationTypeForm } from "./EchoCancellationTypeForm.tsx";
import { FacingModeForm } from "./FacingModeForm.tsx";
import { FakeVolumeForm } from "./FakeVolumeForm.tsx";
import { MediaProcessorsNoiseSuppressionForm } from "./MediaProcessorsNoiseSuppressionForm.tsx";
import { MediaTypeForm } from "./MediaTypeForm.tsx";
import { Mp4FileForm } from "./Mp4FileForm.tsx";
import { NoiseSuppressionForm } from "./NoiseSuppressionForm.tsx";
import { ResizeModeForm } from "./ResizeModeForm.tsx";
import { UpdateMediaStreamButton } from "./UpdateMediaStreamButton.tsx";
import { VideoContentHintForm } from "./VideoContentHintForm.tsx";

export const MediaPanel: FunctionComponent = () => {
  return (
    <div className="panel-card">
      <h3 className="panel-title">Media</h3>
      <div className="space-y-3">
        {$role.value !== "recvonly" && (
          <div className="flex flex-wrap gap-2">
            <MediaTypeForm />
          </div>
        )}
        {$role.value !== "recvonly" && $mediaType.value === "fakeMedia" && (
          <div className="flex flex-wrap gap-2">
            <FakeVolumeForm />
          </div>
        )}
        {$role.value !== "recvonly" && $mediaType.value === "mp4Media" && (
          <div className="flex flex-wrap gap-2">
            <Mp4FileForm />
          </div>
        )}
        <div className="border-t border-slate-200 pt-3">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Audio</h4>
          <div className="flex flex-wrap gap-2">
            <AudioContentHintForm />
            <AutoGainControlForm />
            <NoiseSuppressionForm />
            <EchoCancellationForm />
            <EchoCancellationTypeForm />
            <MediaProcessorsNoiseSuppressionForm />
          </div>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <h4 className="text-sm font-medium text-slate-600 mb-2">Video</h4>
          <div className="flex flex-wrap gap-2">
            <VideoContentHintForm />
            <AspectRatioForm />
            <ResizeModeForm />
            <BlurRadiusForm />
            <FacingModeForm />
          </div>
        </div>
        {$role.value !== "recvonly" && (
          <div className="border-t border-slate-200 pt-3">
            <UpdateMediaStreamButton />
          </div>
        )}
      </div>
    </div>
  );
};
