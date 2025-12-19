import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setVideo } from "@/app/actions";
import { $connectionStatus, $video } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const VideoForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setVideo(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck kind="video" checked={$video.value} onChange={onChange} disabled={disabled}>
        video
      </TooltipFormCheck>
    </FormRow>
  );
};
