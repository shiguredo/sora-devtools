import type { FunctionComponent } from "preact";
import { useSignal } from "@preact/signals";
import { useRef, useEffect } from "preact/hooks";

import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: React.ReactNode;
};

export const TooltipFormLabel: FunctionComponent<Props> = (props) => {
  const instruction = INSTRUCTIONS[props.kind];
  const showTooltip = useSignal(false);
  const labelRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip.value && labelRef.current && tooltipRef.current) {
      const labelRect = labelRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      tooltip.style.left = `${labelRect.left}px`;
      // 上に表示
      tooltip.style.top = `${labelRect.top - tooltip.offsetHeight - 8}px`;
    }
  }, [showTooltip.value]);

  if (!instruction) {
    return <span className="form-label">{props.children}</span>;
  }

  return (
    <span
      ref={labelRef}
      className="form-label cursor-help border-b border-dotted border-slate-400"
      onMouseEnter={() => (showTooltip.value = true)}
      onMouseLeave={() => (showTooltip.value = false)}
    >
      {props.children}
      {showTooltip.value && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-4 py-3 text-base text-black bg-white border border-slate-300 rounded-lg shadow-xl whitespace-pre-wrap max-w-md"
        >
          {instruction.description}
        </div>
      )}
    </span>
  );
};
