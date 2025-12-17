import type React from 'react'
import { useEffect } from 'react'
import { Toast } from 'react-bootstrap'

import { deleteAlertMessage, reconnectSora, setSoraReconnecting } from '@/app/actions'
import { $alertMessages, $reconnecting, $reconnectingTrials } from '@/app/store'
import type { AlertMessage } from '@/types'
import { formatUnixtime } from '@/utils'

const Reconnect: React.FC = () => {
  const onClose = (): void => {
    setSoraReconnecting(false)
  }
  useEffect(() => {
    reconnectSora()
  }, [])
  return (
    <Toast delay={20000} onClose={onClose}>
      <Toast.Header className={'bg-warning text-white'}>
        <strong className="me-auto">Reconnect</strong>
      </Toast.Header>
      <Toast.Body className="bg-light">
        <p className="text-break font-weight-bold mb-0">
          Reconnecting... (trials {$reconnectingTrials.value})
        </p>
      </Toast.Body>
    </Toast>
  )
}

const Alert: React.FC<AlertMessage> = (props) => {
  const onClose = (): void => {
    deleteAlertMessage(props.timestamp)
  }
  const bgClassName = props.type === 'error' ? 'bg-danger' : 'bg-info'
  return (
    <Toast autohide={true} delay={20000} onClose={onClose}>
      <Toast.Header className={`${bgClassName} text-white`}>
        <strong className="me-auto">{props.title}</strong>
        <span>{formatUnixtime(props.timestamp)}</span>
      </Toast.Header>
      <Toast.Body className="bg-light">
        <p className="text-break font-weight-bold mb-0">{props.message}</p>
      </Toast.Body>
    </Toast>
  )
}

export const AlertMessages: React.FC = () => {
  return (
    <div className="alert-messages">
      {$reconnecting.value ? <Reconnect /> : null}
      {$alertMessages.value.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />
      })}
    </div>
  )
}
