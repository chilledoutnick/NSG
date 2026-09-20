import axios from "axios";
import  { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import $ from "jquery";
import { ThreeDots } from "react-loader-spinner";
import Header from "../../Components/AfterLogin/Header/Header";
import "./OTP.css";

function OTP(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [otp, setOtp] = useState();

  useEffect(() => {
    $(".otp-pass-input").keyup(function () {
      if (this.value.length === this.maxLength) {
        $(this).next(".otp-pass-input").focus();
      }
    });
  }, []);

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/user/verify_otp/";
    const payload = {
      email: location.state.email,
      otp: otp,
    };
    axios
      .post(url, payload)
      .then((res) => {
        navigate("/reset-password", {
          state: {
            email: location.state.email,
            otp: otp,
          },
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response.data.message);
      });
  };

  return (
    <div className="otp-body-container">
      <Header />
      <div className="otp-con">
        <h1 className="forgot-pass-header">Enter OTP</h1>
        <span className="forgot-pass-desc">
          An 4 digit code has been sent to your email Id associated with your
          account.
        </span>
        <div className="otp-pass-input-con">
          <input
            type={"email"}
            className="forgot-pass-input"
            placeholder="OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
          />
        </div>
        {error ? <p className="error mt-2">{error}</p> : ""}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={
            "forgot-pass-btn " + (otp !== "" ? "cta-btn" : "btn-disabled")
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
    </div>
  );
}
export default OTP;
