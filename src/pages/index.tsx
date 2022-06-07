import NextHead from "next/head";
import NextLink from "next/link";
import queryString from "query-string";
import React from "react";
import { Container, Navbar } from "react-bootstrap";

import type { DebugType } from "@/types";

const createAs = (queryString: string): string => {
  if (process.env.NODE_ENV === "production") {
    return `devtools.html${queryString}`;
  }
  return `devtools${queryString}`;
};

type LinkProps = {
  pageName: string;
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
      <NextLink href={`/devtools${qs}`} as={createAs(qs)}>
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
            <Link pageName="シングルストリーム送信のみ" />
            <Link pageName="シングルストリーム受信のみ" />
            <Link
              pageName="シングルストリーム送信のみ (サイマルキャスト有効)"
              params={{ simulcast: true, videoBitRate: 3000, videoCodecType: "VP8", resolution: "720p (1280x720)" }}
            />
            <Link
              pageName="シングルストリーム受信のみ (サイマルキャスト有効)"
              params={{ simulcast: true, videoBitRate: 3000, videoCodecType: "VP8" }}
            />
            <li className="separator">マルチストリーム</li>
            <Link pageName="マルチストリーム送受信" params={{ multistream: true }} />
            <Link pageName="マルチストリーム送信のみ" params={{ multistream: true }} />
            <Link pageName="マルチストリーム受信のみ" params={{ multistream: true }} />
            <Link
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
              pageName="マルチストリーム受信のみ (サイマルキャスト有効)"
              params={{ multistream: true, simulcast: true, videoCodecType: "VP8" }}
            />
            <li className="separator">スポットライト</li>
            <Link
              pageName="スポットライト送受信"
              params={{ multistream: true, simulcast: true, spotlight: true, videoCodecType: "VP8", videoBitRate: 500 }}
            />
            <Link
              pageName="スポットライト送信のみ"
              params={{ multistream: true, simulcast: true, spotlight: true, videoCodecType: "VP8", videoBitRate: 500 }}
            />
            <Link
              pageName="スポットライト受信のみ"
              params={{ multistream: true, simulcast: true, spotlight: true, videoCodecType: "VP8", videoBitRate: 500 }}
            />
            <Link
              pageName="スポットライト送受信 (サイマルキャスト無効)"
              params={{ multistream: true, spotlight: true, videoCodecType: "VP8", videoBitRate: 500 }}
            />
            <Link
              pageName="スポットライト送信のみ (サイマルキャスト無効)"
              params={{ multistream: true, spotlight: true, videoCodecType: "VP8", videoBitRate: 500 }}
            />
            <Link
              pageName="スポットライト受信のみ (サイマルキャスト無効)"
              params={{ multistream: true, spotlight: true, videoCodecType: "VP8", videoBitRate: 500 }}
            />
            <li className="separator">データチャネルメッセージング</li>
            <Link
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
