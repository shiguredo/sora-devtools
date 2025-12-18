import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setVideoTrack } from "@/app/actions";
import { $videoTrack } from "@/app/store";
import { FormRow } from "@/components/Form";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const VideoTrackForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setVideoTrack(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck
        kind="videoTrack"
        checked={$videoTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable video track
      </TooltipFormCheck>
    </FormRow>
  );
};
