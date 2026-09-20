import axios from "axios";
import { useEffect, useState, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
// import momentTz from "moment-timezone";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled } from "@mui/material/styles";
import { useStore } from "../../../store/advisorStore";
import Toast from "../../../Components/Toast/Toast";
import { parsePhoneNumber } from "libphonenumber-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import "./AccountInfo.scss";


const diamond = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
  >
    <path
      d="M9.2 8.75L11.85 3.5H12.15L14.8 8.75H9.2ZM11.25 20.6L2.625 10.25H11.25V20.6ZM12.75 20.6V10.25H21.375L12.75 20.6ZM16.45 8.75L13.85 3.5H19L21.625 8.75H16.45ZM2.375 8.75L5 3.5H10.15L7.55 8.75H2.375Z"
      fill="black"
    />
  </svg>
);

// const CustomTooltip = styled(({ className, ...props }) => (
//   <Tooltip {...props} classes={{ popper: className }} />
// ))(({ theme }) => ({
//   [`& .${tooltipClasses.tooltip}`]: {
//     backgroundColor: "#5B5574",
//     color: "#FFF",
//     fontSize: "12px",
//     padding: "8px",
//     borderRadius: "4px",
//     fontFamily: "'Open Sans', sans-serif",
//   },
//   [`& .${tooltipClasses.arrow}`]: {
//     color: "#5B5574",
//   },
// }));

function AccountInfo() {
  const navigate = useNavigate();
  const { advisor_data, get_advisor_data } = useStore();
  const [phone, setPhone] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // const [phoneError, setPhoneError] = useState("");
  const [errors, setErrors] = useState({
  phone: "",
});

  let user = JSON.parse(localStorage.getItem("user_info"));
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    const url = window.location.href.split("#");
    sessionStorage.setItem("signup_data", JSON.stringify(user));
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
    // if (url[1] === "card_purchase_success") {
    //   setToastText({
    //     ...ToastText,
    //     text: "Smart card purchased successfully",
    //     show: true,
    //   });
    //   window.history.pushState({}, "", "/account");
    //   get_advisor_data(true);
    // }
  }, []);

  useEffect(() => {
    if (advisor_data?.phone) {
      setPhone(advisor_data.phone);
      setInitialPhone(advisor_data.phone);
    }
  }, [advisor_data]);

  useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({
          ...ToastText,
          show: false,
        });
      }, 4000);
    }
  }, [ToastText]);


  const isPhoneChanged = phone !== initialPhone;
  const isSaveDisabled =
    !isPhoneChanged || isSaving || !!errors.phone;

  const validatePhone = (value) => {
    if (!value) return "Phone number is required";

    try {
      const phoneNumber = parsePhoneNumber(value);
      if (!phoneNumber) return "Invalid phone number";
      return phoneNumber.isValid()
        ? ""
        : "Invalid phone number. Please enter a valid number.";
    } catch {
      return "Enter phone number in proper format (e.g. +1 (555) 555-5555)";
    }
  };

  // update phone number
  // const save_phone = (phone) => {
  //   const url = "/api/user_profile/update_user/";

  //   axios
  //     .post(url, { phone }, config)
  //     .then(() => {
  //       setToastText({
  //         text: "Phone number updated successfully",
  //         show: true,
  //       });

  //       // Refresh advisor data so UI reflects new phone
  //       get_advisor_data(true);
  //     })
  //     .catch((err) => {
  //       setToastText({
  //         text: err?.response?.data?.message || "Failed to update phone",
  //         show: true,
  //       });
  //     });
  // };
  const save_phone = async () => {
  const cleanedPhone = phone.trim();
  const frontendError = validatePhone(cleanedPhone);

  if (frontendError) {
    setErrors((prev) => ({ ...prev, phone: frontendError }));
    return;
  }

  setIsSaving(true);

  try {
    await axios.post(
      "/api/user_profile/update_user/",
      { phone: cleanedPhone },
      config
    );

    setToastText({
      text: "Phone number updated successfully",
      show: true,
    });

    setInitialPhone(cleanedPhone);
    setErrors({ phone: "" });
    get_advisor_data(true);
  } catch (err) {
    const backendMessage = err?.response?.data?.message;

    if (backendMessage) {
      setErrors((prev) => ({
        ...prev,
        phone: backendMessage,
      }));
    } else {
      setToastText({
        text: "Failed to update phone number",
        show: true,
      });
    }
  } finally {
    setIsSaving(false);
  }
};



  return (
    <div className="account_info_con">
      {ToastText.show && <Toast text={ToastText.text} />}

      <div className="account_info_details_con">
        <div className="account_info_details">
          <LazyLoadImage
            src={advisor_data.profile_picture}
            alt="User"
            effect="blur"
            wrapperClassName="account_info_details_img"
          />
          <div className="account_info_text">
            <h5>{advisor_data.name}</h5>
            <p>{advisor_data.email}</p>
            <p>{advisor_data.phone}</p>
          </div>
        </div>
        <div className="account_info_plan">
          <div className="account_info_plan_text">
            <label>Phone Number</label>
            <form className="onboarding-form">
          {/* 🚨 IMPORTANT: NO custom wrapper around PhoneInput */}
          <PhoneInput
            country="us"
            value={phone}
            onChange={(value) => {
const formatted = value.startsWith("+") ? value : `+${value}`;
  setPhone(formatted);
    setErrors((prev) => ({ ...prev, phone: "" }));
  }}
            enableSearch
            containerClass="onboarding-phone-container"
            inputClass="onboarding-phone-input"
            buttonClass="onboarding-phone-button"
            dropdownClass="onboarding-phone-dropdown"
          />

          {/* {submitError && (
            <p className="error_text w-100 mt-1">{submitError}</p>
          )} */}
          {errors.phone && (
  <span className="error-message" style={{ color: "red" }}>
    {errors.phone}
  </span>
)}
<button
              className="btn-primary"
              disabled={isSaveDisabled}
              onClick={save_phone}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          {/* <button
            disabled={!phone || loading}
            onClick={updatePhone}
            className="btn-primary w-100"
          >
            {!loading ? (
              "Continue to NSG"
            ) : (
              <ThreeDots height="25" width="60" color="white" />
            )}
          </button> */}
        </form>

            {/* <input
  name="phone"
  type="text"
  placeholder="+1 (555) 555-5555"
  value={phone}
  onChange={(e) => {
    setPhone(e.target.value);
    setErrors((prev) => ({ ...prev, phone: "" }));
  }}
  style={{ borderColor: errors.phone ? "red" : "" }}
/>



            <p className="helper-text">
              Use Proper format (e.g. +1 (555) 555-5555)
            </p>

            <button
              className="btn-primary"
              disabled={isSaveDisabled}
              onClick={save_phone}
            >
              {isSaving ? "Saving..." : "Save"}
            </button> */}
          </div>
        </div>


      </div>

      {/* {showPause && (
        <BlurPopup
          onClose={() => setShowPause(false)}
          openState={showPause}
          ComponentClass="booking_integration_popup"
        >
          <div className="blurpopup_con_wrapper booking_integration_popup_pause">
            <PauseSub onClose={() => setShowPause(false)} />
          </div>
        </BlurPopup>
      )} */}
    </div>
  );
}

export default AccountInfo;



