import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";
import { createContext } from "preact";
import { useContext, useMemo } from "preact/hooks";

interface NavbarProps {
  variant?: "light" | "dark";
  bg?: string;
  expand?: "sm" | "md" | "lg" | "xl" | boolean;
  fixed?: "top" | "bottom";
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

// bg プロパティに応じた背景スタイルを返す
function getBgStyles(bg: string | undefined): string {
  if (bg === "sora") {
    return "bg-[#0071bc]";
  }
  if (bg) {
    return `bg-${bg}`;
  }
  return "";
}

// fixed プロパティに応じた固定位置スタイルを返す
function getFixedStyles(fixed: "top" | "bottom" | undefined): string {
  if (fixed === "top") {
    return "fixed top-0 left-0 right-0 z-50";
  }
  if (fixed === "bottom") {
    return "fixed bottom-0 left-0 right-0 z-50";
  }
  return "";
}

/**
 * ナビゲーションバーコンポーネント
 * react-bootstrap の Navbar 互換
 *
 * Bootstrap navbar スタイル:
 * - display: flex, flex-wrap: wrap
 * - align-items: center
 * - padding: 0.5rem 1rem
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

  const variantStyles = variant === "dark" ? "text-white" : "text-gray-900";

  // bg が "sora" の場合は Sora ブランドカラーを使用
  const bgStyles = getBgStyles(bg);

  const fixedStyles = getFixedStyles(fixed);

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
      className={`
        flex flex-nowrap items-center justify-start py-2 px-0
        ${variantStyles} ${bgStyles} ${fixedStyles} ${className}
      `}
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
  const baseStyles = "text-xl font-semibold whitespace-nowrap py-[5px] leading-[30px]";

  if (href) {
    return (
      <a href={href} className={`${baseStyles} ${className}`}>
        {children}
      </a>
    );
  }

  return <span className={`${baseStyles} ${className}`}>{children}</span>;
}

/**
 * ナビゲーションバーテキスト
 */
export function NavbarText({ className = "", children }: NavbarTextProps) {
  return <span className={`inline-block ${className}`}>{children}</span>;
}

/**
 * ナビゲーションバーコラプス
 */
export function NavbarCollapse({ className = "", children }: NavbarCollapseProps) {
  const { isExpanded } = useContext(NavbarContext);
  const visibilityStyles = isExpanded ? "block" : "hidden lg:block";

  return (
    <div className={`w-full lg:flex lg:w-auto lg:items-center ${visibilityStyles} ${className}`}>
      {children}
    </div>
  );
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
      className={`lg:hidden p-2 text-gray-500 hover:text-gray-700 ${className}`}
      aria-label="Toggle navigation"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
