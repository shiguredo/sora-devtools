import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setMediaStats } from "@/app/actions";
import { $mediaStats } from "@/app/store";
import { FormRow } from "@/components/Form";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const MediaStatsForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setMediaStats(event.currentTarget.checked);
  };
  return (
    <FormRow>
      <TooltipFormCheck
        kind="mediaStats"
        checked={$mediaStats.value}
        onChange={onChange}
        disabled={false}
      >
        Show media stats
      </TooltipFormCheck>
    </FormRow>
  );
};
