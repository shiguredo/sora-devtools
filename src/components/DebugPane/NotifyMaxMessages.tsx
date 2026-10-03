import { setMaxNotifyMessages } from "@/app/actions";
import { maxNotifyMessages } from "@/app/signals";
import { FormGroup, FormLabel, FormSelect } from "@/components/ui";

import styles from "./NotifyMaxMessages.module.css";

const OPTIONS = [100, 500, 1000, 5000] as const;

export function NotifyMaxMessages() {
  const currentMax = maxNotifyMessages.value;

  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setMaxNotifyMessages(Number(target.value));
  };

  return (
    <FormGroup className={styles.group} controlId="maxNotifyMessages">
      <FormLabel className={styles.label}>Max:</FormLabel>
      <FormSelect value={String(currentMax)} onChange={onChange}>
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}
