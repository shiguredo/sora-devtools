import type React from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'

import { useAppSelector } from '@/app/hooks'

import { CopyUrlButton } from './CopyUrlButton'
import { DebugButton } from './DebugButton'
import { DownloadReportButton } from './DownloadReportButton'

export const Header: React.FC = () => {
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const turnUrl = useAppSelector((state) => state.soraContents.turnUrl)
  const sora = useAppSelector((state) => state.soraContents.sora)
  const turnUrlLabel = (() => {
    if (sora && connectionStatus === 'connected') {
      return turnUrl !== null ? turnUrl : '不明'
    }
    return 'TURN URL'
  })()
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand href="/">Sora DevTools</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-collapse" />
          <Navbar.Collapse id="navbar-collapse">
            <Nav className="me-auto" />
            <Nav>
              <Navbar.Text className="py-0 my-1 mx-1">
                <p className="navbar-signaling-url border rounded">
                  {sora && connectionStatus === 'connected'
                    ? sora.connectedSignalingUrl
                    : 'Signaling URL'}
                </p>
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <p className="navbar-turn-url border rounded">{turnUrlLabel}</p>
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <DebugButton />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <DownloadReportButton />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 ms-1">
                <CopyUrlButton />
              </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
