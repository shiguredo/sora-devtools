import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";

const ColDemo: React.FC = (props) => {
  const { debug } = useSelector((state: SoraDemoState) => state);
  return <div className={debug ? "col-demo col-6" : "col-demo col-12"}>{props.children}</div>;
};

export default ColDemo;
