import React from "react";

import ButtonCamera from "@/components/Button/Camera";
import ButtonMic from "@/components/Button/Mic";
import IconClipboard from "@/components/IconClipboard";
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
    <div className="d-flex align-items-center border border-secondary rounded mr-1">
      <p className="mx-2 p-1">{props.text}</p>
      <div className="border-left border-secondary">
        <button className="btn btn-sm btn-light" onClick={onClick}>
          <IconClipboard />
        </button>
      </div>
    </div>
  );
};

const MediaButton: React.FC = () => {
  return (
    <div className="ml-2">
      <ButtonMic />
      <ButtonCamera />
    </div>
  );
};

type Props = {
  connectionId: string | null;
  clientId?: string | null;
  showMediaButton?: boolean;
  spotlightId?: string;
};
const ConnectionStatusBar: React.FC<Props> = (props) => {
  return (
    <>
      {props.connectionId ? <TextBox text={props.connectionId} /> : null}
      {props.clientId !== null && props.clientId !== undefined && props.connectionId !== props.clientId ? (
        <TextBox text={props.clientId} />
      ) : null}
      {props.spotlightId ? <TextBox text={props.spotlightId} /> : null}
      {props.showMediaButton ? <MediaButton /> : null}
    </>
  );
};

export default ConnectionStatusBar;
