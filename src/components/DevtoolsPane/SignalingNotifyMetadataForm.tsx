import { setEnabledSignalingNotifyMetadata, setSignalingNotifyMetadata } from "@/app/actions";
import { FormGroup } from "@/components/ui";
import {
  enabledSignalingNotifyMetadata,
  isFormDisabled,
  signalingNotifyMetadata,
} from "@/app/signals";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function SignalingNotifyMetadataForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledSignalingNotifyMetadata(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledSignalingNotifyMetadata">
            <TooltipFormCheck
              kind="signalingNotifyMetadata"
              checked={enabledSignalingNotifyMetadata.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingNotifyMetadata
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledSignalingNotifyMetadata.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="signalingNotifyMetadata"
              placeholder="signalingNotifyMetadataを指定"
              value={signalingNotifyMetadata.value}
              setValue={(value) => {
                setSignalingNotifyMetadata(value);
              }}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
