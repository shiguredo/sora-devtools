import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledVideoAV1Params, setVideoAV1Params } from "@/app/actions";
import { $connectionStatus, $enabledVideoAV1Params, $videoAV1Params } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const VideoAV1ParamsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledVideoAV1Params(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="videoAV1Params"
          checked={$enabledVideoAV1Params.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          videoAV1Params
        </TooltipFormCheck>
      </FormRow>
      {$enabledVideoAV1Params.value ? (
        <JSONInputField
          controlId="videoAV1Params"
          placeholder="videoAV1Paramsを指定"
          value={$videoAV1Params.value}
          setValue={(value) => setVideoAV1Params(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
