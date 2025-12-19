import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledMetadata, setMetadata } from "@/app/actions";
import { $connectionStatus, $enabledMetadata, $metadata } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const MetadataForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledMetadata(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="metadata"
          checked={$enabledMetadata.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          metadata
        </TooltipFormCheck>
      </FormRow>
      {$enabledMetadata.value ? (
        <JSONInputField
          controlId="metadata"
          placeholder="Metadataを指定"
          value={$metadata.value}
          setValue={(value) => setMetadata(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
