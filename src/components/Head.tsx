import NextHead from "next/head";
import React from "react";

type Props = {
  title: string;
};

const Head: React.FC<Props> = (props) => {
  return (
    <NextHead>
      <title>Sora DEMO {props.title}</title>
    </NextHead>
  );
};

export default Head;
