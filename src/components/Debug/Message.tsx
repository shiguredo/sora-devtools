import React, { useState } from "react";
import { Collapse } from "react-bootstrap";

import ButtonCopyLog from "@/components/Button/CopyLog";
import { formatUnixtime } from "@/utils";

type DescriptionProps = {
  description: string | number | Record<string, unknown>;
};
const Description: React.FC<DescriptionProps> = (props) => {
  const { description } = props;
  if (description === undefined) {
    return null;
  }
  if (typeof description !== "object") {
    return (
      <div className="debug-message">
        <div className="pl-0 col-sm-12">
          <pre>{description}</pre>
        </div>
      </div>
    );
  }
  if (description === null) {
    return (
      <div className="debug-message">
        <div className="pl-0 col-sm-12">
          <pre>null</pre>
        </div>
      </div>
    );
  }
  return (
    <>
      {Object.keys(description).map((key) => {
        const message = ((m) => {
          if (key === "sdp") {
            return m as string;
          }
          if (typeof m === "string") {
            return JSON.stringify(m);
          }
          return JSON.stringify(m, null, 2);
        })(description[key]);
        return (
          <div key={key} className="debug-message">
            <div className="pl-0 col-4 text-break">{key}:</div>
            <div className="col-8">
              <pre>{message}</pre>
            </div>
          </div>
        );
      })}
    </>
  );
};

type Props = {
  timestamp: number | null;
  title: string;
  description: string | number | Record<string, unknown>;
  defaultShow?: boolean;
  label?: JSX.Element | null;
};
const Message: React.FC<Props> = (props) => {
  const { defaultShow, description, title, timestamp, label } = props;
  const [show, setShow] = useState(defaultShow === undefined ? false : defaultShow);
  const ariaControls = timestamp ? title + timestamp : title;
  const disabled = description === undefined;
  return (
    <div className="border border-light rounded my-2 bg-dark">
      <div className="d-flex justify-content-between align-items-center text-break">
        <a
          className={`debug-title ${disabled ? "disabled" : ""}`}
          onClick={() => setShow(!show)}
          aria-controls={ariaControls}
          aria-expanded={show}
        >
          <i className={`${show ? "arrow-bottom" : "arrow-right"} ${disabled ? "disabled" : ""}`} />{" "}
          {timestamp ? <span className="text-white-50 mr-1">[{formatUnixtime(timestamp)}]</span> : null}
          {label}&nbsp;
          {title}
        </a>
        <div className="border-left">
          <ButtonCopyLog
            text={typeof description === "string" ? description : JSON.stringify(description, null, 2)}
            disabled={disabled}
          />
        </div>
      </div>
      <Collapse in={show}>
        <div className="border-top pl-4 py-1">
          <Description description={description} />
        </div>
      </Collapse>
    </div>
  );
};

export default Message;
