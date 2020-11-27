import React from "react";

import IconClipboard from "@/components/IconClipboard";
import { copy2clipboard } from "@/utils";

type Props = {
  connectionId: string;
};
const ConnectionId: React.FC<Props> = (props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.connectionId);
    event.currentTarget.blur();
  };
  return (
    <div className="d-flex align-items-center border border-secondary rounded">
      <p id="connectionId" className="mx-2">
        {props.connectionId}
      </p>
      <div className="border-left border-secondary">
        <button className="btn btn-sm btn-light" onClick={onClick}>
          <IconClipboard />
        </button>
      </div>
    </div>
  );
};

export default ConnectionId;
