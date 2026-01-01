import type { ComponentChildren } from "preact";

type PopoverProps = {
  content: ComponentChildren;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  children: ComponentChildren;
};

/**
 * ポップオーバー（ツールチップ）コンポーネント
 * react-bootstrap の Popover + OverlayTrigger 互換
 *
 * CSS の group + group-hover で表示制御
 *
 * Bootstrap popover:
 * - position: absolute
 * - z-index: 1070
 * - max-width: 276px
 * - background-color: white
 * - border: 1px solid rgba(0, 0, 0, 0.2)
 * - border-radius: 0.375rem
 * - box-shadow
 */
export function Popover({ content, placement = "top", className = "", children }: PopoverProps) {
  const placementStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowStyles = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-200 border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-200 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-200 border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-200 border-y-transparent border-l-transparent",
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div
        className={`
          absolute z-50 max-w-xs px-3 py-2 text-sm
          bg-white border border-gray-200 rounded-md shadow-lg
          invisible opacity-0
          group-hover:visible group-hover:opacity-100
          transition-opacity duration-150
          ${placementStyles[placement]}
        `}
      >
        {content}
        {/* 矢印 */}
        <div
          className={`absolute w-0 h-0 border-4 ${arrowStyles[placement]}`}
          style={{ borderWidth: "6px" }}
        />
      </div>
    </div>
  );
}
