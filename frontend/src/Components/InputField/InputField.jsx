import { useState } from "react";
import "./InputField.scss";

const InputField = ({
  name,
  label,
  type,
  value,
  onChange,
  className,
  id,
  onBlur = () => {},
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(value !== "");
  const handleBlur = () => setIsFocused(value !== "");

  return (
    <div
      className={`${className} input-field ${
        isFocused || value ? "focused" : ""
      }`}
    >
      <label className="input-label">{label}</label>
      <input
        id={id}
        className="custom_input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={(e) => {
          handleBlur();
          onBlur(e);
        }}
      />
    </div>
  );
};

export default InputField;
