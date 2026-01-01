import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";

type DropdownProps = {
  className?: string;
  children: ComponentChildren;
};

type DropdownToggleProps = {
  variant?: "primary" | "secondary" | "outline-secondary";
  disabled?: boolean;
  className?: string;
  children?: ComponentChildren;
  onClick?: () => void;
};

type DropdownMenuProps = {
  show?: boolean;
  className?: string;
  children: ComponentChildren;
};

type DropdownItemProps = {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ComponentChildren;
};

/**
 * ドロップダウンコンテナ
 * react-bootstrap の Dropdown 互換
 */
export function Dropdown({ className = "", children }: DropdownProps) {
  const isOpen = useSignal(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        isOpen.value = false;
      }
    }

    if (isOpen.value) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen.value]);

  const toggle = useCallback(() => {
    isOpen.value = !isOpen.value;
  }, [isOpen]);
  const close = useCallback(() => {
    isOpen.value = false;
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`inline-flex self-stretch ${className}`}>
      <DropdownContext.Provider value={{ isOpen: isOpen.value, toggle, close }}>
        {children}
      </DropdownContext.Provider>
    </div>
  );
}

// シンプルな Context
import { createContext } from "preact";
import { useContext } from "preact/hooks";

type DropdownContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const DropdownContext = createContext<DropdownContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

/**
 * ドロップダウントグルボタン
 */
export function DropdownToggle({
  variant = "secondary",
  disabled = false,
  className = "",
  children,
  onClick,
}: DropdownToggleProps) {
  const { toggle } = useContext(DropdownContext);

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 border-gray-600",
    "outline-secondary": "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
  };

  // children がない場合は InputGroup 内のドロップダウンボタンとしてコンパクトに
  const isCompact = !children;
  const sizeStyles = isCompact ? "px-2 self-stretch rounded-l-none" : "px-3 py-1.5 gap-1";

  const handleClick = () => {
    toggle();
    onClick?.();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        ${sizeStyles}
        text-base leading-normal border rounded-md cursor-pointer
        transition-colors duration-150
        ${variantStyles[variant]}
        focus:outline-none focus:ring-2 focus:ring-blue-400/25
        disabled:opacity-65 disabled:cursor-not-allowed disabled:bg-[#e9ecef]
        ${className}
      `}
    >
      {children}
      {/* ドロップダウン矢印（FormSelect と同じデザイン） */}
      <svg
        className={isCompact ? "w-4 h-3" : "w-4 h-3"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 16 16"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m2 5 6 6 6-6" />
      </svg>
    </button>
  );
}

/**
 * ドロップダウンメニュー
 */
export function DropdownMenu({ show, className = "", children }: DropdownMenuProps) {
  const { isOpen } = useContext(DropdownContext);
  const visible = show ?? isOpen;

  if (!visible) return null;

  return (
    <div
      className={`
        absolute z-50 top-full right-0
        min-w-40 max-h-[300px] overflow-y-auto
        mt-1 py-1 bg-white
        border border-gray-200 rounded-md shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ドロップダウンアイテム
 */
export function DropdownItem({
  active = false,
  disabled = false,
  onClick,
  className = "",
  children,
}: DropdownItemProps) {
  const { close } = useContext(DropdownContext);

  const activeStyles = active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  const handleClick = () => {
    if (!disabled) {
      onClick?.();
      close();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        block w-full px-4 py-2
        text-left text-sm transition-colors duration-150
        ${activeStyles} ${disabledStyles}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
