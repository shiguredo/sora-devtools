import type { TargetedMouseEvent } from "preact";

import { Button } from "@/components/ui";
import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

interface TextBoxProps {
  id?: string;
  text: string;
}
function TextBox(props: TextBoxProps) {
  const onClick = (event: TargetedMouseEvent<HTMLButtonElement>): void => {
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
          <Button variant="light" size="sm" onClick={onClick}>
            <ClipboardIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  sessionId: string;
}
export function SessionStatusBar(props: Props) {
  const { sessionId } = props;
  return <TextBox id="session-id" text={sessionId} />;
}
