import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { FormGroup, FormTextarea } from "@/components/ui";
import {
  enabledSignalingUrlCandidates,
  isFormDisabled,
  signalingUrlCandidates,
} from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function SignalingUrlCandidatesForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledSignalingUrlCandidates(target.checked);
  };
  const onChangeText = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setSignalingUrlCandidates(target.value.split("\n"));
  };
  const textareaPlaceholder = `signalingUrlCandidatesを指定
(例)
wss://sora0.example.com/signaling
wss://sora1.example.com/signaling
`;
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledSignalingUrlCandidates">
            <TooltipFormCheck
              kind="signalingUrlCandidates"
              checked={enabledSignalingUrlCandidates.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingUrlCandidates
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledSignalingUrlCandidates.value ? (
        <div className="form-row">
          <div className="col-auto">
            <FormGroup className="flex items-center gap-2" controlId="signalingNotifyMetadata">
              <FormTextarea
                className="flex-fill"
                placeholder={textareaPlaceholder}
                value={signalingUrlCandidates.value.join("\n")}
                onChange={onChangeText}
                rows={5}
                cols={100}
                disabled={disabled}
              />
            </FormGroup>
          </div>
        </div>
      ) : null}
    </>
  );
}
