import { useSignal } from '@preact/signals'
import type React from 'react'
import { useEffect } from 'react'
import { Button, FormControl, FormGroup } from 'react-bootstrap'

const prettyFormat = (jsonString: string, setValue: (value: string) => void): void => {
  if (jsonString === '') {
    return
  }
  try {
    const formated = JSON.stringify(JSON.parse(jsonString), null, 2)
    setValue(formated)
  } catch {
    // JSON.parse に失敗した場合は何もしない
  }
}

type JSONInputFieldProps = {
  controlId: string
  placeholder: string
  value: string
  disabled: boolean
  setValue: (value: string) => void
  extraControls?: React.ReactNode
  rows?: number
  cols?: number
}

export const JSONInputField = ({
  value,
  controlId,
  placeholder,
  disabled,
  setValue,
  extraControls,
  rows,
  cols,
}: JSONInputFieldProps) => {
  const invalidJsonString = useSignal(false)
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value)
  }
  useEffect(() => {
    if (value === '') {
      invalidJsonString.value = false
      return
    }
    try {
      JSON.parse(value)
      invalidJsonString.value = false
    } catch {
      invalidJsonString.value = true
    }
  }, [value, invalidJsonString])
  return (
    <FormGroup className="form-inline position-relative" controlId={controlId}>
      <FormControl
        className={invalidJsonString.value ? 'flex-fill invalid-json' : 'flex-fill'}
        as="textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        cols={cols || 100}
        disabled={disabled}
      />
      <div className="json-input-textarea-overlay">
        {extraControls}
        <Button
          type="button"
          variant="light"
          size="sm"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString.value}
        >
          pretty format
        </Button>
      </div>
    </FormGroup>
  )
}
