import { useSignal } from "@preact/signals";
import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

type DropdownItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

type Props = {
  inputClassName?: string;
  inputValue: string;
  inputPlaceholder?: string;
  inputDisabled?: boolean;
  onInputChange: (event: TargetedEvent<HTMLInputElement>) => void;
  dropdownDisabled?: boolean;
  items: DropdownItem[];
  onItemClick: (value: string) => void;
};

export const DropdownInput: FunctionComponent<Props> = (props) => {
  const {
    inputClassName = "",
    inputValue,
    inputPlaceholder,
    inputDisabled = false,
    onInputChange,
    dropdownDisabled = false,
    items,
    onItemClick,
  } = props;

  const isOpen = useSignal(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        isOpen.value = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!dropdownDisabled) {
      isOpen.value = !isOpen.value;
    }
  };

  const handleItemClick = (value: string, disabled?: boolean) => {
    if (disabled) return;
    onItemClick(value);
    isOpen.value = false;
  };

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <input
        type="text"
        className={`px-3 py-1.5 text-base border border-slate-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 ${inputClassName}`}
        value={inputValue}
        onChange={onInputChange}
        placeholder={inputPlaceholder}
        disabled={inputDisabled}
      />
      <button
        type="button"
        className="px-2 py-1.5 border border-l-0 border-slate-300 rounded-r bg-slate-50 hover:bg-slate-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
        onClick={handleToggle}
        disabled={dropdownDisabled}
        aria-expanded={isOpen.value}
      >
        <svg
          className="w-4 h-4 text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen.value && (
        <ul className="absolute top-full left-0 z-50 mt-1 min-w-full max-h-60 overflow-auto bg-white border border-slate-300 rounded shadow-lg">
          {items.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${item.disabled ? "text-slate-400 cursor-not-allowed" : "text-slate-700"}`}
                onClick={() => handleItemClick(item.value, item.disabled)}
                disabled={item.disabled}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
