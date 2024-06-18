import React from 'react';

const CustomTextareaWidget = ({
  id,
  placeholder,
  value,
  required,
  disabled,
  readonly,
  autofocus,
  onBlur,
  onFocus,
  onChange,
  options,
  schema,
  formContext,
  uiSchema,
}) => {
  const _onChange = ({ target: { value } }) => onChange(value === '' ? options.emptyValue : value);

  // Set default values directly inside the component function
  autofocus = autofocus || false;
  options = options || {};

  return (
    <textarea
      id={id}
      className="form-control"
      value={value || ''}
      placeholder={placeholder}
      required={required}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      onBlur={onBlur && (event => onBlur(id, event.target.value))}
      onFocus={onFocus && (event => onFocus(id, event.target.value))}
      onChange={_onChange}
    />
  );
};

export default CustomTextareaWidget;
