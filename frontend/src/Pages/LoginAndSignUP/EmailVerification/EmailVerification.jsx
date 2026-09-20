import axios from "axios";
import  { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./EmailVerification.scss";

const EmailVerification = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", ""]);
  const [NewOtp, setNewOtp] = useState(false);
  const signup_start_url = sessionStorage.getItem("signup_start_url");

  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value;
    setCode(newCode);

    if (e.target.value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (pastedData.length === 4) {
      const newCode = pastedData.split("");
      setCode(newCode);
      newCode.forEach((value, index) => {
        inputRefs.current[index].value = value;
      });
      inputRefs.current[3].focus();
    }
    e.preventDefault(); 
  };

  useEffect(() => {
    if (!props.isForgot) {
      send_otp_to_email();
    }
  }, []);

  const send_otp_to_email = () => {
    const url = "/api/user/send_email_otp/";
    const payload = {
      name: props.formData.name,
      email: props.formData.email,
    };
    axios
      .post(url, payload)
      .then(() => {
        console.log("OTP sent!");
      })
      .catch((err) => {
        setError(err.response.data.message);
      });
  };

  const handleSubmit = () => {
    setLoading(true);
    setNewOtp(false);
    setError("");
    const url = "api/user/verify_email_otp/";
    const payload = {
      email: props.formData.email,
      otp: code.join(""),
    };
    axios
      .post(url, payload)
      .then(async () => {
        setLoading(false);

 try {
      await axios.post("/api/package/user_package/", {
        email: props.formData.email,
      });
    } catch (e) {
      console.log("user_package mapping failed (safe to ignore)");
    }

        
        let starter_annual = "starter-annual";
        let starter_quarterly = "starter-quarterly";
        let pro_annual = "pro-annual";
        let pro_quarterly = "pro-quarterly";
        if (signup_start_url === starter_annual) {
          sessionStorage.setItem("signup_start_url", starter_annual);
          navigate("/signup/checkout#" + starter_annual);
        } else if (signup_start_url === starter_quarterly) {
          sessionStorage.setItem("signup_start_url", starter_quarterly);
          navigate("/signup/checkout#" + starter_quarterly);
        } else if (signup_start_url === pro_annual) {
          sessionStorage.setItem("signup_start_url", pro_annual);
          navigate("/signup/checkout#" + pro_annual);
        } else if (signup_start_url === pro_quarterly) {
          sessionStorage.setItem("signup_start_url", pro_quarterly);
          navigate("/signup/checkout#" + pro_quarterly);
        } else if (signup_start_url === "free" || signup_start_url === "card" || signup_start_url ==="metal" ) {
          navigate("/signup/domain");
        } else if (signup_start_url === "redeem") {
          navigate("/signup/promo");
        } else if (props.isMetaSignup) {
          navigate("/signup/checkout", {
            state: { isMetaSignup: props.isMetaSignup },
          });
        } else if (props.isMetaSignup2) {
          navigate("/signup/checkout", {
            state: {
              isMetaSignup2: props.isMetaSignup2,
              meta_coupon: "50OFFNSG",
            },
          });
        } else if (props.isQuarterly) {
          navigate("/signup/checkout", {
            state: { isQuarterly: true },
          });
        } else if (props.isLifetime) {
          navigate("/signup/checkout", {
            state: { isLifetime: true },
          });
        } else {
          navigate("/signup/pricing");
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response.data.message);
      });
  };

  const verify_otp = () => {
    setLoading(true);
    const url = "api/user/verify_otp/";
    const payload = {
      email: props.formData.email,
      otp: code.join(""),
    };
    axios
      .post(url, payload)
      .then((res) => {
        navigate("/reset-password", {
          state: {
            email: props.formData.email,
            otp: code.join(""),
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
    <div className="email_verification_container">
      <button onClick={props.handleBack} className="backButton">
        <ArrowBackIcon /> Back
      </button>
      <h2>
        Enter 4 digit verification code sent to your Email ID:{" "}
        {props.formData.email}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (props.isForgot) {
            verify_otp();
          } else {
            handleSubmit();
          }
        }}
      >
        <div className="inputContainer">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`codeInput-${index}`}
              type="number"
              maxLength="1"
              value={digit}
              onChange={(e) => {
                handleChange(e, index);
                setNewOtp(false);
                setError("");
              }}
              onPaste={handlePaste} 
              className={"inputBox " + (error ? "error_border" : "")}
              ref={(el) => (inputRefs.current[index] = el)} // Assign the ref
            />
          ))}
        </div>
        {error && <p className="error_otp">{error}</p>}
        {NewOtp && <p className="sent_otp">A new code has been sent!</p>}
        <div className="linkContainer">
          <p>
            Did not receive verification code?{" "}
            <button
              type="button"
              onClick={() => {
                setNewOtp(true);
                send_otp_to_email();
                setError("");
              }}
            >
              Resend code
            </button>
          </p>
        </div>
        <button type="submit" className="cta-btn">
          {!loading ? (
            "Submit"
          ) : (
            <ThreeDots
              height="25"
              width="60"
              color="black"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
