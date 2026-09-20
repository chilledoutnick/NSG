// import { useState, useRef, useEffect } from "react";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
// import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
// import BlurPopup from "../../BlurPopup/BlurPopup";
// import AddIcon from "@mui/icons-material/Add";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
// import SaveIcon from "@mui/icons-material/Save";
// import "./ContactInfo.scss";

// // ── Constants ──────────────────────────────────────────
// const MAX_CONTACTS = 5;

// const LABEL_OPTIONS = {
//   email: ["Office", "Home", "Personal", "Work", "Other"],
//   phone: ["Home", "Mobile", "Office", "Work", "Other"],
// };
// const ADD_LABEL_OPTIONS = [
//   "Office",
//   "Home",
//   "Mobile",
//   "Personal",
//   "Work",
//   "Other",
// ];

// let idCounter = 100;

// // ── Validation ─────────────────────────────────────────
// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

// const validateContact = (value) => {
//   const trimmed = value.trim();
//   if (!trimmed) return { valid: false, error: "This field cannot be empty." };
//   if (trimmed.includes("@")) {
//     if (!EMAIL_REGEX.test(trimmed))
//       return { valid: false, error: "Enter a valid email address." };
//     return { valid: true, type: "email" };
//   } else {
//     if (!PHONE_REGEX.test(trimmed))
//       return { valid: false, error: "Enter a valid phone number." };
//     return { valid: true, type: "phone" };
//   }
// };

// // ── Label Dropdown (add row only) ─────────────────────
// function LabelDropdown({ value, options, onChange }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const fn = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     if (open) document.addEventListener("mousedown", fn);
//     return () => document.removeEventListener("mousedown", fn);
//   }, [open]);

//   return (
//     <div className="ci-label-dropdown" ref={ref}>
//       <button className="ci-label-trigger" onClick={() => setOpen((o) => !o)}>
//         {value}
//         <ExpandMoreIcon />
//       </button>
//       {open && (
//         <div className="ci-label-menu">
//           {options.map((opt) => (
//             <button
//               key={opt}
//               className={value === opt ? "active" : ""}
//               onClick={() => {
//                 onChange(opt);
//                 setOpen(false);
//               }}
//             >
//               {opt}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // Edit Popup — matches "Edit your welcome message" style exactly
// // Simple white card: title, subtitle, input, label pills, footer
// // ─────────────────────────────────────────────────────────────
// function EditContactPopup({ field, onClose, onSave, allFields }) {
//   const [value, setValue] = useState(field.value);
//   const [label, setLabel] = useState(field.label);
//   const [error, setError] = useState("");

//   const isEmail = value.trim().includes("@");
//   const detectedType = isEmail ? "email" : "phone";
//   const labelOptions = LABEL_OPTIONS[detectedType];

//   // if user switches email↔phone, reset label to first valid option
//   useEffect(() => {
//     if (!labelOptions.includes(label)) setLabel(labelOptions[0]);
//   }, [detectedType]);

//   const handleSave = () => {
//     const result = validateContact(value);
//     if (!result.valid) {
//       setError(result.error);
//       return;
//     }

//     const isDuplicate = allFields.some(
//       (f) =>
//         f.id !== field.id &&
//         f.value.trim().toLowerCase() === value.trim().toLowerCase(),
//     );
//     if (isDuplicate) {
//       setError("This contact already exists.");
//       return;
//     }

//     onSave({ ...field, value: value.trim(), label, type: result.type });
//     onClose();
//   };

//   return (
//     <BlurPopup onClose={onClose} openState={true}>
//       <div className="ci-edit-popup">
//         {/* Title + subtitle — same as "Edit your welcome message" */}
//         <p className="ci-popup-title">Edit Contact</p>
//         <p className="ci-popup-subtitle">
//           Update your {isEmail ? "email address" : "phone number"} and label
//           below.
//         </p>

