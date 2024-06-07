import NextHead from 'next/head'
import queryString from 'query-string'
import type React from 'react'
import { Container, Navbar } from 'react-bootstrap'

import type { SoraDevtoolsState } from '@/types'

type LinkProps = {
  pageName: string
  params: {
    role: SoraDevtoolsState['role']
    audio?: SoraDevtoolsState['audio']
    video?: SoraDevtoolsState['video']
    simulcast?: boolean
    spotlight?: boolean
    dataChannelSignaling?: boolean
    dataChannels?: string
    debug?: boolean
    debugType?: SoraDevtoolsState['debugType']
    videoBitRate?: SoraDevtoolsState['videoBitRate']
    videoCodecType?: SoraDevtoolsState['videoCodecType']
    resolution?: SoraDevtoolsState['resolution']
  }
}
const Link: React.FC<LinkProps> = (props) => {
  const path = process.env.NODE_ENV === 'production' ? '/devtools.html' : '/devtools'
  const qs = props.params ? `?${queryString.stringify(props.params)}` : ''
  return (
    <li>
      <a href={`${path}${qs}`}>{props.pageName}</a>
    </li>
  )
}

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
            <Link
              pageName="マルチストリーム送受信"
              params={{ role: 'sendrecv', videoCodecType: 'VP9' }}
            />
            <Link
              pageName="マルチストリーム送信のみ"
              params={{ role: 'sendonly', videoCodecType: 'VP9' }}
            />
            <Link pageName="マルチストリーム受信のみ" params={{ role: 'recvonly' }} />
            <Link
              pageName="マルチストリーム送受信 (サイマルキャスト有効)"
              params={{
                role: 'sendrecv',
                simulcast: true,
                videoBitRate: '3000',
                videoCodecType: 'VP8',
                resolution: '720p (1280x720)',
              }}
            />
            <Link
              pageName="マルチストリーム送信のみ (サイマルキャスト有効)"
              params={{
                role: 'sendonly',
                simulcast: true,
                videoBitRate: '3000',
                videoCodecType: 'VP8',
                resolution: '720p (1280x720)',
              }}
            />
            <Link
              pageName="マルチストリーム受信のみ (サイマルキャスト有効)"
              params={{
                role: 'recvonly',
                simulcast: true,
              }}
            />
            <li className="separator">スポットライト</li>
            <Link
              pageName="スポットライト送受信"
              params={{
                role: 'sendrecv',
                simulcast: true,
                spotlight: true,
                videoCodecType: 'VP8',
                videoBitRate: '500',
              }}
            />
            <Link
              pageName="スポットライト送信のみ"
              params={{
                role: 'sendonly',
                simulcast: true,
                spotlight: true,
                videoCodecType: 'VP8',
                videoBitRate: '500',
              }}
            />
            <Link
              pageName="スポットライト受信のみ"
              params={{
                role: 'recvonly',
                simulcast: true,
                spotlight: true,
              }}
            />
            <Link
              pageName="スポットライト送受信 (サイマルキャスト無効)"
              params={{
                role: 'sendrecv',
                spotlight: true,
                videoCodecType: 'VP8',
                videoBitRate: '500',
              }}
            />
            <Link
              pageName="スポットライト送信のみ (サイマルキャスト無効)"
              params={{
                role: 'sendonly',
                spotlight: true,
                videoCodecType: 'VP8',
                videoBitRate: '500',
              }}
            />
            <Link
              pageName="スポットライト受信のみ (サイマルキャスト無効)"
              params={{
                role: 'recvonly',
                spotlight: true,
              }}
            />
            <li className="separator">データチャネルメッセージング</li>
            <Link
              pageName="メッセージングのみ"
              params={{
                role: 'sendrecv',
                dataChannelSignaling: true,
                debug: true,
                debugType: 'messaging',
                audio: false,
                video: false,
                dataChannels: JSON.stringify(
                  [
                    {
                      label: '#devtools',
                      maxPacketLifeTime: 10,
                      ordered: true,
                      compress: false,
                      direction: 'sendrecv',
                    },
                  ],
                  null,
                  2,
                ),
              }}
            />
          </ul>
        </div>
      </div>
    </>
  )
}

export default Index
