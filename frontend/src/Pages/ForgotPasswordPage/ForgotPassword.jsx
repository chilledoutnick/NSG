import axios from "axios";
import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginSlider from "../../Components/LoginSlider/LoginSlider";
import EmailVerification from "../LoginAndSignUP/EmailVerification/EmailVerification";
import HeaderLogin from "../../Components/HeaderLogin/HeaderLogin";
import "./ForgotPassword.scss";

function ForgotPassword() {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState();

  const handleSubmit = () => {
    setLoading(true);
    const url = "/api/user/send_otp_to_email/";
    const payload = {
      email: email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setLoading(false);
        setShowVerification(true);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response.data.message);
      });
  };

  return (
    <div className="forgot-body-container">
      <div className="forgot_pass_wrapper">
        <div className="forgot-pass-con">
          <HeaderLogin title="Password recovery" />
          {showVerification ? (
            <EmailVerification
              formData={{ email: email }}
              handleBack={() => setShowVerification(false)}
              isForgot={true}
            />
          ) : (
            <>
              <button onClick={() => navigate(-1)} className="backButton">
                <ArrowBackIcon /> Back
              </button>
              <h1 className="forgot-pass-header">Forgot Password?</h1>
              <span className="forgot-pass-desc">
                Please enter the address associated with your account.
              </span>
              <input
                type={"email"}
                className="forgot-pass-input"
                placeholder="Enter your Email ID*"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              {error !== "" && <p className="error">{error}</p>}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (email !== "") {
                    handleSubmit();
                  } else {
                    alert("Please enter your email id");
                  }
                }}
                className={
                  "btn-primary " + (email !== "" ? "" : "btn-disabled")
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
            </>
          )}
        </div>
      </div>
      <LoginSlider />
    </div>
  );
}
export default ForgotPassword;
