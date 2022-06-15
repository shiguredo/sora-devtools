import { FormCheck, FormLabel, OverlayTrigger, Popover } from "react-bootstrap";

import { INSTRUCTIONS } from "@/constants";

type Props = {
  kind: string;
  children: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export const TooltipFormCheck: React.FC<Props> = (props) => {
  const { children, kind, checked, onChange, disabled } = props;
  const instruction = INSTRUCTIONS[kind];
  if (!instruction) {
    console.warn(`Could not load description "${kind}"`);
    return <FormLabel>{children}</FormLabel>;
  }
  return (
    <>
      <FormCheck type="switch" checked={checked} onChange={onChange} disabled={disabled} />
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Popover id="popover-basic">
            <Popover.Header as="h3">{instruction.name}</Popover.Header>
            <Popover.Body style={{ whiteSpace: "pre-wrap" }}>{instruction.description}</Popover.Body>
          </Popover>
        }
      >
        <FormLabel>{children}</FormLabel>
      </OverlayTrigger>
    </>
  );
};
