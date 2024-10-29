import type React from 'react'
import { Button, Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setEnabledForwardingFilter, setForwardingFilter } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { useEffect, useState } from 'react'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFilterForm: React.FC = () => {
  const enabledForwardingFilter = useAppSelector((state) => state.enabledForwardingFilter)
  const forwardingFilter = useAppSelector((state) => state.forwardingFilter)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const [invalidJsonString, setInvalidJsonString] = useState(false)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledForwardingFilter(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setForwardingFilter(event.target.value))
  }
  const prettyFormat = (jsonString: string): void => {
    if (jsonString === '') {
      return
    }
    try {
      const formated = JSON.stringify(JSON.parse(jsonString), null, 2)
      dispatch(setForwardingFilter(formated))
    } catch {
      // JSON.parse に失敗した場合は何もしない
    }
  }
  // JSON 構文のチェック
  useEffect(() => {
    if (forwardingFilter === '') {
      setInvalidJsonString(false)
      return
    }
    try {
      JSON.parse(forwardingFilter)
      setInvalidJsonString(false)
    } catch {
      setInvalidJsonString(true)
    }
  }, [forwardingFilter])
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledForwardingFilter">
            <TooltipFormCheck
              kind="forwardingFilter"
              checked={enabledForwardingFilter}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilter
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledForwardingFilter ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline position-relative" controlId="forwardingFilter">
              <FormControl
                className={invalidJsonString ? 'flex-fill invalid-json' : 'flex-fill'}
                as="textarea"
                placeholder="forwardingFilterを指定"
                value={forwardingFilter}
                onChange={onChangeText}
                rows={10}
                cols={100}
                disabled={disabled}
              />
              <Button
                className="btn-pretty-format"
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={() => prettyFormat(forwardingFilter)}
              >
                pretty format
              </Button>
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  )
}
