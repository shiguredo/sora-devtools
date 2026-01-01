import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  FormInput,
  InputGroup,
} from "@/components/ui";

import { setResolution } from "@/app/actions";
import { resolution } from "@/app/signals";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

type ResolutionData = {
  label: string;
  value: string;
};

const RESOLUTION_DATA_LIST = [
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

const ResolutionDropdownItem = ({ label, value }: ResolutionData) => {
  return (
    <DropdownItem onClick={() => setResolution(value)}>
      {label} {value !== "" && `(${value})`}
    </DropdownItem>
  );
};

export function ResolutionForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setResolution(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="resolution">
      <TooltipFormLabel kind="resolution">resolution:</TooltipFormLabel>
      <InputGroup>
        <FormInput
          className="max-w-[130px]"
          type="text"
          value={resolution.value}
          onChange={onChange}
          placeholder="未指定"
        />
        <Dropdown>
          <DropdownToggle variant="outline-secondary" className="form-template-dropdown" />
          <DropdownMenu className="right-0">
            {RESOLUTION_DATA_LIST.map(({ label, value }) => {
              return <ResolutionDropdownItem key={value} label={label} value={value} />;
            })}
          </DropdownMenu>
        </Dropdown>
      </InputGroup>
    </FormGroup>
  );
}
