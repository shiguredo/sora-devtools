import { setEnabledMetadata, setMetadata } from "@/app/actions";
import { enabledMetadata, isFormDisabled, metadata } from "@/app/signals";
import { FormGroup } from "@/components/ui";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function MetadataForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledMetadata(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledMetadata">
            <TooltipFormCheck
              kind="metadata"
              checked={enabledMetadata.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              metadata
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledMetadata.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="metadata"
              placeholder="Metadataを指定"
              value={metadata.value}
              setValue={(value) => setMetadata(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
