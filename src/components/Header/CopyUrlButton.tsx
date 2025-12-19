import type { FunctionComponent } from "preact";

import { copyURL } from "@/app/actions";

export const CopyUrlButton: FunctionComponent = () => {
  const onClick = (): void => {
    copyURL();
  };

  return (
    <button type="button" className="btn btn-sm btn-outline" onClick={onClick}>
      Copy URL
    </button>
  );
};
