import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledVideoVP9Params, setVideoVP9Params } from "@/app/actions";
import { $connectionStatus, $enabledVideoVP9Params, $videoVP9Params } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const VideoVP9ParamsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledVideoVP9Params(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="videoVP9Params"
          checked={$enabledVideoVP9Params.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          videoVP9Params
        </TooltipFormCheck>
      </FormRow>
      {$enabledVideoVP9Params.value ? (
        <JSONInputField
          controlId="videoVP9Params"
          placeholder="videoVP9Paramsを指定"
          value={$videoVP9Params.value}
          setValue={(value) => setVideoVP9Params(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
