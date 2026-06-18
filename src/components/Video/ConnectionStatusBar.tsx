import type { TargetedMouseEvent } from "preact";

import { Button } from "@/components/ui";
import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copyToClipboard } from "@/utils";
import * as signals from "@/app/signals";

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
    <div className="flex items-center">
      {props.label ? <p>{props.label}</p> : null}
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
