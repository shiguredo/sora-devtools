import type { JSX } from "preact";

import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

type TextBoxProps = {
  id?: string;
  text: string;
};
function TextBox(props: TextBoxProps) {
  const onClick = (event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
    void copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  return (
    <div className="flex items-center">
      <p>sessionID:</p>
      <div className="flex items-center border border-secondary rounded mx-1">
        <p id={props.id} className="mx-2 p-1">
          {props.text}
        </p>
        <div className="border-left border-secondary">
          <button type="button" className="btn btn-sm btn-light" onClick={onClick}>
            <ClipboardIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = {
  sessionId: string;
};
export function SessionStatusBar(props: Props) {
  const { sessionId } = props;
  return <TextBox id="session-id" text={sessionId} />;
}
