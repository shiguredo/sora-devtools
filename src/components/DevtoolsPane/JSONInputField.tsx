import type React from 'react'
import { useEffect, useState } from 'react'

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
  const [invalidJsonString, setInvalidJsonString] = useState(false)
  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setValue(event.target.value)
  }
  useEffect(() => {
    if (value === '') {
      setInvalidJsonString(false)
      return
    }
    try {
      JSON.parse(value)
      setInvalidJsonString(false)
    } catch {
      setInvalidJsonString(true)
    }
  }, [value])
  return (
    <div className="relative">
      <textarea
        id={controlId}
        className={`flex-1 w-full px-3 py-1.5 text-base border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${invalidJsonString ? 'border-red-500 invalid-json' : 'border-gray-300'}`}
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
        rows={rows || 10}
        disabled={disabled}
      />
      <div className="json-input-textarea-overlay">
        {extraControls}
        <button
          type="button"
          onClick={() => prettyFormat(value, setValue)}
          disabled={invalidJsonString}
          className="px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          pretty format
        </button>
      </div>
    </div>
  )
}
