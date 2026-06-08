import type { ComponentChildren } from "preact";

interface CollapseLinkProps {
  collapsed: boolean;
  enabled?: boolean;
  onClick: (event: Event) => void;
  children: ComponentChildren;
}

/**
 * 折りたたみ可能なセクションのリンクコンポーネント
 */
export function CollapseLink({ collapsed, enabled = false, onClick, children }: CollapseLinkProps) {
  const fontWeight = enabled ? "font-bold" : "";
  const arrowRotation = collapsed ? "" : "rotate-180";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        underline flex items-center w-full
        text-bs-dark border-0 rounded-none
        bg-transparent p-0 cursor-pointer [font-family:inherit] [font-size:inherit]
        ${fontWeight}
      `}
    >
      {children}
      <svg
        className={`shrink-0 w-5 h-5 ml-2.5 transition-transform duration-200 ${arrowRotation}`}
        fill="#212529"
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </button>
  );
}
