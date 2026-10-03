import type { TargetedMouseEvent } from "preact";

import { Button } from "@/components/ui";
import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copyToClipboard } from "@/utils";
import * as signals from "@/app/signals";

import styles from "./StatusBar.module.css";

interface TextBoxProps {
  id?: string;
  label?: string;
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
      {props.label ? <p>{props.label}</p> : null}
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
  localVideo?: boolean;
  connectionId: string | null;
  clientId?: string | null;
}
export function ConnectionStatusBar(props: Props) {
  const { localVideo, connectionId, clientId } = props;
  return (
    <>
      {connectionId ? (
        <TextBox
          id={localVideo ? "local-video-connection-id" : undefined}
          label="connectionID:"
          text={connectionId}
        />
      ) : null}
      {clientId !== null && clientId !== undefined && connectionId !== clientId ? (
        <TextBox
          id={localVideo ? "local-video-client-id" : undefined}
          label="clientID:"
          text={clientId}
        />
      ) : null}
    </>
  );
}
