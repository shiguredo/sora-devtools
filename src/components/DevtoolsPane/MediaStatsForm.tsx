import { FormGroup } from "react-bootstrap";

import { mediaStats, setMediaStats } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MediaStatsForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setMediaStats(target.checked);
  };
  return (
    <FormGroup className="form-inline" controlId="mediaStats">
      <TooltipFormCheck
        kind="mediaStats"
        checked={mediaStats.value}
        onChange={onChange}
        disabled={false}
      >
        Show media stats
      </TooltipFormCheck>
    </FormGroup>
  );
}
