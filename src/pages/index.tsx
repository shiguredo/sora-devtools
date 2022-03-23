import NextHead from "next/head";
import NextLink from "next/link";
import queryString from "query-string";
import React from "react";
import { Container, Navbar } from "react-bootstrap";

import type { DebugType } from "@/types";

const createAs = (pageName: string, queryString: string): string => {
  if (process.env.NODE_ENV === "production") {
    return `${pageName}.html${queryString}`;
  }
  return pageName;
};

type LinkProps = {
  pageName: "sendonly" | "recvonly" | "sendrecv";
  params?: {
    audio?: boolean;
    video?: boolean;
    multistream?: boolean;
    simulcast?: boolean;
    spotlight?: boolean;
    dataChannelSignaling?: boolean;
    dataChannels?: string;
    debug?: boolean;
    debugType?: DebugType;
    videoBitRate?: number;
    videoCodecType?: string;
  };
};
const Link: React.FC<LinkProps> = (props) => {
  let qs = "";
  if (props.params) {
    qs = `?${queryString.stringify(props.params)}`;
  }
  return (
    <li>
      <NextLink href={`/${props.pageName}${qs}`} as={createAs(`/${props.pageName}`, qs)}>
        <a>{props.pageName}</a>
      </NextLink>
    </li>
  );
};

const Index: React.FC = () => {
  return (
    <>
      <NextHead>
        <title>Sora DevTools</title>
      </NextHead>
      <header>
        <Navbar variant="dark" bg="sora" expand="md" fixed="top">
          <Container>
            <Navbar.Brand href="/">Sora DevTools</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbar-collapse" />
          </Container>
        </Navbar>
      </header>
      <div className="container">
        <div className="row">
          <ul className="list-url">
            <li className="separator">片方向(サイマルキャスト無効)</li>
            <Link pageName="sendonly" />
            <Link pageName="recvonly" />
            <li className="separator">片方向(サイマルキャスト有効)</li>
            <Link pageName="sendonly" params={{ simulcast: true, videoBitRate: 3000, videoCodecType: "VP8" }} />
            <Link pageName="recvonly" params={{ simulcast: true, videoBitRate: 3000, videoCodecType: "VP8" }} />
            <li className="separator">双方向(サイマルキャスト無効)</li>
            <Link pageName="sendonly" params={{ multistream: true }} />
            <Link pageName="sendrecv" params={{ multistream: true }} />
            <Link pageName="recvonly" params={{ multistream: true }} />
            <li className="separator">双方向(サイマルキャスト有効)</li>
            <Link
              pageName="sendonly"
              params={{ multistream: true, simulcast: true, videoBitRate: 3000, videoCodecType: "VP8" }}
            />
            <Link
              pageName="sendrecv"
              params={{ multistream: true, simulcast: true, videoBitRate: 3000, videoCodecType: "VP8" }}
            />
            <Link pageName="recvonly" params={{ multistream: true, simulcast: true, videoCodecType: "VP8" }} />
            <li className="separator">スポットライト(サイマルキャスト無効)</li>
            <Link pageName="sendonly" params={{ multistream: true, spotlight: true, videoBitRate: 500 }} />
            <Link pageName="sendrecv" params={{ multistream: true, spotlight: true, videoBitRate: 500 }} />
            <Link pageName="recvonly" params={{ multistream: true, spotlight: true, videoBitRate: 500 }} />
            <li className="separator">スポットライト(サイマルキャスト有効)</li>
            <Link
              pageName="sendonly"
              params={{ multistream: true, simulcast: true, spotlight: true, videoBitRate: 500, videoCodecType: "VP8" }}
            />
            <Link
              pageName="sendrecv"
              params={{ multistream: true, simulcast: true, spotlight: true, videoBitRate: 500, videoCodecType: "VP8" }}
            />
            <Link
              pageName="recvonly"
              params={{ multistream: true, simulcast: true, spotlight: true, videoBitRate: 500, videoCodecType: "VP8" }}
            />
            <li className="separator">データチャネルメッセージング</li>
            <Link
              pageName="sendrecv"
              params={{
                multistream: true,
                dataChannelSignaling: true,
                debug: true,
                debugType: "messaging",
                audio: false,
                video: false,
                dataChannels: JSON.stringify([
                  {
                    label: "#sora-devtools",
                    direction: "sendrecv",
                  },
                ]),
              }}
            />
          </ul>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Index;
