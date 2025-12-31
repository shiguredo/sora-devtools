import { FormGroup, FormSelect } from "@/components/ui";

import { setVideoContentHint } from "@/app/actions";
import { videoContentHint } from "@/app/signals";
import { VIDEO_CONTENT_HINTS } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function VideoContentHintForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, VIDEO_CONTENT_HINTS)) {
      setVideoContentHint(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="videoContentHint">
      <TooltipFormLabel kind="videoContentHint">videoContentHint:</TooltipFormLabel>
      <FormSelect name="videoContentHint" value={videoContentHint.value} onChange={onChange}>
        {VIDEO_CONTENT_HINTS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
}
