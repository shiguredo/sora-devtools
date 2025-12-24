import type React from "react";
import { Dropdown, DropdownButton, Form, FormGroup, InputGroup } from "react-bootstrap";

import { setAudioBitRate } from "@/app/actions";
import { useSoraDevtoolsStore } from "@/app/store";
import { AUDIO_BIT_RATES } from "@/constants";
import { isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const AudioBitRateForm: React.FC = () => {
  const audioBitRate = useSoraDevtoolsStore((state) => state.audioBitRate);
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioBitRate(event.target.value);
  };
  return (
    <FormGroup className="form-inline" controlId="audioBitRate">
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <InputGroup>
        <Form.Control
          className="form-audio-bit-rate"
          type="text"
          value={audioBitRate}
          onChange={onChange}
          placeholder="未指定"
          disabled={disabled}
        />
        <DropdownButton
          variant="outline-secondary form-template-dropdown"
          title=""
          align="end"
          disabled={disabled}
        >
          {AUDIO_BIT_RATES.map((value) => {
            return (
              <Dropdown.Item key={value} as="button" onClick={() => setAudioBitRate(value)}>
                {value === "" ? "未指定" : value}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </InputGroup>
    </FormGroup>
  );
};
