import type { TargetedMouseEvent } from "preact";

import { Button } from "@/components/ui";
import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copyToClipboard } from "@/utils";
import * as signals from "@/app/signals";

import styles from "./StatusBar.module.css";

interface TextBoxProps {
  id?: string;
  text: string;
}
function TextBox(props: TextBoxProps) {
  const onClick = async (event: TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
    event.currentTarget.blur();
    const success = await copyToClipboard(props.text);
    if (!success) {
      signals.setAPIErrorAlertMessage("failed to copy text to clipboard");
    }
  };
  return (
    <div className={styles.root}>
      <p>sessionID:</p>
      <div className={`${styles.box} border-secondary`}>
        <p id={props.id} className={styles.text}>
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
