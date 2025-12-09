import React, { type JSX, useState } from 'react'
import { Collapse } from 'react-bootstrap'

import { formatUnixtime } from '@/utils'

import { CopyLogButton } from './CopyLogButton.tsx'
import { JsonTree } from './JsonTree.tsx'

type DescriptionProps = {
  description: string | number | Record<string, unknown>
  prevDescription?: unknown
  wordBreak?: boolean
}
const Description = React.memo<DescriptionProps>((props) => {
  const { description, prevDescription } = props
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
  // prevDescription が渡されている場合は JsonTree を使用（差分更新あり）
  if (prevDescription !== undefined) {
    return (
      <div className="debug-message">
        <div className="col-sm-12">
          <div className={props.wordBreak ? 'word-break' : ''}>
            <JsonTree data={description} prevData={prevDescription} />
          </div>
        </div>
      </div>
    )
  }
  // prevDescription がない場合は従来通り JSON.stringify
  return (
    <div className="debug-message">
      <div className="col-sm-12">
        <pre className={props.wordBreak ? 'word-break' : ''}>
          {JSON.stringify(description, null, 2)}
        </pre>
      </div>
    </div>
  )
})

type Props = {
  timestamp: number | null
  title: string
  description: string | number | Record<string, unknown>
  prevDescription?: unknown
  defaultShow?: boolean
  label?: JSX.Element | null
  wordBreak?: boolean
}
export const Message = React.memo<Props>((props) => {
  const { defaultShow, description, prevDescription, title, timestamp, label } = props
  const [show, setShow] = useState(defaultShow === undefined ? false : defaultShow)
  const ariaControls = timestamp ? title + timestamp : title
  const disabled = description === undefined
  return (
    <div className="border border-light rounded mb-1 bg-dark" data-title={title}>
      <div className="d-flex justify-content-between align-items-center text-break">
        <button
          type="button"
          className={`debug-title ${disabled ? 'disabled' : ''}`}
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
        </button>
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
          <Description
            description={description}
            prevDescription={prevDescription}
            wordBreak={props.wordBreak}
          />
        </div>
      </Collapse>
    </div>
  )
})
