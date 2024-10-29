import type React from 'react'
import { Button, Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setEnabledForwardingFilters, setForwardingFilters } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { useEffect, useState } from 'react'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFiltersForm: React.FC = () => {
  const enabledForwardingFilters = useAppSelector((state) => state.enabledForwardingFilters)
  const forwardingFilters = useAppSelector((state) => state.forwardingFilters)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const [invalidJsonString, setInvalidJsonString] = useState(false)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledForwardingFilters(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setForwardingFilters(event.target.value))
  }
  const prettyFormat = (jsonString: string): void => {
    if (jsonString === '') {
      return
    }
    try {
      const formated = JSON.stringify(JSON.parse(jsonString), null, 2)
      dispatch(setForwardingFilters(formated))
    } catch {
      // JSON.parse に失敗した場合は何もしない
    }
  }
  // JSON 構文のチェック
  useEffect(() => {
    if (forwardingFilters === '') {
      setInvalidJsonString(false)
      return
    }
    try {
      JSON.parse(forwardingFilters)
      setInvalidJsonString(false)
    } catch {
      setInvalidJsonString(true)
    }
  }, [forwardingFilters])
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledForwardingFilters">
            <TooltipFormCheck
              kind="forwardingFilters"
              checked={enabledForwardingFilters}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilters
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledForwardingFilters ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline position-relative" controlId="forwardingFilters">
              <FormControl
                className={invalidJsonString ? 'flex-fill invalid-json' : 'flex-fill'}
                as="textarea"
                placeholder="forwardingFiltersを指定"
                value={forwardingFilters}
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
                onClick={() => prettyFormat(forwardingFilters)}
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
