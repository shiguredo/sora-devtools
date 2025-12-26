import { Dropdown, DropdownButton, Form, FormGroup, InputGroup } from "react-bootstrap";

import { setVideoBitRate } from "@/app/actions";
import { isFormDisabled, videoBitRate } from "@/app/signals";
import { VIDEO_BIT_RATES } from "@/constants";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

// 15000 を超える場合にサポート外であることを表示するためのカスタム
const DISPLAY_VIDEO_BIT_RATE: string[] = VIDEO_BIT_RATES.slice();
DISPLAY_VIDEO_BIT_RATE.splice(VIDEO_BIT_RATES.indexOf("15000") + 1, 0, "support-message");

const dropdownItemLabel = (value: string) => {
  if (value === "support-message") {
    return "以下はサポート外です";
  }
  return value === "" ? "未指定" : value;
};

export function VideoBitRateForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setVideoBitRate(target.value);
  };
  return (
    <FormGroup className="form-inline" controlId="videoBitRate">
      <TooltipFormLabel kind="videoBitRate">videoBitRate:</TooltipFormLabel>
      <InputGroup>
        <Form.Control
          className="form-video-bit-rate"
          type="text"
          value={videoBitRate.value}
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
          {DISPLAY_VIDEO_BIT_RATE.map((value) => {
            return (
              <Dropdown.Item
                key={value}
                as="button"
                onClick={() => setVideoBitRate(value)}
                disabled={value === "support-message"}
              >
                {dropdownItemLabel(value)}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </InputGroup>
    </FormGroup>
  );
}
