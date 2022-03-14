import NextHead from "next/head";
import NextLink from "next/link";
import queryString from "query-string";
import React from "react";
import { Container, Navbar } from "react-bootstrap";

const createAs = (pageName: string): string => {
  if (process.env.NODE_ENV === "production") {
    return `${pageName}.html`;
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
  };
};
const Link: React.FC<LinkProps> = (props) => {
  let qs = "";
  if (props.params) {
    qs = `?${queryString.stringify(props.params)}`;
  }
  return (
    <li>
      <NextLink href={`/${props.pageName}${qs}`} as={createAs(`/${props.pageName}${qs}`)}>
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
            <Link pageName="sendonly" params={{ simulcast: true }} />
            <Link pageName="recvonly" params={{ simulcast: true }} />
            <li className="separator">双方向 (サイマルキャスト無効)</li>
            <Link pageName="sendonly" params={{ multistream: true }} />
            <Link pageName="sendrecv" params={{ multistream: true }} />
            <Link pageName="recvonly" params={{ multistream: true }} />
            <li className="separator">双方向 (サイマルキャスト有効)</li>
            <Link pageName="sendonly" params={{ multistream: true, simulcast: true }} />
            <Link pageName="sendrecv" params={{ multistream: true, simulcast: true }} />
            <Link pageName="recvonly" params={{ multistream: true, simulcast: true }} />
            <li className="separator">スポットライト(サイマルキャスト無効)</li>
            <Link pageName="sendonly" params={{ multistream: true, spotlight: true }} />
            <Link pageName="sendrecv" params={{ multistream: true, spotlight: true }} />
            <Link pageName="recvonly" params={{ multistream: true, spotlight: true }} />
            <li className="separator">スポットライト(サイマルキャスト有効)</li>
            <Link pageName="sendonly" params={{ multistream: true, simulcast: true, spotlight: true }} />
            <Link pageName="sendrecv" params={{ multistream: true, simulcast: true, spotlight: true }} />
            <Link pageName="recvonly" params={{ multistream: true, simulcast: true, spotlight: true }} />
            <li className="separator">データチャネルメッセージング</li>
            <Link pageName="sendrecv" params={{ multistream: true, audio: false, video: false }} />
          </ul>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Index;
