import type React from 'react'
import { useEffect, useRef, useState } from 'react'

type DropdownSelectProps = {
  options: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  renderOption?: (value: string) => { label: string; disabled?: boolean }
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (optionValue: string) => {
    const option = renderOption?.(optionValue)
    if (!option?.disabled) {
      onChange(optionValue)
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-[34px] h-[40px] border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '16px 12px',
        }}
        aria-expanded={isOpen}
      />
      {isOpen && (
        <div className="absolute right-0 mt-1 min-w-[130px] bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((optionValue) => {
            const option = renderOption
              ? renderOption(optionValue)
              : { label: optionValue || '未指定', disabled: false }
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => handleSelect(optionValue)}
                disabled={option.disabled}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                  value === optionValue ? 'bg-gray-50 font-medium' : ''
                } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
