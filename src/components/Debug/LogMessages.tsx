import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { formatUnixtime, LogMessage } from "@/utils";

type LogDescriptionProps = {
  description: string;
};
const LogDescription: React.FC<LogDescriptionProps> = (props) => {
  const description = JSON.parse(props.description);
  if (typeof description !== "object") {
    return (
      <div className="debug-message">
        <div className="pl-0 col-sm-12">
          <pre>{description}</pre>
        </div>
      </div>
    );
  }
  return (
    <>
      {Object.keys(description).map((key) => {
        const message = ((m) => {
          if (typeof m === "string") {
            return m;
          }
          return JSON.stringify(m, null, 2);
        })(description[key]);
        return (
          <div key={key} className="debug-message">
            <div className="pl-0 col-sm-3">{key}:</div>
            <div className="col-sm-9">
              <pre>{message}</pre>
            </div>
          </div>
        );
      })}
    </>
  );
};

const CollapseLog: React.FC<LogMessage> = (props) => {
  const { message, timestamp } = props;
  const [show, setShow] = useState(false);
  const ariaControls = message.title + timestamp;
  return (
    <div>
      <a className="debug-title" onClick={() => setShow(!show)} aria-controls={ariaControls} aria-expanded={show}>
        <i className={show ? "arrow-bottom" : "arrow-right"} /> [{formatUnixtime(timestamp)}] {message.title}
      </a>
      <Collapse in={show}>
        <div className="ml-4">
          <LogDescription description={message.description} />
        </div>
      </Collapse>
    </div>
  );
};

const LogMessages: React.FC = () => {
  const { logMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {logMessages.map((log) => {
        return <CollapseLog key={log.message.title + log.timestamp} {...log} />;
      })}
    </>
  );
};

export default LogMessages;
