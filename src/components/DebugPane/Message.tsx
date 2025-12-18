import { useSignal } from "@preact/signals";
import type { JSX } from "preact";
import { memo } from "preact/compat";

import { formatUnixtime } from "@/utils";

import { CopyLogButton } from "./CopyLogButton.tsx";
import { JsonTree } from "./JsonTree.tsx";

type DescriptionProps = {
  description: string | number | Record<string, unknown>;
  prevDescription?: unknown;
  wordBreak?: boolean;
};
const Description = memo<DescriptionProps>((props) => {
  const { description, prevDescription } = props;
  if (description === undefined) {
    return null;
  }
  if (typeof description !== "object") {
    return (
      <div className="debug-message">
        <div className="col-sm-12">
          <pre className={props.wordBreak ? "word-break" : ""}>{description}</pre>
        </div>
      </div>
    );
  }
  // prevDescription が渡されている場合は JsonTree を使用（差分更新あり）
  if (prevDescription !== undefined) {
    return (
      <div className="debug-message">
        <div className="col-sm-12">
          <div className={props.wordBreak ? "word-break" : ""}>
            <JsonTree data={description} prevData={prevDescription} />
          </div>
        </div>
      </div>
    );
  }
  // prevDescription がない場合は従来通り JSON.stringify
  return (
    <div className="debug-message">
      <div className="col-sm-12">
        <pre className={props.wordBreak ? "word-break" : ""}>
          {JSON.stringify(description, null, 2)}
        </pre>
      </div>
    </div>
  );
});

type Props = {
  timestamp: number | null;
  title: string;
  description: string | number | Record<string, unknown>;
  prevDescription?: unknown;
  defaultShow?: boolean;
  label?: JSX.Element | null;
  wordBreak?: boolean;
};
export const Message = memo<Props>((props) => {
  const { defaultShow, description, prevDescription, title, timestamp, label } = props;
  const show = useSignal(defaultShow === undefined ? false : defaultShow);
  const ariaControls = timestamp ? title + timestamp : title;
  const disabled = description === undefined;
  return (
    <div className="debug-message-card" data-title={title}>
      <div className="debug-message-header">
        <button
          type="button"
          className={`debug-title ${disabled ? "disabled" : ""}`}
          onClick={() => {
            show.value = !show.value;
          }}
          aria-controls={ariaControls}
          aria-expanded={show.value}
        >
          <i
            className={`${show.value ? "arrow-bottom" : "arrow-right"} ${disabled ? "disabled" : ""}`}
          />{" "}
          {timestamp ? (
            <span className="debug-timestamp">[{formatUnixtime(timestamp)}]</span>
          ) : null}
          {label}
          <span>{title}</span>
        </button>
        <div>
          <CopyLogButton
            text={
              typeof description === "string" ? description : JSON.stringify(description, null, 2)
            }
            disabled={disabled}
          />
        </div>
      </div>
      <div className={`collapse${show.value ? " show" : ""}`}>
        <div className="debug-message-body">
          <Description
            description={description}
            prevDescription={prevDescription}
            wordBreak={props.wordBreak}
          />
        </div>
      </div>
    </div>
  );
});
