import { setEnabledVideoH265Params, setVideoH265Params } from "@/app/actions";
import { enabledVideoH265Params, isFormDisabled, videoH265Params } from "@/app/signals";
import { FormGroup } from "@/components/ui";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoH265ParamsForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledVideoH265Params(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledVideoH265Params">
            <TooltipFormCheck
              kind="videoH265Params"
              checked={enabledVideoH265Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH265Params
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledVideoH265Params.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="videoH265Params"
              placeholder="videoH265Paramsを指定"
              value={videoH265Params.value}
              setValue={(value) => {
                setVideoH265Params(value);
              }}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
