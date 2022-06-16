import { FormLabel, OverlayTrigger, Popover } from "react-bootstrap";

import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: React.ReactNode;
};
export const TooltipFormLabel: React.FC<Props> = (props) => {
  const instruction = INSTRUCTIONS[props.kind];
  if (!instruction) {
    console.warn(`Could not load description "${props.kind}"`);
    return <FormLabel>{props.children}</FormLabel>;
  }
  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Popover id="popover-basic">
          <Popover.Body style={{ whiteSpace: "pre-wrap" }}>{instruction.description}</Popover.Body>
        </Popover>
      }
    >
      <FormLabel>{props.children}</FormLabel>
    </OverlayTrigger>
  );
};
