import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSimulcastRequestRid } from "@/app/actions";
import { $connectionStatus, $simulcastRequestRid } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SIMULCAST_REQUEST_RID } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SimulcastRequestRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SIMULCAST_REQUEST_RID)) {
      setSimulcastRequestRid(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="simulcastRequestRid">simulcastRequestRid:</TooltipFormLabel>
      <FormSelect value={$simulcastRequestRid.value} onChange={onChange} disabled={disabled}>
        {SIMULCAST_REQUEST_RID.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
