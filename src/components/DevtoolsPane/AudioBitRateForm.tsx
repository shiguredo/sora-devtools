import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setAudioBitRate } from "@/app/actions";
import { $audioBitRate, $connectionStatus } from "@/app/store";
import { FormRow } from "@/components/Form";
import { AUDIO_BIT_RATES } from "@/constants";
import { isFormDisabled } from "@/utils";

import { DropdownInput } from "./DropdownInput.tsx";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioBitRateForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setAudioBitRate(event.currentTarget.value);
  };
  const items = AUDIO_BIT_RATES.map((value) => ({
    label: value === "" ? "未指定" : value,
    value,
  }));
  return (
    <FormRow>
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <DropdownInput
        inputClassName="w-24"
        inputValue={$audioBitRate.value}
        inputPlaceholder="未指定"
        inputDisabled={disabled}
        onInputChange={onChange}
        dropdownDisabled={disabled}
        items={items}
        onItemClick={setAudioBitRate}
      />
    </FormRow>
  );
};
