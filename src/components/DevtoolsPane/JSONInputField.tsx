import { useSignal } from '@preact/signals'
import type { TargetedEvent } from 'preact/compat'
import { useEffect } from 'preact/hooks'

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
  const onChangeText = (event: TargetedEvent<HTMLTextAreaElement>): void => {
    setValue(event.currentTarget.value)
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
    <div className="form-inline position-relative">
      <textarea
        id={controlId}
        className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-fill${invalidJsonString.value ? ' invalid-json' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        cols={cols || 100}
        disabled={disabled}
      />
      <div className="json-input-textarea-overlay">
        {extraControls}
        <button
          type="button"
          className="px-2 py-1 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 rounded"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString.value}
        >
          pretty format
        </button>
      </div>
    </div>
  )
}
