import React, { JSX, useState } from 'react'
import { Collapse } from 'react-bootstrap'

import { formatUnixtime } from '@/utils'

import { CopyLogButton } from './CopyLogButton'

type DescriptionProps = {
  description: string | number | Record<string, unknown>
  wordBreak?: boolean
}
const Description: React.FC<DescriptionProps> = (props) => {
  const { description } = props
  if (description === undefined) {
    return null
  }
  if (typeof description !== 'object') {
    return (
      <div className="debug-message">
        <div className="col-sm-12">
          <pre className={props.wordBreak ? 'word-break' : ''}>{description}</pre>
        </div>
      </div>
    )
  }
  return (
    <div className="debug-message">
      <div className="col-sm-12">
        <pre className={props.wordBreak ? 'word-break' : ''}>
          {JSON.stringify(description, null, 2)}
        </pre>
      </div>
    </div>
  )
}

type Props = {
  timestamp: number | null
  title: string
  description: string | number | Record<string, unknown>
  defaultShow?: boolean
  label?: JSX.Element | null
  wordBreak?: boolean
}
export const Message: React.FC<Props> = (props) => {
  const { defaultShow, description, title, timestamp, label } = props
  const [show, setShow] = useState(defaultShow === undefined ? false : defaultShow)
  const ariaControls = timestamp ? title + timestamp : title
  const disabled = description === undefined
  return (
    <div className="border border-light rounded mb-1 bg-dark" data-title={title}>
      <div className="d-flex justify-content-between align-items-center text-break">
        <a
          className={`debug-title ${disabled ? 'disabled' : ''}`}
          // biome-ignore lint/a11y/useValidAnchor: <explanation>
          onClick={() => setShow(!show)}
          aria-controls={ariaControls}
          aria-expanded={show}
        >
          <i className={`${show ? 'arrow-bottom' : 'arrow-right'} ${disabled ? 'disabled' : ''}`} />{' '}
          {timestamp ? (
            <span className="text-white-50 me-1">[{formatUnixtime(timestamp)}]</span>
          ) : null}
          {label}
          <span>{title}</span>
        </a>
        <div className="border-left">
          <CopyLogButton
            text={
              typeof description === 'string' ? description : JSON.stringify(description, null, 2)
            }
            disabled={disabled}
          />
        </div>
      </div>
      <Collapse in={show}>
        <div className="border-top">
          <Description description={description} wordBreak={props.wordBreak} />
        </div>
      </Collapse>
    </div>
  )
}
