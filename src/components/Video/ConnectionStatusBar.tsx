import React from "react";

import { IconClipboard } from "@/components/IconClipboard";
import { copy2clipboard } from "@/utils";

type TextBoxProps = {
  text: string;
};
const TextBox: React.FC<TextBoxProps> = (props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  return (
    <div className="d-flex align-items-center border border-secondary rounded mx-1">
      <p className="mx-2 p-1">{props.text}</p>
      <div className="border-left border-secondary">
        <button className="btn btn-sm btn-light" onClick={onClick}>
          <IconClipboard />
        </button>
      </div>
    </div>
  );
};

type Props = {
  connectionId: string | null;
  clientId?: string | null;
};
export const ConnectionStatusBar: React.FC<Props> = (props) => {
  return (
    <div className="d-flex align-items-center mb-1 video-status-inner">
      {props.connectionId ? <TextBox text={props.connectionId} /> : null}
      {props.clientId !== null && props.clientId !== undefined && props.connectionId !== props.clientId ? (
        <TextBox text={props.clientId} />
      ) : null}
    </div>
  );
};
