import React from "react";

import IconClipboard from "@/components/IconClipboard";
import { copy2clipboard } from "@/utils";

type Props = {
  text: string;
  disabled?: boolean;
};
const CopyLog: React.FC<Props> = (props) => {
  const onClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  if (props.disabled) {
    return null;
  }
  return (
    <button className="btn btn-sm btn-dark" onClick={onClick}>
      <IconClipboard />
    </button>
  );
};

export default CopyLog;
