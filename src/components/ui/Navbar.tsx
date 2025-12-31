import { useSignal } from "@preact/signals";
import type { ComponentChildren } from "preact";

type NavbarProps = {
  variant?: "light" | "dark";
  bg?: string;
  expand?: "sm" | "md" | "lg" | "xl" | boolean;
  fixed?: "top" | "bottom";
  className?: string;
  children: ComponentChildren;
};

type NavbarBrandProps = {
  href?: string;
  className?: string;
  children: ComponentChildren;
};

type NavbarTextProps = {
  className?: string;
  children: ComponentChildren;
};

type NavbarCollapseProps = {
  className?: string;
  children: ComponentChildren;
};

type NavbarToggleProps = {
  className?: string;
  onClick?: () => void;
};

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

  // bg が "sora" の場合は App.css の .bg-sora を使用
  const bgStyles = bg === "sora" ? "bg-sora" : bg ? `bg-${bg}` : "";

  const fixedStyles =
    fixed === "top"
      ? "fixed top-0 left-0 right-0 z-50"
      : fixed === "bottom"
        ? "fixed bottom-0 left-0 right-0 z-50"
        : "";

  // expand は現在未使用（常に flex-nowrap）
  void expand;

  const baseStyles = [
    "flex flex-nowrap items-center justify-start",
    "py-2 px-0",
    variantStyles,
    bgStyles,
    fixedStyles,
  ].join(" ");

  return (
    <nav className={`${baseStyles} ${className}`} data-expanded={isExpanded.value}>
      <NavbarContext.Provider
        value={{
          isExpanded: isExpanded.value,
          toggle: () => {
            isExpanded.value = !isExpanded.value;
          },
        }}
      >
        {children}
      </NavbarContext.Provider>
    </nav>
  );
}

// Navbar Context
import { createContext } from "preact";
import { useContext } from "preact/hooks";

type NavbarContextType = {
  isExpanded: boolean;
  toggle: () => void;
};

const NavbarContext = createContext<NavbarContextType>({
  isExpanded: false,
  toggle: () => {},
});

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

  const baseStyles = [
    "w-full lg:flex lg:w-auto lg:items-center",
    isExpanded ? "block" : "hidden lg:block",
  ].join(" ");

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
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
