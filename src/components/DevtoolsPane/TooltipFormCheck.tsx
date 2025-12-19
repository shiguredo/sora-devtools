import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";
import { useSignal } from "@preact/signals";
import { useRef, useEffect } from "preact/hooks";

import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  onChange: (event: TargetedEvent<HTMLInputElement>) => void;
};

export const TooltipFormCheck: FunctionComponent<Props> = (props) => {
  const { children, kind, checked, onChange, disabled } = props;
  const instruction = INSTRUCTIONS[kind];
  const inputId = `switch-${kind}`;
  const showTooltip = useSignal(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip.value && wrapperRef.current && tooltipRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      tooltip.style.left = `${wrapperRect.left}px`;
      // 上に表示
      tooltip.style.top = `${wrapperRect.top - tooltip.offsetHeight - 8}px`;
    }
  }, [showTooltip.value]);

  if (!instruction) {
    return (
      <span className="form-label" id={inputId}>
        {children}
      </span>
    );
  }

  return (
    <span
      ref={wrapperRef}
      className="inline-flex items-center gap-2 cursor-help"
      onMouseEnter={() => (showTooltip.value = true)}
      onMouseLeave={() => (showTooltip.value = false)}
    >
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-checked={checked}
        className="w-9 h-5 appearance-none bg-slate-300 rounded-full cursor-pointer transition-colors duration-200 checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform before:duration-200 checked:before:translate-x-4"
      />
      <label htmlFor={inputId} className="form-check-label border-b border-dotted border-slate-400">
        {children}
      </label>
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
