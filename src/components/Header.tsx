import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Sora from "sora-js-sdk";

import ButtonCopyURL from "@/components/Button/CopyURL";
import ButtonDownloadReport from "@/components/Button/DownloadReport";
import { setDebug, SoraDemoState } from "@/slice";
import { EnabledParameters } from "@/utils";

const Debug: React.FC = () => {
  const { debug } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDebug(event.target.checked));
  };
  return (
    <div className="custom-control custom-checkbox">
      <input
        id="debug"
        className="custom-control-input"
        type="checkbox"
        name="debug"
        checked={debug}
        onChange={onChange}
      />
      <label className="mb-0 ml-1 custom-control-label" htmlFor="debug">
        debug
      </label>
    </div>
  );
};

type Props = {
  enabledParameters: EnabledParameters;
  pageName: string;
};
const Header: React.FC<Props> = (props) => {
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="md" fixed="top">
        <Navbar.Brand href="/">Sora DEMO</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-collapse" />
        <Navbar.Collapse id="navbar-collapse">
          <Nav className="mr-auto">
            <Navbar.Text>{props.pageName}</Navbar.Text>
          </Nav>
          <Nav>
            <Navbar.Text className="mr-3">sora-js-sdk version: {Sora.version()}</Navbar.Text>
            <Navbar.Text className="mr-3">
              <Debug />
            </Navbar.Text>
            <ButtonDownloadReport pageName={props.pageName} />
            <ButtonCopyURL enabledParameters={props.enabledParameters} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
