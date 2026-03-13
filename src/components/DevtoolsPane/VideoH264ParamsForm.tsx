import { setEnabledVideoH264Params, setVideoH264Params } from "@/app/actions";
import { enabledVideoH264Params, isFormDisabled, videoH264Params } from "@/app/signals";
import { FormGroup } from "@/components/ui";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoH264ParamsForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledVideoH264Params(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledVideoH264Params">
            <TooltipFormCheck
              kind="videoH264Params"
              checked={enabledVideoH264Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH264Params
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledVideoH264Params.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="videoH264Params"
              placeholder="videoH264Paramsを指定"
              value={videoH264Params.value}
              setValue={(value) => {
                setVideoH264Params(value);
              }}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
