import type React from 'react'
import { useEffect } from 'react'

import { deleteAlertMessage, reconnectSora, setSoraReconnecting } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import type { AlertMessage } from '@/types'
import { formatUnixtime } from '@/utils'

const Reconnect: React.FC = () => {
  const reconnectingTrials = useSoraDevtoolsStore((state) => state.soraContents.reconnectingTrials)
  const onClose = (): void => {
    setSoraReconnecting(false)
  }
  useEffect(() => {
    reconnectSora()
  }, [])
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 20000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="flex flex-col w-[450px] mt-2.5 rounded overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-yellow-500 text-white">
        <strong className="flex-1">Reconnect</strong>
        <button onClick={onClose} className="ml-2 text-xl leading-none hover:opacity-80">
          ×
        </button>
      </div>
      <div className="px-3 py-2 bg-gray-100">
        <p className="break-words font-bold m-0">
          Reconnecting... (trials {reconnectingTrials})
        </p>
      </div>
    </div>
  )
}

const Alert: React.FC<AlertMessage> = (props) => {
  const onClose = (): void => {
    deleteAlertMessage(props.timestamp)
  }
  const bgClassName = props.type === 'error' ? 'bg-red-600' : 'bg-blue-500'
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 20000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="flex flex-col w-[450px] mt-2.5 rounded overflow-hidden shadow-lg">
      <div className={`flex items-center justify-between px-3 py-2 ${bgClassName} text-white`}>
        <strong className="flex-1">{props.title}</strong>
        <span className="text-sm">{formatUnixtime(props.timestamp)}</span>
        <button onClick={onClose} className="ml-2 text-xl leading-none hover:opacity-80">
          ×
        </button>
      </div>
      <div className="px-3 py-2 bg-gray-100">
        <p className="break-words font-bold m-0">{props.message}</p>
      </div>
    </div>
  )
}

export const AlertMessages: React.FC = () => {
  const alertMessages = useSoraDevtoolsStore((state) => state.alertMessages)
  const reconnecting = useSoraDevtoolsStore((state) => state.soraContents.reconnecting)
  return (
    <div className="alert-messages">
      {reconnecting ? <Reconnect /> : null}
      {alertMessages.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />
      })}
    </div>
  )
}
