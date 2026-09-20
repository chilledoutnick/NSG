import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

const fields = ["email", "firstname", "lastname", "phone"];

const CustomDropdown = ({ selectedField, onChange }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target) &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setOpen((prev) => !prev);
  };

  return (
    <>
      <div
        ref={buttonRef}
        onClick={toggleDropdown}
        style={{
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer",
          background: "#fff",
          textAlign: "left",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {selectedField || "Select field"} <span>▾</span>
      </div>

      {open &&
        ReactDOM.createPortal(
          <ul
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 9999,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: "4px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              listStyle: "none",
              padding: "0",
              margin: "0",
              pointerEvents: "auto",
            }}
          >
            {fields.map((field) => (
              <li
                key={field}
                onClick={() => {
                  console.log("clicked field:", field);
                  onChange(field);
                  setOpen(false);
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff")
                }
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
};

export default CustomDropdown;
