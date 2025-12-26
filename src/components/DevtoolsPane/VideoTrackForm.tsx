import { FormGroup } from "react-bootstrap";

import { setVideoTrack } from "@/app/actions";
import { videoTrack } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoTrackForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setVideoTrack(target.checked);
  };
  return (
    <FormGroup className="form-inline" controlId="videoTrack">
      <TooltipFormCheck
        kind="videoTrack"
        checked={videoTrack.value}
        onChange={onChange}
        disabled={false}
      >
        Enable video track
      </TooltipFormCheck>
    </FormGroup>
  );
}
