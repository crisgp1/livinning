import React from 'react'

interface TextareaProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  rows?: number
  defaultValue?: string
}

export function Textarea({
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  id,
  name,
  required = false,
  rows = 3,
  defaultValue
}: TextareaProps) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      id={id}
      name={name}
      required={required}
      rows={rows}
      defaultValue={defaultValue}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-vertical ${className}`}
    />
  )
}