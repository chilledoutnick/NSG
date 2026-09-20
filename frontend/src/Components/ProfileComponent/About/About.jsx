import React, { useState, useEffect, useRef } from "react";
import "./About.scss";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import BlurPopup from "../../../Components/BlurPopup/BlurPopup";
import axios from "axios";
import toast from "react-hot-toast";

function About({ about, username, onUpdateAbout }) {
  const [showAdd, setShowAdd] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const aboutRef = useRef(null);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };


  useEffect(() => {
    if (about) {
      setAboutText(about);
    }
  }, [about]);


  useEffect(() => {
    if (showAdd) {
      setTimeout(() => aboutRef.current?.focus(), 0);
    }
  }, [showAdd]);

  const handleEdit = () => {
    setAboutText(about || "");
    setShowAdd(true);
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length > 2500) {
      setErrorMsg("Character limit exceeded (2500)");
      return;
    }
    setErrorMsg("");
    setAboutText(value);
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    if (aboutText.length + paste.length > 2500) {
      e.preventDefault();
      setErrorMsg("Character limit exceeded (2500)");
    }
  };

  const handleSave = async () => {
    if (!aboutText.trim() || !username || isLoading) return;

    const trimmedAbout = aboutText.trim();
    setIsLoading(true);

    try {
      const payload = {
        username: username,
        about: trimmedAbout,
      };

      await axios.post("api/profile/update_profile/", payload, config);

      if (onUpdateAbout) {
        onUpdateAbout(trimmedAbout);
      }

      setShowAdd(false);

      setTimeout(() => {
        toast.success("About section updated successfully!");
      }, 300);
    } catch (error) {
      console.error("Error updating about:", error);
      setShowAdd(false);

      setTimeout(() => {
        toast.error("Failed to update about section. Please try again.");
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAdd(false);
    setAboutText(about || "");
  };

  const isDisabled = !aboutText.trim() || isLoading || errorMsg;

  const displayAbout =
    about ||
    "I'm here to help families achieve prosperous futures and realize their dreams through trusted financial empowerment.";

  return (
    <div className="profile_about_con">
      <h2>About</h2>
      <p>{displayAbout}</p>
      <button onClick={handleEdit} className="profile_edit_btn">
        <ModeEditOutlineOutlinedIcon className="icon" />
        Edit
      </button>

      {showAdd && (
        <BlurPopup onClose={handleCancel} openState={showAdd}>
          <div className="blurpopup_con_wrapper profile_edit_popup edit_About">
            <h2>Edit About section</h2>
            <h4 className="welcome_msg_text">
              Write an illustrative description for your profile that can hook
              your clients instantly.
            </h4>
            <label htmlFor="about-textarea">About*</label>
            <textarea
              id="about-textarea"
              ref={aboutRef}
              className={`add_input ${errorMsg ? "input-error" : ""}`}
              style={{
                minHeight: 120,
                maxHeight: 200,
                overflowY: "auto",
                resize: "vertical",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              value={aboutText}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder="I'm here to help families achieve prosperous futures and realize their dreams through trusted financial empowerment."
              disabled={isLoading}
            />
            {errorMsg && <p className="error-message">{errorMsg}</p>}

            <div className="profile_btn">
              <button
                onClick={handleCancel}
                className="btn-cancel"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                disabled={isDisabled}
                style={{
                  backgroundColor: isDisabled ? "#ccc" : undefined,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
                onClick={handleSave}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default About;
