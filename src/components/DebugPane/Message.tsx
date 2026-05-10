import { useSignal, useSignalEffect } from "@preact/signals";
import type { ComponentChild } from "preact";

import { timelineExpandAll } from "@/app/signals";
import { Collapse } from "@/components/ui";

import { formatUnixtime } from "@/utils";

import { CopyLogButton } from "./CopyLogButton.tsx";
import { JsonTree } from "./JsonTree.tsx";

interface DescriptionProps {
  description: string | number | Record<string, unknown> | undefined;
  prevDescription?: unknown;
  wordBreak?: boolean;
}

function Description(props: DescriptionProps) {
  const { description, prevDescription } = props;
  if (description === undefined) {
    return null;
  }
  if (typeof description !== "object") {
    return (
      <div className="text-white">
        <div className="py-1 px-4">
          <pre className="text-base text-white m-0 whitespace-pre-wrap break-all">
            {description}
          </pre>
        </div>
      </div>
    );
  }
  // prevDescription が渡されている場合は JsonTree を使用（差分更新あり）
  if (prevDescription !== undefined) {
    return (
      <div className="text-white">
        <div className="py-1 px-4">
          <JsonTree data={description} prevData={prevDescription} />
        </div>
      </div>
    );
  }
  // prevDescription がない場合は従来通り JSON.stringify
  return (
    <div className="text-white">
      <div className="py-1 px-4">
        <pre className="text-base text-white m-0 whitespace-pre-wrap break-all">
          {JSON.stringify(description, null, 2)}
        </pre>
      </div>
    </div>
  );
}

interface Props {
  timestamp: number | null;
  title: string;
  description: string | number | Record<string, unknown> | undefined;
  prevDescription?: unknown;
  defaultShow?: boolean;
  label?: ComponentChild;
  wordBreak?: boolean;
}

// 矢印アイコン（折りたたみ状態用）
function ArrowIcon({ expanded }: { expanded: boolean }) {
  const rotation = expanded ? "rotate-90" : "";
  return (
    <svg
      className={`inline-block w-2.5 h-2.5 mx-1.5 transition-transform ${rotation}`}
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
    <div className="border border-light rounded mb-1 bg-dark" data-title={title}>
      <div className="flex justify-between items-center break-words">
        <button
          type="button"
          className="
            cursor-pointer text-white w-full no-underline
            bg-transparent border-0 p-0 text-left font-inherit block
          "
          onClick={() => {
            show.value = !show.value;
          }}
          aria-controls={ariaControls}
          aria-expanded={show.value}
        >
          <ArrowIcon expanded={show.value} />
          {timestamp ? (
            <span className="text-white/50 mr-1">[{formatUnixtime(timestamp)}]</span>
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
        <div className="border-top">
          <Description
            description={description}
            prevDescription={prevDescription}
            wordBreak={props.wordBreak}
          />
        </div>
      </Collapse>
    </div>
  );
}
