import { setEnabledVideoAV1Params, setVideoAV1Params } from "@/app/actions";
import { enabledVideoAV1Params, isFormDisabled, videoAV1Params } from "@/app/signals";
import { FormGroup } from "@/components/ui";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function VideoAV1ParamsForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledVideoAV1Params(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledVideoAV1Params">
            <TooltipFormCheck
              kind="videoAV1Params"
              checked={enabledVideoAV1Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoAV1Params
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledVideoAV1Params.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="videoAV1Params"
              placeholder="videoAV1Paramsを指定"
              value={videoAV1Params.value}
              setValue={(value) => setVideoAV1Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
