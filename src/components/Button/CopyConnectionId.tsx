import React from "react";

import IconClipboard from "@/components/IconClipboard";
import { copy2clipboard } from "@/utils";

type Props = {
  text: string | null;
};
const CopyConnectionId: React.FC<Props> = (props) => {
  const onClick = (): void => {
    if (props.text) {
      copy2clipboard(props.text);
    }
  };
  return (
    <button className="btn btn-outline-none pl-0 pt-0" onClick={onClick}>
      <IconClipboard />
    </button>
  );
};

export default CopyConnectionId;
