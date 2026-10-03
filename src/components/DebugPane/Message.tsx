import { useSignal, useSignalEffect } from "@preact/signals";
import type { ComponentChild } from "preact";

import { timelineExpandAll } from "@/app/signals";
import { Collapse } from "@/components/ui";

import { formatUnixtime } from "@/utils";

import styles from "./Message.module.css";

import { CopyLogButton } from "./CopyLogButton.tsx";
import { JsonTree } from "./JsonTree.tsx";

interface DescriptionProps {
  description: string | number | Record<string, unknown> | unknown[] | undefined;
  prevDescription?: unknown;
}

function Description(props: DescriptionProps) {
  const { description, prevDescription } = props;
  if (description === undefined) {
    return null;
  }
  if (typeof description !== "object") {
    return (
      <div className={styles.description}>
        <div className={styles.descriptionBody}>
          <pre className={styles.pre}>{description}</pre>
        </div>
      </div>
    );
  }
  // prevDescription が渡されている場合は JsonTree を使用（差分更新あり）
  if (prevDescription !== undefined) {
    return (
      <div className={styles.description}>
        <div className={styles.descriptionBody}>
          <JsonTree data={description} prevData={prevDescription} />
        </div>
      </div>
    );
  }
  // prevDescription がない場合は従来通り JSON.stringify
  return (
    <div className={styles.description}>
      <div className={styles.descriptionBody}>
        <pre className={styles.pre}>{JSON.stringify(description, null, 2)}</pre>
      </div>
    </div>
  );
}

interface Props {
  timestamp: number | null;
  title: string;
  description: string | number | Record<string, unknown> | unknown[] | undefined;
  prevDescription?: unknown;
  defaultShow?: boolean;
  label?: ComponentChild;
}

// 矢印アイコン（折りたたみ状態用）
function ArrowIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`${styles.arrow} ${expanded ? styles.arrowExpanded : ""}`}
      fill="none"
      stroke="white"
      strokeWidth="2"
      viewBox="0 0 8 12"
    >
      <path d="M1 1l5 5-5 5" />
    </svg>
  );
}

export function Message(props: Props) {
  const { defaultShow, description, prevDescription, title, timestamp, label } = props;
  const show = useSignal(defaultShow ?? false);
  const ariaControls = timestamp ? title + timestamp : title;

  // 全開/全閉シグナルに反応
  useSignalEffect(() => {
    if (timelineExpandAll.value !== null) {
      show.value = timelineExpandAll.value;
    }
  });
  return (
    <div className={`${styles.root} bg-dark`} data-title={title}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.titleButton}
          onClick={() => {
            show.value = !show.value;
          }}
          aria-controls={ariaControls}
          aria-expanded={show.value}
        >
          <ArrowIcon expanded={show.value} />
          {timestamp ? (
            <span className={styles.timestamp}>[{formatUnixtime(timestamp)}]</span>
          ) : null}
          {label}
          <span>{title}</span>
        </button>
        <div className="border-left">
          <CopyLogButton
            text={
              typeof description === "string" ? description : JSON.stringify(description, null, 2)
            }
          />
        </div>
      </div>
      <Collapse in={show.value}>
        <div>
          <Description description={description} prevDescription={prevDescription} />
        </div>
      </Collapse>
    </div>
  );
}
