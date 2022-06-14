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
      placement="right"
      overlay={
        <Popover id="popover-basic">
          <Popover.Header as="h3">{instruction.name}</Popover.Header>
          <Popover.Body style={{ whiteSpace: "pre-wrap" }}>{instruction.description}</Popover.Body>
        </Popover>
      }
    >
      <FormLabel>{props.children}</FormLabel>
    </OverlayTrigger>
  );
};
