import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { formatUnixtime, NotifyMessage } from "@/utils";

type CollapseNotifyProps = {
  notify: NotifyMessage;
};
const CollapseNotify: React.FC<CollapseNotifyProps> = (props) => {
  const { notify } = props;
  const [show, setShow] = useState(false);
  const ariaControls = notify.message.type + notify.timestamp;
  return (
    <div>
      <a className="debug-title" onClick={() => setShow(!show)} aria-controls={ariaControls} aria-expanded={show}>
        <i className={show ? "arrow-bottom" : "arrow-right"} /> [{formatUnixtime(notify.timestamp)}]{" "}
        {notify.message.type} {notify.message.event_type}
      </a>
      <Collapse in={show}>
        <div className="debug-message">
          <div className="col-sm-12">
            <pre>{JSON.stringify(notify.message, null, 2)}</pre>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

const NotifyMessages: React.FC = () => {
  const { notifyMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {notifyMessages.map((notify) => {
        return <CollapseNotify key={notify.message.type + notify.timestamp} notify={notify} />;
      })}
    </>
  );
};

export default NotifyMessages;
