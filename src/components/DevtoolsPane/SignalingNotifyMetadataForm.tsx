import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledSignalingNotifyMetadata, setSignalingNotifyMetadata } from "@/app/actions";
import {
  $connectionStatus,
  $enabledSignalingNotifyMetadata,
  $signalingNotifyMetadata,
} from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const SignalingNotifyMetadataForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledSignalingNotifyMetadata(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="signalingNotifyMetadata"
          checked={$enabledSignalingNotifyMetadata.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          signalingNotifyMetadata
        </TooltipFormCheck>
      </FormRow>
      {$enabledSignalingNotifyMetadata.value ? (
        <JSONInputField
          controlId="signalingNotifyMetadata"
          placeholder="signalingNotifyMetadataを指定"
          value={$signalingNotifyMetadata.value}
          setValue={(value) => setSignalingNotifyMetadata(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
