import { FormGroup, FormSelect } from "@/components/ui";

import { setRole } from "@/app/actions";
import { isFormDisabled, localMediaStream, role } from "@/app/signals";
import { ROLES } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function RoleForm() {
  const disabled = localMediaStream.value !== null || isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, ROLES)) {
      setRole(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="role">
      <TooltipFormLabel kind="role">role:</TooltipFormLabel>
      <FormSelect name="role" value={role.value} onChange={onChange} disabled={disabled}>
        {ROLES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}
