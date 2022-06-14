import NextHead from "next/head";
import NextLink from "next/link";
import queryString from "query-string";
import React from "react";
import { Container, Navbar } from "react-bootstrap";

import type { SoraDevtoolsState } from "@/types";

const createAs = (queryString: string): string => {
  if (process.env.NODE_ENV === "production") {
    return `/devtools.html${queryString}`;
  }
  return `/devtools${queryString}`;
};

type LinkProps = {
  pageName: string;
  params: {
    role: SoraDevtoolsState["role"];
    audio?: SoraDevtoolsState["audio"];
    video?: SoraDevtoolsState["video"];
    multistream?: boolean;
    simulcast?: boolean;
    spotlight?: boolean;
    dataChannelSignaling?: boolean;
    dataChannels?: string;
    debug?: boolean;
    debugType?: SoraDevtoolsState["debugType"];
    videoBitRate?: SoraDevtoolsState["videoBitRate"];
    videoCodecType?: SoraDevtoolsState["videoCodecType"];
    resolution?: SoraDevtoolsState["resolution"];
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
            <li className="separator">マルチストリーム</li>
            <Link pageName="マルチストリーム送受信" params={{ role: "sendrecv", multistream: true }} />
            <Link pageName="マルチストリーム送信のみ" params={{ role: "sendonly", multistream: true }} />
            <Link pageName="マルチストリーム受信のみ" params={{ role: "recvonly", multistream: true }} />
            <Link
              pageName="マルチストリーム送受信 (サイマルキャスト有効)"
              params={{
                role: "sendrecv",
                multistream: true,
                simulcast: true,
                videoBitRate: "3000",
                videoCodecType: "VP8",
                resolution: "720p (1280x720)",
              }}
            />
            <Link
              pageName="マルチストリーム送信のみ (サイマルキャスト有効)"
              params={{
                role: "sendonly",
                multistream: true,
                simulcast: true,
                videoBitRate: "3000",
                videoCodecType: "VP8",
                resolution: "720p (1280x720)",
              }}
            />
            <Link
              pageName="マルチストリーム受信のみ (サイマルキャスト有効)"
              params={{ role: "recvonly", multistream: true, simulcast: true, videoCodecType: "VP8" }}
            />
            <li className="separator">スポットライト</li>
            <Link
              pageName="スポットライト送受信"
              params={{
                role: "sendrecv",
                multistream: true,
                simulcast: true,
                spotlight: true,
                videoCodecType: "VP8",
                videoBitRate: "500",
              }}
            />
            <Link
              pageName="スポットライト送信のみ"
              params={{
                role: "sendonly",
                multistream: true,
                simulcast: true,
                spotlight: true,
                videoCodecType: "VP8",
                videoBitRate: "500",
              }}
            />
            <Link
              pageName="スポットライト受信のみ"
              params={{
                role: "recvonly",
                multistream: true,
                simulcast: true,
                spotlight: true,
                videoCodecType: "VP8",
                videoBitRate: "500",
              }}
            />
            <Link
              pageName="スポットライト送受信 (サイマルキャスト無効)"
              params={{
                role: "sendrecv",
                multistream: true,
                spotlight: true,
                videoCodecType: "VP8",
                videoBitRate: "500",
              }}
            />
            <Link
              pageName="スポットライト送信のみ (サイマルキャスト無効)"
              params={{
                role: "sendonly",
                multistream: true,
                spotlight: true,
                videoCodecType: "VP8",
                videoBitRate: "500",
              }}
            />
            <Link
              pageName="スポットライト受信のみ (サイマルキャスト無効)"
              params={{
                role: "recvonly",
                multistream: true,
                spotlight: true,
                videoCodecType: "VP8",
                videoBitRate: "500",
              }}
            />
            <li className="separator">データチャネルメッセージング</li>
            <Link
              pageName="メッセージングのみ"
              params={{
                role: "sendrecv",
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
