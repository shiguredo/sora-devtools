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
  return `${pageName}${queryString}`;
};

type LinkProps = {
  pageName: string;
  type: "sendonly" | "recvonly" | "sendrecv";
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
    resolution?: string;
  };
};
const Link: React.FC<LinkProps> = (props) => {
  let qs = "";
  if (props.params) {
    qs = `?${queryString.stringify(props.params)}`;
  }
  return (
    <li>
      <NextLink href={`/${props.type}${qs}`} as={createAs(`/${props.type}`, qs)}>
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
            <li className="separator">シングルストリーム</li>
            <Link type="sendonly" pageName="シングルストリーム送信のみ" />
            <Link type="recvonly" pageName="シングルストリーム受信のみ" />
            <Link
              type="sendonly"
              pageName="シングルストリーム送信のみ (サイマルキャスト有効)"
              params={{ simulcast: true, videoBitRate: 3000, videoCodecType: "VP8", resolution: "720p (1280x720)" }}
            />
            <Link
              type="recvonly"
              pageName="シングルストリーム受信のみ (サイマルキャスト有効)"
              params={{ simulcast: true, videoBitRate: 3000, videoCodecType: "VP8" }}
            />
            <li className="separator">マルチストリーム</li>
            <Link type="sendrecv" pageName="マルチストリーム送受信" params={{ multistream: true }} />
            <Link type="sendonly" pageName="マルチストリーム送信のみ" params={{ multistream: true }} />
            <Link type="recvonly" pageName="マルチストリーム受信のみ" params={{ multistream: true }} />
            <Link
              type="sendrecv"
              pageName="マルチストリーム送受信 (サイマルキャスト有効)"
              params={{
                multistream: true,
                simulcast: true,
                videoBitRate: 3000,
                videoCodecType: "VP8",
                resolution: "720p (1280x720)",
              }}
            />
            <Link
              type="sendonly"
              pageName="マルチストリーム送信のみ (サイマルキャスト有効)"
              params={{
                multistream: true,
                simulcast: true,
                videoBitRate: 3000,
                videoCodecType: "VP8",
                resolution: "720p (1280x720)",
              }}
            />
            <Link
              type="recvonly"
              pageName="マルチストリーム受信のみ (サイマルキャスト有効)"
              params={{ multistream: true, simulcast: true, videoCodecType: "VP8" }}
            />
            <li className="separator">スポットライト</li>
            <Link
              type="sendrecv"
              pageName="スポットライト送受信"
              params={{ multistream: true, spotlight: true, videoBitRate: 500 }}
            />
            <Link
              type="sendonly"
              pageName="スポットライト送信のみ"
              params={{ multistream: true, spotlight: true, videoBitRate: 500 }}
            />
            <Link
              type="recvonly"
              pageName="スポットライト受信のみ"
              params={{ multistream: true, spotlight: true, videoBitRate: 500 }}
            />
            <Link
              type="sendrecv"
              pageName="スポットライト送受信 (サイマルキャスト無効)"
              params={{ multistream: true, simulcast: true, spotlight: true, videoBitRate: 500, videoCodecType: "VP8" }}
            />
            <Link
              type="sendonly"
              pageName="スポットライト送信のみ (サイマルキャスト無効)"
              params={{ multistream: true, simulcast: true, spotlight: true, videoBitRate: 500, videoCodecType: "VP8" }}
            />
            <Link
              type="recvonly"
              pageName="スポットライト受信のみ (サイマルキャスト無効)"
              params={{ multistream: true, simulcast: true, spotlight: true, videoBitRate: 500, videoCodecType: "VP8" }}
            />
            <li className="separator">データチャネルメッセージング</li>
            <Link
              type="sendrecv"
              pageName="メッセージングのみ"
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
