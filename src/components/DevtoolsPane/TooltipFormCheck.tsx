import type { ComponentChildren } from "preact";

import { FormLabel, FormSwitch } from "@/components/ui";
import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: ComponentChildren;
  checked: boolean;
  disabled: boolean;
  onChange: (event: Event) => void;
};

/**
 * ツールチップ付きスイッチコンポーネント
 * スイッチ + hover で説明を表示するラベル
 */
export function TooltipFormCheck({ kind, children, checked, disabled, onChange }: Props) {
  const instruction = INSTRUCTIONS[kind];

  if (!instruction) {
    return (
      <>
        <FormSwitch checked={checked} onChange={onChange} disabled={disabled} />
        <FormLabel>{children}</FormLabel>
      </>
    );
  }

  return (
    <>
      <FormSwitch checked={checked} onChange={onChange} disabled={disabled} />
      <div className="tooltip-container relative inline-block">
        <FormLabel className="tooltip-label">{children}</FormLabel>
        <div className="tooltip-balloon">{instruction.description}</div>
      </div>
    </>
  );
}
