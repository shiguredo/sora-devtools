import { FormGroup } from "@/components/ui";

import { setAudioTrack } from "@/app/actions";
import { audioTrack } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function AudioTrackForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setAudioTrack(target.checked);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="audioTrack">
      <TooltipFormCheck
        kind="audioTrack"
        checked={audioTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable audio track
      </TooltipFormCheck>
    </FormGroup>
  );
}
