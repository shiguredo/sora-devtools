import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  FormInput,
  InputGroup,
} from "@/components/ui";

import { setAudioBitRate } from "@/app/actions";
import { audioBitRate, isFormDisabled } from "@/app/signals";
import { AUDIO_BIT_RATES } from "@/constants";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function AudioBitRateForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setAudioBitRate(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="audioBitRate">
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <InputGroup>
        <FormInput
          className="form-audio-bit-rate"
          type="text"
          value={audioBitRate.value}
          onChange={onChange}
          placeholder="未指定"
          disabled={disabled}
        />
        <Dropdown>
          <DropdownToggle variant="outline-secondary" disabled={disabled} />
          <DropdownMenu>
            {AUDIO_BIT_RATES.map((value) => {
              return (
                <DropdownItem key={value} onClick={() => setAudioBitRate(value)}>
                  {value === "" ? "未指定" : value}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
      </InputGroup>
    </FormGroup>
  );
}
