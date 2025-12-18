import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledVideoH265Params, setVideoH265Params } from "@/app/actions";
import { $connectionStatus, $enabledVideoH265Params, $videoH265Params } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const VideoH265ParamsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledVideoH265Params(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="videoH265Params"
          checked={$enabledVideoH265Params.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          videoH265Params
        </TooltipFormCheck>
      </FormRow>
      {$enabledVideoH265Params.value ? (
        <JSONInputField
          controlId="videoH265Params"
          placeholder="videoH265Paramsを指定"
          value={$videoH265Params.value}
          setValue={(value) => setVideoH265Params(value)}
          disabled={disabled}
        />
      ) : null}
    </>
  );
};
