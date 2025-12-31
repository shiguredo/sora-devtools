import type { JSX } from "preact";

import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

type TextBoxProps = {
  id?: string;
  label?: string;
  text: string;
};
function TextBox(props: TextBoxProps) {
  const onClick = (event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
    void copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  return (
    <div className="flex items-center">
      {props.label ? <p>{props.label}</p> : null}
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
  localVideo?: boolean;
  connectionId: string | null;
  clientId?: string | null;
};
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