//         {/* Value input */}
//         <label className="ci-popup-label">
//           {isEmail ? "Email Address" : "Phone Number"} (Max.{" "}
//           {isEmail ? "100" : "20"} characters) *
//         </label>
//         <div
//           className={`ci-popup-input-wrap${error ? " ci-popup-input-wrap--error" : ""}`}
//         >
//           <span className="ci-popup-input-icon">
//             {isEmail ? <EmailOutlinedIcon /> : <LocalPhoneOutlinedIcon />}
//           </span>
//           <input
//             autoFocus
//             type="text"
//             value={value}
//             onChange={(e) => {
//               setValue(e.target.value);
//               setError("");
//             }}
//             onKeyDown={(e) => e.key === "Enter" && handleSave()}
//             placeholder={
//               isEmail ? "e.g. john@example.com" : "e.g. +1 818-414-5917"
//             }
//           />
//         </div>
//         {error && <p className="ci-popup-error">⚠ {error}</p>}

//         {/* Label pills */}
//         <div className="ci-popup-field-gap" />
//         <label className="ci-popup-label">Label *</label>
//         <div className="ci-popup-label-options">
//           {labelOptions.map((opt) => (
//             <button
//               key={opt}
//               className={`ci-popup-label-opt${label === opt ? " ci-popup-label-opt--active" : ""}`}
//               onClick={() => setLabel(opt)}
//             >
//               {opt}
//             </button>
//           ))}
//         </div>

//         {/* Footer — same Cancel / Save layout */}
//         <div className="ci-popup-footer">
//           <button className="ci-popup-cancel" onClick={onClose}>
//             Cancel
//           </button>
//           <button className="ci-popup-save" onClick={handleSave}>
//             Save
//           </button>
//         </div>
//       </div>
//     </BlurPopup>
//   );
// }

// // ── Delete Confirmation ────────────────────────────────
// const DeleteConfirmationDialog = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   itemValue,
// }) => {
//   if (!isOpen) return null;
//   return (
//     <BlurPopup className="delete-confirmation-overlay" onClose={onClose}>
//       <div className="delete-confirmation-dialog">
//         <h3 className="dialog-title">Remove Contact</h3>
//         <p className="dialog-message">
//           Are you sure you want to remove this contact?
//         </p>
//         <p className="dialog-link">{itemValue}</p>
//         <div className="dialog-actions">
//           <button className="cancel-btn" onClick={onClose}>
//             Cancel
//           </button>
//           <button className="delete-btn" onClick={onConfirm}>
//             Delete
//           </button>
//         </div>
//       </div>
//     </BlurPopup>
//   );
// };

// // ── Single Field Row ───────────────────────────────────
// function FieldRow({ field, onEdit, onDelete }) {
//   const isEmail = field.type === "email";

//   return (
//     <div className="ci-field-row">
//       <span className="ci-field-icon">
//         {isEmail ? (
//           <EmailOutlinedIcon fontSize="small" />
//         ) : (
//           <LocalPhoneOutlinedIcon fontSize="small" />
//         )}
//       </span>

//       <a
//         href={isEmail ? `mailto:${field.value}` : `tel:${field.value}`}
//         className="ci-field-link"
//         title={isEmail ? "Click to send email" : "Click to call"}
//       >
//         {field.value}
//       </a>

//       <span className="ci-label-pill">{field.label}</span>

//       <div className="ci-row-actions">
//         <button
//           className="ci-pencil-btn"
//           onClick={() => onEdit(field)}
//           title="Edit"
//         >
//           <ModeEditOutlineOutlinedIcon
//             fontSize="medium"
//             style={{ color: "#410099" }}
//           />
//         </button>
//         <button
//           className="ci-delete-btn"
//           onClick={() => onDelete(field.id)}
//           title="Delete"
//         >
//           <RemoveCircleOutlineIcon fontSize="medium" style={{ color: "red" }} />
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Main Component ─────────────────────────────────────
// export default function ContactInfo() {
//   const [fields, setFields] = useState([
//     { id: 1, type: "email", value: "notifications@nsgcrm.com", label: "Office" },
//   ]);

//   const [editingField, setEditingField] = useState(null);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);
//   const [inputValue, setInputValue] = useState("");
//   const [inputLabel, setInputLabel] = useState("Office");
//   const [inputError, setInputError] = useState("");

