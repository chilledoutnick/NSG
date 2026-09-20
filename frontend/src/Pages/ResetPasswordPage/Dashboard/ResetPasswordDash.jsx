import axios from "axios";
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BottomBar from "../../../Components/CardProfileBottomBar/BottomBar";
import "./ResetPasswordDash.scss";

function ResetPasswordDash() {
  const navigate = useNavigate();
  const [isOTP, setIsOTP] = useState(true);
  const [isOTPsent, setIsOTPsent] = useState(false);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showPasswordTop, setShowPasswordTop] = useState(false);
  const [showPasswordBtm, setShowPasswordBtm] = useState(false);

  const [formData, setFormData] = useState({
    final_pass: "",
    password: "",
    password_confirmation: "",
  });
  const user_info = JSON.parse(localStorage.getItem("user_info"));

  useEffect(() => {
    sendOtp();
  }, []);

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });

    if (formData.password === formData.password_confirmation) {
      setFormData({
        ...formData,
        final_pass: formData.password,
      });
    } else {
      setFormData({
        ...formData,
        final_pass: "",
      });
    }
  };

  const sendOtp = () => {
    const url = "/api/user/send_otp_to_email/";
    const payload = {
      email: user_info.email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setError("");
      })
      .catch((err) => {
        setError(err.response.data.message);
      });
  };

  const verify_otp = () => {
    setLoading(true);
    const url = "api/user/verify_otp/";
    const payload = {
      email: user_info.email,
      otp: otp,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setIsOTP(false);
        setLoading(false);
        setError("");
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    setLoading(true);
    const url = "/api/user/update_password/";
    const payload = {
      email: user_info.email,
      otp: otp,
      password: formData.final_pass,
    };
    axios
      .post(url, payload)
      .then((res) => {
        navigate(-1);
        setError("");
        setLoading(false);
        swal({
          text: "Password Reset Successful.",
          icon: "success",
        });
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  return (
    <div className="reset_pass_dash">
      {isOTP ? (
        <div className="otp-con">
          <button onClick={() => navigate(-1)} className="back_btn back_btn2">
            <ArrowBackIcon fontSize="small" /> Back
          </button>
          <h3>Enter OTP</h3>
          <span>
            A 4-digit code has been sent to your email address "
            {user_info.email}".
          </span>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className={"send_otp "+(isOTPsent ? "send_otp_active" : "")}
            onClick={() => {
              sendOtp();
              setIsOTPsent(true);
              setTimeout(() => {
                setIsOTPsent(false);
              }, [3000]);
            }}
          >
            {isOTPsent ? "OTP sent!" : "Resend OTP"}
          </button>
          <button
            className={
              "submit_btn " + (otp !== "" ? "cta-btn" : "btn-disabled")
            }
            onClick={() => {
              verify_otp();
            }}
          >
            {!loading ? (
              "Continue"
            ) : (
              <ThreeDots
                height="25"
                width="60"
                radius="9"
                color="white"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
              />
            )}
          </button>
          {error ? <p className="error mt-3">{error}</p> : ""}
        </div>
      ) : (
        <div className="forgot-pass-con">
          <h3 className="reset-pass-header">
            <button className="back_btn" onClick={() => setIsOTP(true)}>
              <ChevronLeftIcon fontSize="large" />
            </button>
            Reset Password
          </h3>
          <div className="reset-password-con">
            <input
              name="password"
              type={!showPasswordTop ? "password" : "text"}
              className="forgot-pass-input mb-0"
              placeholder="New password"
              onChange={handleChange}
            />
            <button onClick={() => setShowPasswordTop(!showPasswordTop)}>
              {showPasswordTop ? (
                <VisibilityOffRoundedIcon />
              ) : (
                <RemoveRedEyeRoundedIcon />
              )}
            </button>
          </div>

          <div className="reset-password-con mt-3">
            <input
              type={!showPasswordBtm ? "password" : "text"}
              name="password_confirmation"
              className="forgot-pass-input "
              placeholder="Confirm new password"
              onChange={handleChange}
            />
            <button onClick={() => setShowPasswordBtm(!showPasswordBtm)}>
              {showPasswordBtm ? (
                <VisibilityOffRoundedIcon />
              ) : (
                <RemoveRedEyeRoundedIcon />
              )}
            </button>
          </div>

          {error ? <p className="error">{error}</p> : ""}

          {formData.password_confirmation ? (
            formData.password_confirmation !== formData.password ? (
              <p className="error">Password didn't match</p>
            ) : (
              ""
            )
          ) : (
            ""
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{ width: 350, marginTop: 30 }}
            className={
              "forgot-pass-btn " +
              (formData.password !== "" ? "cta-btn" : "btn-disabled")
            }
          >
            {!loading ? (
              "Continue"
            ) : (
              <ThreeDots
                height="25"
                width="60"
                radius="9"
                color="white"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
              />
            )}
          </button>
        </div>
      )}
      <BottomBar />
    </div>
  );
}

export default ResetPasswordDash;
