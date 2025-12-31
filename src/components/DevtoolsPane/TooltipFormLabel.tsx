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
    <div className="group relative inline-block">
      <FormLabel className="cursor-help border-b border-dotted border-gray-400">
        {children}
      </FormLabel>
      <div
        className={[
          "invisible group-hover:visible",
          "absolute z-50",
          "bottom-full left-0 mb-2",
          "min-w-[200px] max-w-[300px]",
          "px-3 py-2",
          "text-sm text-gray-900",
          "bg-white",
          "border border-gray-200 rounded-md",
          "shadow-lg",
          "whitespace-pre-wrap",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-150",
        ].join(" ")}
      >
        {instruction.description}
      </div>
    </div>
  );
}