//   const hasReachedLimit = fields.length >= MAX_CONTACTS;

//   const handleAdd = () => {
//     const result = validateContact(inputValue);
//     if (!result.valid) {
//       setInputError(result.error);
//       return;
//     }
//     const isDuplicate = fields.some(
//       (f) => f.value.trim().toLowerCase() === inputValue.trim().toLowerCase(),
//     );
//     if (isDuplicate) {
//       setInputError("This contact already exists.");
//       return;
//     }
//     setFields((prev) => [
//       ...prev,
//       {
//         id: ++idCounter,
//         type: result.type,
//         value: inputValue.trim(),
//         label: inputLabel,
//       },
//     ]);
//     setInputValue("");
//     setInputLabel("Office");
//     setInputError("");
//   };

//   const handleEditSave = (updatedField) => {
//     setFields((prev) =>
//       prev.map((f) => (f.id === updatedField.id ? updatedField : f)),
//     );
//     setEditingField(null);
//   };

//   const handleDeleteClick = (id) => {
//     setDeleteId(id);
//     setShowDeleteDialog(true);
//   };
//   const confirmDelete = () => {
//     setFields((prev) => prev.filter((f) => f.id !== deleteId));
//     setShowDeleteDialog(false);
//     setDeleteId(null);
//   };
//   const cancelDelete = () => {
//     setShowDeleteDialog(false);
//     setDeleteId(null);
//   };

//   return (
//     <div className="contact-info-con">
//       <div className="ci-header-container">
//         <h2>Contact Info</h2>
//       </div>
//       <h5>Add your email addresses and phone numbers to your profile.</h5>

//       {hasReachedLimit ? (
//         <div className="ci-limit-tag">
//           ⚠ Max {MAX_CONTACTS} contacts reached
//         </div>
//       ) : (
//         <div className="ci-add-row">
//           <div className="ci-input-wrap">
//             <div
//               className={`ci-input-inner${inputError ? " ci-input-inner--error" : ""}`}
//             >
//               <span className="ci-input-icon">
//                 {inputValue.includes("@") ? (
//                   <EmailOutlinedIcon fontSize="small" />
//                 ) : (
//                   <LocalPhoneOutlinedIcon fontSize="small" />
//                 )}
//               </span>
//               <input
//                 value={inputValue}
//                 onChange={(e) => {
//                   setInputValue(e.target.value);
//                   if (inputError) setInputError("");
//                 }}
//                 onKeyDown={(e) => e.key === "Enter" && handleAdd()}
//                 placeholder="Enter email or phone number here and click Add"
//               />
//               <select
//                 value={inputLabel}
//                 onChange={(e) => setInputLabel(e.target.value)}
//               >
//                 {ADD_LABEL_OPTIONS.map((o) => (
//                   <option key={o}>{o}</option>
//                 ))}
//               </select>
//             </div>
//             {inputError && (
//               <span className="ci-input-error">⚠ {inputError}</span>
//             )}
//           </div>
//           <button className="ci-add-btn" onClick={handleAdd}>
//             <AddIcon /> Add
//           </button>
//         </div>
//       )}

//       {fields.length > 0 && (
//         <div className="ci-divider">
//           <div className="ci-divider-line" />
//           <span>Saved</span>
//           <div className="ci-divider-line" />
//         </div>
//       )}

//       {fields.length === 0 ? (
//         <p className="ci-empty">No contact details yet. Add one above.</p>
//       ) : (
//         <div className="ci-fields">
//           {fields.map((field) => (
//             <FieldRow
//               key={field.id}
//               field={field}
//               onEdit={(f) => setEditingField(f)}
//               onDelete={handleDeleteClick}
//             />
//           ))}
//         </div>
//       )}

//       {editingField && (
//         <EditContactPopup
//           field={editingField}
//           allFields={fields}
//           onClose={() => setEditingField(null)}
//           onSave={handleEditSave}
//         />
//       )}

