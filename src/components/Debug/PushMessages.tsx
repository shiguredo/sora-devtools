import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { PushMessage } from "@/utils";

type CollapsePushProps = {
  push: PushMessage;
  ariaControls: string;
};
const Collapse: React.FC<CollapsePushProps> = (props) => {
  const { push } = props;
  return <Message title={push.message.type} timestamp={push.timestamp} description={push.message} />;
};

const Log = React.memo((props: CollapsePushProps) => {
  return <Collapse {...props} />;
});

const PushMessages: React.FC = () => {
  const { pushMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {pushMessages.map((pushMessage, index) => {
        const key = `${pushMessage.timestamp}-${index}`;
        return <Log key={key} ariaControls={key} push={pushMessage} />;
      })}
    </>
  );
};

export default PushMessages;
