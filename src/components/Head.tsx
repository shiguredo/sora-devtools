import Head from "next/head";
import React from "react";

type Props = {
  title: string;
};

const CustomHead: React.FC<Props> = (props) => {
  return (
    <Head>
      <title>Sora DEMO {props.title}</title>
    </Head>
  );
};

export default CustomHead;
