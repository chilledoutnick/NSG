import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../../Components/LoginSlider/LoginSlider";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./Onboarding.scss";

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user_id = searchParams.get("user_id");

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    if (!localStorage.getItem("jwt")) {
      navigate("/login");
    }
  }, [navigate]);

  const updatePhone = (e) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);

    axios
      .post(
        "api/user_profile/update_user/",
        {
          phone: `+${phone}`,
          user_id,
        },
        config,
      )
      .then(() => {
        const user = JSON.parse(localStorage.getItem("user_info"));
        user.phone = phone;
        localStorage.setItem("user_info", JSON.stringify(user));
        navigate(`/signup/onboarding/sync?user_id=${user_id || ""}`);
      })
      .catch((error) => {
        setSubmitError(
          error?.response?.data?.message || "Something went wrong",
        );
        setLoading(false);
      });
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding_contant">
        <div className="onboarding_contant_top">
          <HeaderLogin />
        </div>

        <h2>Add your phone number</h2>

        <form className="onboarding-form">
          {/* 🚨 IMPORTANT: NO custom wrapper around PhoneInput */}
          <PhoneInput
            country="us"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              setSubmitError("");
            }}
            enableSearch
            containerClass="onboarding-phone-container"
            inputClass="onboarding-phone-input"
            buttonClass="onboarding-phone-button"
            dropdownClass="onboarding-phone-dropdown"
          />

          {submitError && (
            <p className="error_text w-100 mt-1">{submitError}</p>
          )}

          <button
            disabled={!phone || loading}
            onClick={updatePhone}
            className="btn-primary w-100"
          >
            {!loading ? (
              "Continue"
            ) : (
              <ThreeDots height="25" width="60" color="white" />
            )}
          </button>
        </form>
      </div>

      <LoginSlider />
    </div>
  );
};

export default Onboarding;

