import { useSignal } from '@preact/signals'
import type React from 'react'
import { useEffect } from 'react'

import { deleteAlertMessage, reconnectSora, setSoraReconnecting } from '@/app/actions'
import { $alertMessages, $reconnecting, $reconnectingTrials } from '@/app/store'
import type { AlertMessage } from '@/types'
import { formatUnixtime } from '@/utils'

const Reconnect: React.FC = () => {
  const show = useSignal(true)

  const onClose = (): void => {
    show.value = false
    setSoraReconnecting(false)
  }

  useEffect(() => {
    reconnectSora()
    // Auto-hide after 20 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 20000)
    return () => clearTimeout(timer)
  }, [])

  if (!show.value) {
    return null
  }

  return (
    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header bg-warning text-white">
        <strong className="me-auto">Reconnect</strong>
        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
      </div>
      <div className="toast-body bg-light">
        <p className="text-break fw-bold mb-0">
          Reconnecting... (trials {$reconnectingTrials.value})
        </p>
      </div>
    </div>
  )
}

type AlertProps = AlertMessage

const Alert: React.FC<AlertProps> = (props) => {
  const show = useSignal(true)

  const onClose = (): void => {
    show.value = false
    deleteAlertMessage(props.timestamp)
  }

  useEffect(() => {
    // Auto-hide after 20 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 20000)
    return () => clearTimeout(timer)
  }, [])

  if (!show.value) {
    return null
  }

  const bgClassName = props.type === 'error' ? 'bg-danger' : 'bg-info'

  return (
    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div className={`toast-header ${bgClassName} text-white`}>
        <strong className="me-auto">{props.title}</strong>
        <span>{formatUnixtime(props.timestamp)}</span>
        <button type="button" className="btn-close btn-close-white ms-2" onClick={onClose} />
      </div>
      <div className="toast-body bg-light">
        <p className="text-break fw-bold mb-0">{props.message}</p>
      </div>
    </div>
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
