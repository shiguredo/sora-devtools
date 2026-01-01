import { FormGroup } from "@/components/ui";

import { setVideo } from "@/app/actions";
import { isFormDisabled, video } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setVideo(target.checked);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="video">
      <TooltipFormCheck
        kind="video"
        checked={video.value}
        onChange={onChange}
        disabled={isFormDisabled.value}
      >
        video
      </TooltipFormCheck>
    </FormGroup>
  );
}