//       <DeleteConfirmationDialog
//         isOpen={showDeleteDialog}
//         onClose={cancelDelete}
//         onConfirm={confirmDelete}
//         itemValue={deleteId ? fields.find((f) => f.id === deleteId)?.value : ""}
//       />
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import BlurPopup from "../../BlurPopup/BlurPopup";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import axios from "axios";
import toast from "react-hot-toast";
import "./ContactInfo.scss";

// ── Constants ──────────────────────────────────────────
const MAX_CONTACTS = 5;

const LABEL_OPTIONS = {
  email: ["Office", "Home", "Personal", "Work", "Other"],
  phone: ["Home", "Mobile", "Office", "Work", "Other"],
};
const ADD_LABEL_OPTIONS = [
  "Office",
  "Home",
  "Mobile",
  "Personal",
  "Work",
  "Other",
];

// ── Validation ─────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

const validateContact = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: "This field cannot be empty." };
  if (trimmed.includes("@")) {
    if (!EMAIL_REGEX.test(trimmed))
      return { valid: false, error: "Enter a valid email address." };
    return { valid: true, type: "email" };
  } else {
    if (!PHONE_REGEX.test(trimmed))
      return { valid: false, error: "Enter a valid phone number." };
    return { valid: true, type: "phone" };
  }
};

// ── Axios config — same as WelcomeMessage ──────────────
const getConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  },
});

