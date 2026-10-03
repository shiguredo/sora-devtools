import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";

import styles from "./Navbar.module.css";

interface NavbarProps {
  variant?: "light" | "dark";
  bg?: "sora";
  expand?: "sm" | "md" | "lg" | "xl" | boolean;
  fixed?: "top";
  className?: string;
  children: ComponentChildren;
}

interface NavbarBrandProps {
  href?: string;
  className?: string;
  children: ComponentChildren;
}

interface NavbarTextProps {
  className?: string;
  children: ComponentChildren;
}

interface NavbarCollapseProps {
  className?: string;
  children: ComponentChildren;
}

interface NavbarToggleProps {
  className?: string;
  onClick?: () => void;
}

interface NavbarContextType {
  isExpanded: boolean;
  toggle: () => void;
}

const NavbarContext = createContext<NavbarContextType>({
  isExpanded: false,
  toggle: () => {},
});

// bg プロパティに応じた背景クラスを返す
// 動的なクラス生成は行わないため、既知の "sora" のみ対応する
function getBackgroundClassName(bg: "sora" | undefined): string {
  if (bg === "sora") {
    return styles.backgroundSora;
  }
  return "";
}

// fixed プロパティに応じた固定位置クラスを返す
function getFixedPositionClassName(fixed: "top" | undefined): string {
  if (fixed === "top") {
    return styles.fixedTop;
  }
  return "";
}

/**
 * ナビゲーションバーコンポーネント
 * react-bootstrap の Navbar 互換
 *
 * Bootstrap navbar スタイル:
 * - display: flex, flex-wrap: nowrap
 * - align-items: center
 *
 * パディングは基底クラスに持たせない。基底クラスと className で渡す
 * パディングが競合すると、どちらが有効になるかは CSS の読み込み順に
 * 依存してしまうため、呼び出し側の className で明示する
 */
export function Navbar({
  variant = "light",
  bg,
  expand,
  fixed,
  className = "",
  children,
}: NavbarProps) {
  const isExpanded = useSignal(false);

  const variantClassName = variant === "dark" ? styles.variantDark : styles.variantLight;

  // bg が "sora" の場合は Sora ブランドカラーを使用
  const backgroundClassName = getBackgroundClassName(bg);

  const fixedPositionClassName = getFixedPositionClassName(fixed);

  // expand は現在未使用（常に flex-nowrap）
  void expand;

  // Context の値をメモ化して不要な再レンダリングを防ぐ
  const contextValue = useMemo(
    () => ({
      isExpanded: isExpanded.value,
      toggle: () => {
        isExpanded.value = !isExpanded.value;
      },
    }),
    [isExpanded.value],
  );

  return (
    <nav
      className={`${styles.root} ${variantClassName} ${backgroundClassName} ${fixedPositionClassName} ${className}`}
      data-expanded={isExpanded.value}
    >
      <NavbarContext.Provider value={contextValue}>{children}</NavbarContext.Provider>
    </nav>
  );
}

/**
 * ナビゲーションバーブランド
 */
export function NavbarBrand({ href, className = "", children }: NavbarBrandProps) {
  // Bootstrap .navbar-brand: font-size: 1.25rem, line-height: inherit (30px), padding: 5px 0
  const baseClassName = styles.brand;

  if (href) {
    return (
      <a href={href} className={`${baseClassName} ${className}`}>
        {children}
      </a>
    );
  }

  return <span className={`${baseClassName} ${className}`}>{children}</span>;
}

/**
 * ナビゲーションバーテキスト
 */
export function NavbarText({ className = "", children }: NavbarTextProps) {
  return <span className={`${styles.text} ${className}`}>{children}</span>;
}

/**
 * ナビゲーションバーコラプス
 */
export function NavbarCollapse({ className = "", children }: NavbarCollapseProps) {
  const { isExpanded } = useContext(NavbarContext);
  const visibilityClassName = isExpanded ? styles.collapseOpen : styles.collapseClosed;

  return <div className={`${styles.collapse} ${visibilityClassName} ${className}`}>{children}</div>;
}

/**
 * ナビゲーションバートグル（モバイル用ハンバーガーメニュー）
 */
export function NavbarToggle({ className = "", onClick }: NavbarToggleProps) {
  const { toggle } = useContext(NavbarContext);

  const handleClick = () => {
    toggle();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.toggle} ${className}`}
      aria-label="Toggle navigation"
    >
      <svg className={styles.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
