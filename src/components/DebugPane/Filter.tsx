import { setDebugFilterText } from "@/app/actions";
import { debugFilterText, timelineExpandAll } from "@/app/signals";
import { FormGroup, FormInput, FormLabel } from "@/components/ui";

import styles from "./Filter.module.css";

export function DebugFilter() {
  const debugFilterTextValue = debugFilterText.value;
  const isExpanded = timelineExpandAll.value === true;

  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setDebugFilterText(target.value);
  };

  const handleToggle = (): void => {
    timelineExpandAll.value = !isExpanded;
  };

  return (
    <FormGroup className={styles.group} controlId="channelId">
      <button type="button" className={styles.toggleButton} onClick={handleToggle}>
        {isExpanded ? "▼" : "▶"}
      </button>
      <FormLabel className={styles.label}>Filter:</FormLabel>
      <FormInput
        type="text"
        placeholder="Filter"
        value={debugFilterTextValue}
        onChange={onChange}
        className={styles.input}
      />
    </FormGroup>
  );
}
