import React from "react";

import IconClipboard from "@/components/IconClipboard";
import { copy2clipboard } from "@/utils";

type Props = {
  text: string;
};
const CopyLog: React.FC<Props> = (props) => {
  const onClick = (): void => {
    copy2clipboard(props.text);
  };
  return (
    <button className="btn btn-sm btn-outline-none pt-0 text-white" onClick={onClick}>
      <IconClipboard />
    </button>
  );
};

export default CopyLog;
