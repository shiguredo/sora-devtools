import type { FunctionComponent } from "preact";

import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

type TextBoxProps = {
  id?: string;
  label?: string;
  text: string;
};
const TextBox: FunctionComponent<TextBoxProps> = (props) => {
  const onClick = (event: MouseEvent): void => {
    const target = event.currentTarget as HTMLButtonElement;
    copy2clipboard(props.text);
    target.blur();
  };
  return (
    <div className="flex items-center">
      {props.label ? <p>{props.label}</p> : null}
      <div className="flex items-center border border-gray-500 rounded mx-1">
        <p id={props.id} className="mx-2 p-1">
          {props.text}
        </p>
        <div className="border-l border-gray-500">
          <button
            type="button"
            className="px-2 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded"
            onClick={onClick}
          >
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
export const ConnectionStatusBar: FunctionComponent<Props> = (props) => {
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
