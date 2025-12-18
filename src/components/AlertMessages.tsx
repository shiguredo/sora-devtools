import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'

import { deleteAlertMessage, reconnectSora, setSoraReconnecting } from '@/app/actions'
import { $alertMessages, $reconnecting, $reconnectingTrials } from '@/app/store'
import type { AlertMessage } from '@/types'
import { formatUnixtime } from '@/utils'

const Reconnect: FunctionComponent = () => {
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
    <div
      className="bg-white rounded-lg shadow-lg w-[450px] max-w-[450px] mt-2"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-yellow-500 text-white rounded-t-lg">
        <strong className="mr-auto">Reconnect</strong>
        <button
          type="button"
          className="text-white hover:text-gray-200 cursor-pointer text-xl"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="p-3 bg-gray-100 rounded-b-lg">
        <p className="break-words font-bold mb-0">
          Reconnecting... (trials {$reconnectingTrials.value})
        </p>
      </div>
    </div>
  )
}

type AlertProps = AlertMessage

const Alert: FunctionComponent<AlertProps> = (props) => {
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

  const bgClassName = props.type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  return (
    <div
      className="bg-white rounded-lg shadow-lg w-[450px] max-w-[450px] mt-2"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={`flex items-center justify-between px-3 py-2 ${bgClassName} text-white rounded-t-lg`}
      >
        <strong className="mr-auto">{props.title}</strong>
        <span>{formatUnixtime(props.timestamp)}</span>
        <button
          type="button"
          className="text-white hover:text-gray-200 cursor-pointer text-xl ml-2"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="p-3 bg-gray-100 rounded-b-lg">
        <p className="break-words font-bold mb-0">{props.message}</p>
      </div>
    </div>
  )
}

export const AlertMessages: FunctionComponent = () => {
  return (
    <div className="alert-messages">
      {$reconnecting.value ? <Reconnect /> : null}
      {$alertMessages.value.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />
      })}
    </div>
  )
}
