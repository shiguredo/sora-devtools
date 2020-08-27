import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";
import { formatUnixtime } from "@/utils";

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
        let message = description[key];
        if (typeof description[key] !== "string") {
          message = JSON.stringify(description[key], null, 2);
        }
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

type CollapseLogProps = {
  title: string;
  description: string;
  timestamp: number;
};
const CollapseLog: React.FC<CollapseLogProps> = (props) => {
  const { title, description, timestamp } = props;
  const [show, setShow] = useState(false);
  const ariaControls = title + timestamp;
  return (
    <div>
      <a className="debug-title" onClick={() => setShow(!show)} aria-controls={ariaControls} aria-expanded={show}>
        <i className={show ? "arrow-bottom" : "arrow-right"} /> [{formatUnixtime(timestamp)}] {title}
      </a>
      <Collapse in={show}>
        <div className="ml-4">
          <LogDescription description={description} />
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
        return <CollapseLog key={log.title + log.timestamp} {...log} />;
      })}
    </>
  );
};

export default LogMessages;
