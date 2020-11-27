import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import ButtonCopyLog from "@/components/Button/CopyLog";
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
    <div className="border border-light rounded my-2">
      <div className="d-flex justify-content-between align-items-center">
        <a className="debug-title" onClick={() => setShow(!show)} aria-controls={ariaControls} aria-expanded={show}>
          <i className={show ? "arrow-bottom" : "arrow-right"} /> <span className="text-white-50 mr-1">[{formatUnixtime(push.timestamp)}]</span> {push.message.type}
        </a>
        <div className="border-left">
          <ButtonCopyLog text={JSON.stringify(push.message, null, 2)} />
        </div>
      </div>
      <Collapse in={show}>
        <div className="border-top pl-4 py-1">
          <div className="debug-message">
            <div className="col-12">
              <pre>{JSON.stringify(push.message, null, 2)}</pre>
            </div>
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
