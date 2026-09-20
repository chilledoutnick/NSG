import React, { useState, useEffect, useRef } from "react";
import "./WelcomeMessage.scss";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import BlurPopup from "../../../Components/BlurPopup/BlurPopup";
import axios from "axios";
import toast from "react-hot-toast";

export default function WelcomeMessage({
  welcomeMessage,
  username,
  onUpdateWelcomeMessage,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [headingError, setHeadingError] = useState(false);
  const [subHeadingError, setSubHeadingError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const headingRef = useRef(null);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  useEffect(() => {
    if (welcomeMessage) {
      setHeading(welcomeMessage.heading || "Welcome aboard");
      setSubHeading(
        welcomeMessage.subheading ||
          "Explore my profile, reach out for inquiries or collaborations. Let's connect!"
      );
    }
  }, [welcomeMessage]);

  useEffect(() => {
    if (showAdd) {
      setTimeout(() => headingRef.current?.focus(), 0);
    }
  }, [showAdd]);

  const handleEdit = () => {
    setHeading(welcomeMessage?.heading || "Welcome aboard");
    setSubHeading(
      welcomeMessage?.subheading ||
        "Explore my profile, reach out for inquiries or collaborations. Let's connect!"
    );
    setHeadingError(false);
    setSubHeadingError(false);
    setShowAdd(true);
  };

  const isDisabled =
    heading.trim() === "" ||
    subHeading.trim() === "" ||
    headingError ||
    subHeadingError ||
    isLoading;

  const handleSave = async () => {
    if (isDisabled || !username) return;

    const trimmedHeading = heading.trim();
    const trimmedSubHeading = subHeading.trim();

    setIsLoading(true);

    try {
      const payload = {
        username: username,
        wlcm_message: {
          heading: trimmedHeading,
          subheading: trimmedSubHeading,
        },
        wlcm_heading: trimmedHeading,
        wlcm_subheading: trimmedSubHeading,
      };

      await axios.post("api/profile/update_profile/", payload, config);

      if (onUpdateWelcomeMessage) {
        onUpdateWelcomeMessage({
          heading: trimmedHeading,
          subheading: trimmedSubHeading,
        });
      }

      setShowAdd(false);

      setTimeout(() => {
        toast.success("Welcome message updated successfully!");
      }, 300);
    } catch (error) {
      console.error("Error updating welcome message:", error);
      setShowAdd(false);

      setTimeout(() => {
        toast.error("Failed to update welcome message. Please try again.");
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowAdd(false);
    setHeading(welcomeMessage?.heading || "Welcome aboard");
    setSubHeading(
      welcomeMessage?.subheading ||
        "Explore my profile, reach out for inquiries or collaborations. Let's connect!"
    );
    setHeadingError(false);
    setSubHeadingError(false);
  };

  const handleHeadingChange = (e) => {
    const value = e.target.value;
    setHeading(value);
    setHeadingError(value.length > 20);
  };

  const handleSubHeadingChange = (e) => {
    const value = e.target.value;
    setSubHeading(value);
    setSubHeadingError(value.length > 100);
  };

  const displayHeading = welcomeMessage?.heading || "Welcome aboard";
  const displaySubHeading =
    welcomeMessage?.subheading ||
    "Explore my profile, reach out for inquiries or collaborations. Let's connect!";

  return (
    <div className="welcome_msg_con">
      <h2>Your welcome message</h2>
      <h5>{displayHeading}</h5>
      <p className="welcome_msg_text">{displaySubHeading}</p>

      <button onClick={handleEdit} className="profile_edit_btn">
        <ModeEditOutlineOutlinedIcon className="icon" />
        Edit
      </button>

      {showAdd && (
        <BlurPopup onClose={handleClose} openState={showAdd}>
          <div className="blurpopup_con_wrapper profile_edit_popup">
            <h2>Edit your welcome message</h2>
            <h4>Add a professional welcome message, yet catchy.</h4>

            <label htmlFor="heading">Heading (Max. 20 characters) *</label>
            <input
              id="heading"
              ref={headingRef}
              type="text"
              maxLength={21}
              value={heading}
              onChange={handleHeadingChange}
              placeholder="Welcome Aboard"
              style={{ borderColor: headingError ? "red" : undefined }}
              disabled={isLoading}
            />
            {headingError && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 20 characters
              </span>
            )}

            <label htmlFor="sub-heading">
              Sub-heading (Max. 100 characters) *
            </label>
            <textarea
              id="sub-heading"
              className="add_input"
              style={{
                minHeight: 58,
                borderColor: subHeadingError ? "red" : undefined,
              }}
              maxLength={101}
              value={subHeading}
              onChange={handleSubHeadingChange}
              placeholder="Explore my profile, reach out for inquiries or collaborations. Let's connect!."
              disabled={isLoading}
            />
            {subHeadingError && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 100 characters
              </span>
            )}

            <div className="profile_btn">
              <button
                onClick={handleClose}
                className="btn-cancel"
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                className={`btn-save${isDisabled ? " disabled" : ""}`}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                onClick={handleSave}
                style={{
                  backgroundColor: isDisabled ? "#ccc" : undefined,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
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
