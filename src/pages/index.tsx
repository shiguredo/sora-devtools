import NextLink from "next/link";
import React from "react";
import { Navbar } from "react-bootstrap";

const createAs = (pageName: string): string => {
  if (process.env.NODE_ENV === "production") {
    return `${pageName}.html`;
  }
  return pageName;
};

const Link: React.FC<{ pageName: string }> = (props) => {
  return (
    <li>
      <NextLink href={`/${props.pageName}`} as={createAs(`/${props.pageName}`)}>
        <a>{props.pageName}</a>
      </NextLink>
    </li>
  );
};

const Index: React.FC = () => {
  return (
    <>
      <header>
        <Navbar variant="dark" bg="sora" expand="md" fixed="top">
          <Navbar.Brand href="/">Sora DEMO</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-collapse" />
        </Navbar>
      </header>
      <div className="container">
        <div className="row">
          <ul className="list-url">
            <li className="separator">片方向</li>
            <Link pageName="sendonly" />
            <Link pageName="recvonly" />
            <li className="separator">双方向</li>
            <Link pageName="multi_sendrecv" />
            <Link pageName="multi_sendonly" />
            <Link pageName="multi_recvonly" />
            <li className="separator">片方向サイマルキャスト</li>
            <Link pageName="simulcast_sendonly" />
            <Link pageName="simulcast_recvonly" />
            <li className="separator">双方向サイマルキャスト</li>
            <Link pageName="multi_simulcast_sendrecv" />
            <Link pageName="multi_simulcast_sendonly" />
            <Link pageName="multi_simulcast_recvonly" />
            <li className="separator">スポットライト</li>
            <Link pageName="spotlight_sendrecv" />
            <Link pageName="spotlight_sendonly" />
            <Link pageName="spotlight_recvonly" />
          </ul>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Index;