// ── Label Dropdown ─────────────────────────────────────
function LabelDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  return (
    <div className="ci-label-dropdown" ref={ref}>
      <button className="ci-label-trigger" onClick={() => setOpen((o) => !o)}>
        {value}
        <ExpandMoreIcon />
      </button>
      {open && (
        <div className="ci-label-menu">
          {options.map((opt) => (
            <button
              key={opt}
              className={value === opt ? "active" : ""}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Edit Popup ─────────────────────────────────────────
function EditContactPopup({ field, onClose, onSave, allFields, isLoading }) {
  const [value, setValue] = useState(field.value);
  const [label, setLabel] = useState(field.label);
  const [error, setError] = useState("");

  const isEmail = value.trim().includes("@");
  const detectedType = isEmail ? "email" : "phone";
  const labelOptions = LABEL_OPTIONS[detectedType];

  useEffect(() => {
    if (!labelOptions.includes(label)) setLabel(labelOptions[0]);
  }, [detectedType]);

  const handleSave = () => {
    const result = validateContact(value);
    if (!result.valid) {
      setError(result.error);
      return;
    }

    const isDuplicate = allFields.some(
      (f) =>
        f.id !== field.id &&
        f.value.trim().toLowerCase() === value.trim().toLowerCase(),
    );
    if (isDuplicate) {
      setError("This contact already exists.");
      return;
    }

    // Pass updated data up — parent handles API call
    onSave({
      id: field.id,
      value: value.trim(),
      label: label.toLowerCase(),
      contact_type: result.type,
    });
  };

  return (
    <BlurPopup onClose={onClose} openState={true}>
      <div className="ci-edit-popup">
        <p className="ci-popup-title">Edit Contact</p>
        <p className="ci-popup-subtitle">
          Update your {isEmail ? "email address" : "phone number"} and label
          below.
        </p>

        {/* Value input */}
        <label className="ci-popup-label">
          {isEmail ? "Email Address" : "Phone Number"} *
        </label>
        <div
          className={`ci-popup-input-wrap${error ? " ci-popup-input-wrap--error" : ""}`}
        >
          <span className="ci-popup-input-icon">
            {isEmail ? <EmailOutlinedIcon /> : <LocalPhoneOutlinedIcon />}
          </span>
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder={
              isEmail ? "e.g. john@example.com" : "e.g. +1 818-414-5917"
            }
            disabled={isLoading}
          />
        </div>
        {error && <p className="ci-popup-error">⚠ {error}</p>}

        {/* Label pills */}
        <div className="ci-popup-field-gap" />
        <label className="ci-popup-label">Label *</label>
        <div className="ci-popup-label-options">
          {labelOptions.map((opt) => (
            <button
              key={opt}
              className={`ci-popup-label-opt${label.toLowerCase() === opt.toLowerCase() ? " ci-popup-label-opt--active" : ""}`}
              onClick={() => setLabel(opt)}
              disabled={isLoading}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="ci-popup-footer">
          <button
            className="ci-popup-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`ci-popup-save${isLoading ? " disabled" : ""}`}
            onClick={handleSave}
            disabled={isLoading}
            style={{
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </BlurPopup>
  );
}

// ── Delete Confirmation ────────────────────────────────
const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemValue,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <BlurPopup className="delete-confirmation-overlay" onClose={onClose}>
      <div className="delete-confirmation-dialog">
        <h3 className="dialog-title">Remove Contact</h3>
        <p className="dialog-message">
          Are you sure you want to remove this contact?
        </p>
        <p className="dialog-link">{itemValue}</p>
        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="delete-btn"
            onClick={onConfirm}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </BlurPopup>
  );
};

// ── Single Field Row ───────────────────────────────────
function FieldRow({ field, onEdit, onDelete }) {
  const isEmail = field.contact_type === "email";

  return (
    <div className="ci-field-row">
      <span className="ci-field-icon">
        {isEmail ? (
          <EmailOutlinedIcon fontSize="small" />
        ) : (
          <LocalPhoneOutlinedIcon fontSize="small" />
        )}
      </span>

      <a
        href={isEmail ? `mailto:${field.value}` : `tel:${field.value}`}
        className="ci-field-link"
        title={isEmail ? "Click to send email" : "Click to call"}
      >
        {field.value}
      </a>

      {/* Capitalize label for display */}
      <span className="ci-label-pill">
        {field.label.charAt(0).toUpperCase() + field.label.slice(1)}
      </span>

      <div className="ci-row-actions">
        <button
          className="ci-pencil-btn"
          onClick={() => onEdit(field)}
          title="Edit"
        >
          <ModeEditOutlineOutlinedIcon
            fontSize="medium"
            style={{ color: "#410099" }}
          />
        </button>
        <button
          className="ci-delete-btn"
          onClick={() => onDelete(field.id)}
          title="Delete"
        >
          <RemoveCircleOutlineIcon fontSize="medium" style={{ color: "red" }} />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
// username prop → same as WelcomeMessage pattern
export default function ContactInfo({ username }) {
  const [fields, setFields] = useState([]);
  const [isFetching, setIsFetching] = useState(true); // initial load
  const [isAdding, setIsAdding] = useState(false); // add loader
  const [isEditing, setIsEditing] = useState(false); // edit loader
  const [isDeleting, setIsDeleting] = useState(false); // delete loader

  const [editingField, setEditingField] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [inputValue, setInputValue] = useState("");
  const [inputLabel, setInputLabel] = useState("Office");
  const [inputError, setInputError] = useState("");

  const hasReachedLimit = fields.length >= MAX_CONTACTS;

  // ── GET — load contacts on mount / username change ──
  useEffect(() => {
    if (!username) return;
    fetchContacts();
  }, [username]);

  const fetchContacts = async () => {
    setIsFetching(true);
    try {
      const res = await axios.post(
        "api/contact_info/get_contact_info/",
        { username },
        getConfig(),
      );
      // Response is a flat array: [{ id, contact_type, value, label, ... }]
      setFields(res.data || []);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      toast.error("Failed to load contacts.");
    } finally {
      setIsFetching(false);
    }
  };

  // ── POST — add new contact ──────────────────────────
  const handleAdd = async () => {
    const result = validateContact(inputValue);
    if (!result.valid) {
      setInputError(result.error);
      return;
    }

    const isDuplicate = fields.some(
      (f) => f.value.trim().toLowerCase() === inputValue.trim().toLowerCase(),
    );
    if (isDuplicate) {
      setInputError("This contact already exists.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await axios.post(
        "api/contact_info/add_contact_info/",
        {
          username,
          contact_type: result.type,
          value: inputValue.trim(),
          label: inputLabel.toLowerCase(),
        },
        getConfig(),
      );
      // Backend returns saved object — add directly to state (no refetch needed)
      setFields((prev) => [...prev, res.data]);
      setInputValue("");
      setInputLabel("Office");
      setInputError("");
      toast.success("Contact added!");
    } catch (err) {
      console.error("Failed to add contact:", err);
      const msg = err?.response?.data?.message || "Failed to add contact.";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  // ── POST — edit contact ────────────────────────────
  // Backend uses partial=True so we send info_id + changed fields
  const handleEditSave = async ({ id, value, label, contact_type }) => {
    setIsEditing(true);
    try {
      const res = await axios.post(
        "api/contact_info/edit_contact_info/",
        {
          info_id: id,
          value,
          label,
          contact_type,
        },
        getConfig(),
      );
      // Update only that row in state
      setFields((prev) => prev.map((f) => (f.id === id ? res.data : f)));
      setEditingField(null);
      toast.success("Contact updated!");
    } catch (err) {
      console.error("Failed to edit contact:", err);
      const msg = err?.response?.data?.message || "Failed to update contact.";
      toast.error(msg);
    } finally {
      setIsEditing(false);
    }
  };

  // ── POST — delete contact ──────────────────────────
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.post(
        "api/contact_info/delete_contact_info/",
        { info_id: deleteId },
        getConfig(),
      );
      setFields((prev) => prev.filter((f) => f.id !== deleteId));
      setShowDeleteDialog(false);
      setDeleteId(null);
      toast.success("Contact removed!");
    } catch (err) {
      console.error("Failed to delete contact:", err);
      toast.error("Failed to delete contact.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteId(null);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="contact-info-con">
      <div className="ci-header-container">
        <h2>Contact Info</h2>
      </div>
      <h5>Add your email addresses and phone numbers to your profile.</h5>

      {/* ── Add Row ── */}
      {hasReachedLimit ? (
        <div className="ci-limit-tag">
          ⚠ Max {MAX_CONTACTS} contacts reached
        </div>
      ) : (
        <div className="ci-add-row">
          <div className="ci-input-wrap">
            <div
              className={`ci-input-inner${inputError ? " ci-input-inner--error" : ""}`}
            >
              <span className="ci-input-icon">
                {inputValue.includes("@") ? (
                  <EmailOutlinedIcon fontSize="small" />
                ) : (
                  <LocalPhoneOutlinedIcon fontSize="small" />
                )}
              </span>
              <input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Enter email or phone number here and click Add"
                disabled={isAdding}
              />
              <select
                value={inputLabel}
                onChange={(e) => setInputLabel(e.target.value)}
                disabled={isAdding}
              >
                {ADD_LABEL_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            {inputError && (
              <span className="ci-input-error">⚠ {inputError}</span>
            )}
          </div>
          <button
            className="ci-add-btn"
            onClick={handleAdd}
            disabled={isAdding}
            style={{
              opacity: isAdding ? 0.7 : 1,
              cursor: isAdding ? "not-allowed" : "pointer",
            }}
          >
            {isAdding ? (
              <>
                <span className="ci-btn-spinner" /> Adding...
              </>
            ) : (
              <>
                <AddIcon /> Add
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Divider ── */}
      {(isFetching || fields.length > 0) && (
        <div className="ci-divider">
          <div className="ci-divider-line" />
          <span>Saved</span>
          <div className="ci-divider-line" />
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isFetching ? (
        <div className="ci-skeleton">
          {[1, 2].map((i) => (
            <div key={i} className="ci-skeleton-row">
              <div className="ci-skeleton-icon" />
              <div className="ci-skeleton-text" />
              <div className="ci-skeleton-pill" />
            </div>
          ))}
        </div>
      ) : fields.length === 0 ? (
        <p className="ci-empty">No contact details yet. Add one above.</p>
      ) : (
        <div className="ci-fields">
          {fields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              onEdit={(f) => setEditingField(f)}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* ── Edit Popup ── */}
      {editingField && (
        <EditContactPopup
          field={{
            ...editingField,
            type: editingField.contact_type,
          }}
          allFields={fields}
          isLoading={isEditing}
          onClose={() => !isEditing && setEditingField(null)}
          onSave={handleEditSave}
        />
      )}

      {/* ── Delete Confirmation ── */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        itemValue={deleteId ? fields.find((f) => f.id === deleteId)?.value : ""}
      />
    </div>
  );
}
