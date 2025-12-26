import { Dropdown, DropdownButton, Form, FormGroup, InputGroup } from "react-bootstrap";

import { setFrameRate } from "@/app/actions";
import { frameRate } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

type FrameRateData = {
  label: string;
  value: string;
};

const FRAME_RATE_DATA = [
  { label: "未指定", value: "" },
  { label: "60", value: "60" },
  { label: "30", value: "30" },
  { label: "24", value: "24" },
  { label: "20", value: "20" },
  { label: "15", value: "15" },
  { label: "10", value: "10" },
  { label: "5", value: "5" },
];

const DropdownItem = ({ label, value }: FrameRateData) => {
  return (
    <Dropdown.Item as="button" onClick={() => setFrameRate(value)}>
      {label}
    </Dropdown.Item>
  );
};

export function FrameRateForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setFrameRate(target.value);
  };
  return (
    <FormGroup className="form-inline" controlId="frameRate">
      <TooltipFormLabel kind="frameRate">frameRate:</TooltipFormLabel>
      <InputGroup>
        <Form.Control
          className="form-frame-rate"
          type="text"
          value={frameRate.value}
          onChange={onChange}
          placeholder="未指定"
        />
        <DropdownButton variant="outline-secondary form-template-dropdown" title="" align="end">
          {FRAME_RATE_DATA.map(({ label, value }) => {
            return <DropdownItem key={value} label={label} value={value} />;
          })}
        </DropdownButton>
      </InputGroup>
    </FormGroup>
  );
}
