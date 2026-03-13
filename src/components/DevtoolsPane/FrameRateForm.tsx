import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  FormInput,
  InputGroup,
} from "@/components/ui";

import { setFrameRate } from "@/app/actions";
import { frameRate } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

interface FrameRateData {
  label: string;
  value: string;
}

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

const FrameRateDropdownItem = ({ label, value }: FrameRateData) => (
  <DropdownItem
    onClick={() => {
      setFrameRate(value);
    }}
  >
    {label}
  </DropdownItem>
);

export function FrameRateForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setFrameRate(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="frameRate">
      <TooltipFormLabel kind="frameRate">frameRate:</TooltipFormLabel>
      <InputGroup>
        <FormInput
          className="max-w-[100px]"
          type="text"
          value={frameRate.value}
          onChange={onChange}
          placeholder="未指定"
        />
        <Dropdown>
          <DropdownToggle variant="outline-secondary" />
          <DropdownMenu>
            {FRAME_RATE_DATA.map(({ label, value }) => (
              <FrameRateDropdownItem key={value} label={label} value={value} />
            ))}
          </DropdownMenu>
        </Dropdown>
      </InputGroup>
    </FormGroup>
  );
}
