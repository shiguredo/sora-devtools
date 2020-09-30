import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { formatUnixtime, PushMessage } from "@/utils";

type CollapsePushProps = {
  push: PushMessage;
  ariaControls: string;
};
const CollapsePush: React.FC<CollapsePushProps> = (props) => {
  const { push } = props;
  const [show, setShow] = useState(false);
  const ariaControls = push.message.type + push.timestamp;
  return (
    <div>
      <a className="debug-title" onClick={() => setShow(!show)} aria-controls={ariaControls} aria-expanded={show}>
        <i className={show ? "arrow-bottom" : "arrow-right"} /> [{formatUnixtime(push.timestamp)}] {push.message.type}
      </a>
      <Collapse in={show}>
        <div className="debug-message">
          <div className="col-sm-12">
            <pre>{JSON.stringify(push.message, null, 2)}</pre>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

const PushMessages: React.FC = () => {
  const { pushMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {pushMessages.map((pushMessage, index) => {
        const key = `${pushMessage.timestamp}-${index}`;
        return <CollapsePush key={key} ariaControls={key} push={pushMessage} />;
      })}
    </>
  );
};

export default PushMessages;
