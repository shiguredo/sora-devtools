import { FormGroup } from "@/components/ui";

import { mediaStats, setMediaStats } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MediaStatsForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setMediaStats(target.checked);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="mediaStats">
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
