import type { JSX } from "preact";

import { Button } from "@/components/ui";
import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

type Props = {
  text: string;
  disabled?: boolean;
};

export function CopyLogButton(props: Props) {
  const onClick = (event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
    void copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  if (props.disabled) {
    return <div style={{ height: "31px" }} />;
  }
  return (
    <Button variant="dark" size="sm" onClick={onClick}>
      <ClipboardIcon />
    </Button>
  );
}
