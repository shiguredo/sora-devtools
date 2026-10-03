import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { createContext } from "preact";
import { useCallback, useContext, useEffect, useMemo, useRef } from "preact/hooks";

import styles from "./Dropdown.module.css";

interface DropdownProps {
  className?: string;
  children: ComponentChildren;
}

interface DropdownToggleProps {
  variant?: "primary" | "secondary" | "outline-secondary";
  disabled?: boolean;
  className?: string;
  children?: ComponentChildren;
  onClick?: () => void;
}

interface DropdownMenuProps {
  show?: boolean;
  className?: string;
  children: ComponentChildren;
}

interface DropdownItemProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ComponentChildren;
}

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

    if (!isOpen.value) {
      return;
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen.value]);

  const toggle = useCallback(() => {
    isOpen.value = !isOpen.value;
  }, [isOpen]);
  const close = useCallback(() => {
    isOpen.value = false;
  }, [isOpen]);

  // Context の値をメモ化して不要な再レンダリングを防ぐ
  const contextValue = useMemo(
    () => ({ isOpen: isOpen.value, toggle, close }),
    [isOpen.value, toggle, close],
  );

  return (
    <div ref={containerRef} className={`${styles.dropdown} ${className}`}>
      <DropdownContext.Provider value={contextValue}>{children}</DropdownContext.Provider>
    </div>
  );
}

// シンプルな Context
interface DropdownContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

// variant の値と CSS Modules のクラス名を対応付ける
const variantClassNames = {
  primary: styles.primary,
  secondary: styles.secondary,
  "outline-secondary": styles.outlineSecondary,
} as const;

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

  // children がない場合は InputGroup 内のドロップダウンボタンとしてコンパクトに
  const isCompact = !children;
  const sizeClassName = isCompact ? styles.toggleCompact : styles.toggleNormal;

  const handleClick = () => {
    toggle();
    onClick?.();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`${styles.toggle} ${sizeClassName} ${variantClassNames[variant]} ${className}`}
    >
      {children}
      {/* ドロップダウン矢印（FormSelect と同じデザイン） */}
      <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 16 16">
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

  if (!visible) {
    return null;
  }

  return <div className={`${styles.menu} ${className}`}>{children}</div>;
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

  const activeClassName = active ? styles.itemActive : styles.itemInactive;
  const disabledClassName = disabled ? styles.itemDisabled : styles.itemEnabled;

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
      className={`${styles.item} ${activeClassName} ${disabledClassName} ${className}`}
    >
      {children}
    </button>
  );
}
