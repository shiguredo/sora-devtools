import { FormGroup } from "@/components/ui";

import { setReconnect } from "@/app/actions";
import { isFormDisabled, reconnect } from "@/app/signals";

import styles from "./ReconnectForm.module.css";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ReconnectForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setReconnect(target.checked);
  };
  return (
    <div className={styles.row}>
      <div>
        <FormGroup controlId="reconnect">
          <TooltipFormCheck
            kind="reconnect"
            checked={reconnect.value}
            onChange={onChange}
            disabled={disabled}
          >
            reconnect
          </TooltipFormCheck>
        </FormGroup>
      </div>
    </div>
  );
}
