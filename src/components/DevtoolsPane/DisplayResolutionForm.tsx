import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  FormInput,
  InputGroup,
} from "@/components/ui";

import { setDisplayResolution } from "@/app/actions";
import { displayResolution } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

type DisplayResolutionData = {
  label: string;
  value: string;
};

const DISPLAY_RESOLUTION_DATA_LIST = [
  { label: "未指定", value: "" },
  { label: "144p", value: "256x144" },
  { label: "240p", value: "320x240" },
  { label: "360p", value: "640x360" },
  { label: "480p", value: "720x480" },
  { label: "540p", value: "960x540" },
  { label: "720p", value: "1280x720" },
  { label: "1080p", value: "1920x1080" },
  { label: "1440p", value: "2560x1440" },
  { label: "2160p", value: "3840x2160" },
];

const DisplayResolutionDropdownItem = ({ label, value }: DisplayResolutionData) => {
  return (
    <DropdownItem onClick={() => setDisplayResolution(value)}>
      {label} {value !== "" && `(${value})`}
    </DropdownItem>
  );
};

export function DisplayResolutionForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setDisplayResolution(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="displayResolution">
      <TooltipFormLabel kind="displayResolution">displayResolution:</TooltipFormLabel>
      <InputGroup>
        <FormInput
          className="form-display-resolution"
          type="text"
          value={displayResolution.value}
          onChange={onChange}
          placeholder="未指定"
        />
        <Dropdown>
          <DropdownToggle variant="outline-secondary" />
          <DropdownMenu className="right-0">
            {DISPLAY_RESOLUTION_DATA_LIST.map(({ label, value }) => {
              return <DisplayResolutionDropdownItem key={value} label={label} value={value} />;
            })}
          </DropdownMenu>
        </Dropdown>
      </InputGroup>
    </FormGroup>
  );
}
