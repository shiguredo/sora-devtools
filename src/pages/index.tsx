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
          <ul className="list-url mt-1">
            <Link pageName="sendonly" />
            <Link pageName="recvonly" />
            <Link pageName="multi_sendrecv" />
            <Link pageName="multi_sendonly" />
            <Link pageName="multi_recvonly" />
            <Link pageName="spotlight_legacy_sendrecv" />
            <Link pageName="spotlight_legacy_sendonly" />
            <Link pageName="spotlight_legacy_recvonly" />
            <Link pageName="simulcast_sendonly" />
            <Link pageName="simulcast_recvonly" />
            <Link pageName="multi_simulcast_sendrecv" />
            <Link pageName="multi_simulcast_sendonly" />
            <Link pageName="multi_simulcast_recvonly" />
            <hr />
            <Link pageName="spotlight_sendrecv" />
            <Link pageName="spotlight_sendonly" />
            <Link pageName="spotlight_recvonly" />
          </ul>
        </div>
      </div>
    </>
  );
};

export default Index;
