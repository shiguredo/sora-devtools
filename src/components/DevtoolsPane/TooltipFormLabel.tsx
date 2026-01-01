import type { ComponentChildren } from "preact";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";

import { FormLabel } from "@/components/ui";
import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: ComponentChildren;
};

/**
 * ツールチップ付きフォームラベル
 * hover で説明を表示する
 *
 * Bootstrap popover:
 * - z-index: 1070
 * - max-width: 350px
 * - border: 1px solid #0071bc (sora)
 *
 * position: fixed を使用して親要素の overflow に影響されないようにする
 */
export function TooltipFormLabel({ kind, children }: Props) {
  const instruction = INSTRUCTIONS[kind];
  const labelRef = useRef<HTMLDivElement>(null);
  const tooltipPos = useSignal<{ top: number; left: number } | null>(null);

  if (!instruction) {
    return <FormLabel>{children}</FormLabel>;
  }

  const handleMouseEnter = () => {
    if (labelRef.current) {
      const rect = labelRef.current.getBoundingClientRect();
      tooltipPos.value = {
        top: rect.top,
        left: rect.left,
      };
    }
  };

  const handleMouseLeave = () => {
    tooltipPos.value = null;
  };

  return (
    <div
      ref={labelRef}
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FormLabel className="cursor-help border-b border-dotted border-bs-secondary">
        {children}
      </FormLabel>
      {tooltipPos.value && (
        <div
          className={`
            fixed z-[1070]
            max-w-[350px] py-2 px-3
            text-base text-bs-dark bg-white
            border border-sora rounded-md shadow-lg
            whitespace-pre-wrap
          `}
          style={{
            top: `${tooltipPos.value.top - 8}px`,
            left: `${tooltipPos.value.left}px`,
            transform: "translateY(-100%)",
          }}
        >
          {instruction.description}
          {/* 下向き矢印 */}
          <div className="absolute top-full left-4 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-sora" />
        </div>
      )}
    </div>
  );
}
