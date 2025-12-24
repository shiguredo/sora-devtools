import type React from "react";

import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

type TextBoxProps = {
  id?: string;
  label?: string;
  text: string;
};
const TextBox: React.FC<TextBoxProps> = (props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    void copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  return (
    <div className="d-flex align-items-center">
      {props.label ? <p>{props.label}</p> : null}
      <div className="d-flex align-items-center border border-secondary rounded mx-1">
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
};

type Props = {
  localVideo?: boolean;
  connectionId: string | null;
  clientId?: string | null;
};
export const ConnectionStatusBar: React.FC<Props> = (props) => {
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
};
