import React from "react";

import { IconClipboard } from "@/components/IconClipboard";
import { copy2clipboard } from "@/utils";

type TextBoxProps = {
  id?: string;
  text: string;
};
const TextBox: React.FC<TextBoxProps> = (props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  return (
    <div className="d-flex align-items-center border border-secondary rounded mx-1">
      <p id={props.id} className="mx-2 p-1">
        {props.text}
      </p>
      <div className="border-left border-secondary">
        <button className="btn btn-sm btn-light" onClick={onClick}>
          <IconClipboard />
        </button>
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
      {connectionId ? <TextBox id={localVideo ? "local-video-connection-id" : undefined} text={connectionId} /> : null}
      {clientId !== null && clientId !== undefined && connectionId !== clientId ? (
        <TextBox id={localVideo ? "local-video-client-id" : undefined} text={clientId} />
      ) : null}
    </>
  );
};
