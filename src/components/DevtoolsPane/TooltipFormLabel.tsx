import type { ComponentChildren } from "preact";

import { FormLabel } from "@/components/ui";
import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: ComponentChildren;
};

/**
 * ツールチップ付きフォームラベル
 * hover で説明を表示する
 */
export function TooltipFormLabel({ kind, children }: Props) {
  const instruction = INSTRUCTIONS[kind];

  if (!instruction) {
    return <FormLabel>{children}</FormLabel>;
  }

  return (
    <div className="tooltip-container relative inline-block">
      <FormLabel className="tooltip-label">{children}</FormLabel>
      <div className="tooltip-balloon">{instruction.description}</div>
    </div>
  );
}
