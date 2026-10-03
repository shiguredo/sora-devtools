import type { ComponentChildren } from "preact";

import styles from "./CollapseLink.module.css";

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
  // enabled のときはリンクを太字にする
  const linkClassName = enabled ? `${styles.link} ${styles.linkEnabled}` : styles.link;
  // 折りたたみ時以外は矢印を 180 度回転させる
  const arrowClassName = collapsed ? styles.arrow : `${styles.arrow} ${styles.arrowExpanded}`;

  return (
    <button type="button" onClick={onClick} className={linkClassName}>
      {children}
      <svg className={arrowClassName} fill="#212529" viewBox="0 0 16 16">
        <path
          fillRule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </button>
  );
}
