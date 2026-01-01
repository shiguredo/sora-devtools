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
      <div className="group relative inline-block">
        <FormLabel className="cursor-help border-b border-dotted border-bs-secondary">
          {children}
        </FormLabel>
        <div
          className={`
            absolute z-50 bottom-full left-0 mb-2
            min-w-[200px] max-w-[300px] py-2 px-3
            text-sm text-bs-dark bg-white
            border border-sora rounded-md shadow-lg
            whitespace-pre-wrap
            invisible opacity-0
            group-hover:visible group-hover:opacity-100
            transition-opacity duration-150
          `}
        >
          {instruction.description}
        </div>
      </div>
    </>
  );
}
