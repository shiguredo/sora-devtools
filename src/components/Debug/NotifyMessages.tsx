import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import ButtonCopyLog from "@/components/Button/CopyLog";
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
    <div className="border border-light rounded my-2">
      <div className="d-flex justify-content-between align-items-center">
        <a className="debug-title" onClick={() => setShow(!show)} aria-controls={ariaControls} aria-expanded={show}>
          <i className={show ? "arrow-bottom" : "arrow-right"} />{" "}
          <span className="text-white-50 mr-1">[{formatUnixtime(notify.timestamp)}]</span>
          {notify.message.type} {notify.message.event_type}
        </a>
        <div className="border-left">
          <ButtonCopyLog text={JSON.stringify(notify.message, null, 2)} />
        </div>
      </div>
      <Collapse in={show}>
        <div className="border-top py-1">
          <div className="debug-message">
            <div className="col-sm-12">
              {Object.keys(notify.message).map((key) => {
                const message = ((m) => {
                  if (typeof m === "string") {
                    return m;
                  }
                  return JSON.stringify(m, null, 2);
                })(notify.message[key]);
                return (
                  <div key={key} className="debug-message">
                    <div className="pl-0 col-sm-4">{key}:</div>
                    <div className="col-sm-8">
                      <pre>{message}</pre>
                    </div>
                  </div>
                );
              })}
            </div>
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
