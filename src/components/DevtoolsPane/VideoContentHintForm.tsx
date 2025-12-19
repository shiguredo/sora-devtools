import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setVideoContentHint } from "@/app/actions";
import { $videoContentHint } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { VIDEO_CONTENT_HINTS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const VideoContentHintForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, VIDEO_CONTENT_HINTS)) {
      setVideoContentHint(event.currentTarget.value as (typeof VIDEO_CONTENT_HINTS)[number]);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="videoContentHint">videoContentHint:</TooltipFormLabel>
      <FormSelect value={$videoContentHint.value} onChange={onChange}>
        {VIDEO_CONTENT_HINTS.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
