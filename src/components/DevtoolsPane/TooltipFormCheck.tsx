import type { ComponentChildren } from "preact";

import { FormLabel, FormSwitch } from "@/components/ui";
import { INSTRUCTIONS } from "@/constants";

import styles from "./TooltipFormCheck.module.css";

interface Props {
  kind: string;
  children: ComponentChildren;
  checked: boolean;
  disabled: boolean;
  onChange: (event: Event) => void;
}

/**
 * ツールチップ付きスイッチコンポーネント
 * スイッチ + hover で説明を表示するラベル
 */
export function TooltipFormCheck({ kind, children, checked, disabled, onChange }: Props) {
  const instruction = INSTRUCTIONS[kind];

  if (!instruction) {
    return (
      <>
        <FormSwitch id={kind} checked={checked} onChange={onChange} disabled={disabled} />
        <FormLabel htmlFor={kind} className={styles.label}>
          {children}
        </FormLabel>
      </>
    );
  }

  return (
    <>
      <FormSwitch id={kind} checked={checked} onChange={onChange} disabled={disabled} />
      <div className={styles.wrapper}>
        <FormLabel htmlFor={kind} className={`${styles.label} ${styles.dottedLabel}`}>
          {children}
        </FormLabel>
        <div className={styles.tooltip}>{instruction.description}</div>
      </div>
    </>
  );
}
