import axios from "axios";
import  { lazy, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import LoginIcon from "@mui/icons-material/Login";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import InputField from "../../../Components/InputField/InputField";
import CountdownTimer from "../../../Components/CountdownTimer/CountdownTimer";
import star from "./img/Stars.webp";
import "../SignUp/SignUp.scss";
import "./MetaSignup.scss";
import {SuprSend} from '@suprsend/web-sdk';


const suprSendKey = process.env.REACT_APP_SUPRSEND_PUBLIC_KEY;
const suprSendVapid = process.env.REACT_APP_SUPRSEND_VAPID_KEY;
const suprSendClient = suprSendKey
  ? new SuprSend(suprSendKey, {
      vapidKey: suprSendVapid,
      swFileName: "/firebase-messaging-sw.js",
    })
  : null;




const EmailVerification = lazy(() =>
  import("../EmailVerification/EmailVerification")
);
const DigitalBusinessCard = lazy(() =>
  import("../../DigitalBusinessCard/DigitalBusinessCard2")
);

function MetaSignup() {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  let local_signup_info = JSON.parse(
    sessionStorage.getItem("local_signup_info")
  );
  const [showOTP, setShowOTP] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email_exists, setEmail_exists] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  let access_token = "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    setShowOTP(false);
  };

  useEffect(() => {
    if (local_signup_info !== null && formData.name === "") {
      setFormData({
        ...formData,
        name: local_signup_info.name,
        email: local_signup_info.email,
        password: local_signup_info.password,
      });
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");
    if (authorizationCode) {
      userinfo(authorizationCode);
    } else {
      const error = params.get("error");
      if (error) {
        alert("Google login failed. Please try again.");
      }
    }

  }, []);

  useEffect(() => {
    sessionStorage.removeItem("referral_host_advisor");
    if (params.signup_url !== undefined) {
      advisor_by_referralcode();
    }
  }, [params.signup_url]);

  useEffect(() => {
    scheduled_delete();
    if (params.signup_url === undefined) {
      sessionStorage.removeItem("signup_start_url");
    } else {
      sessionStorage.setItem("signup_start_url", params.signup_url);
    }
  }, []);

  const advisor_by_referralcode = () => {
    const url = "api/refer/user_by_referralcode/";
    axios
      .post(url, { code: params.signup_url })
      .then((res) => {
        sessionStorage.setItem("referral_host_advisor", res.data.user_id);
      })
      .catch((err) => {
        sessionStorage.removeItem("referral_host_advisor");
        console.log("advisor_by_referralcode err", err);
      });
  };

  const client_id = process.env.REACT_APP_CALENDAR_CLIENT_ID;
  const REDIRECT_URL = axios.defaults.baseURL + "/login";
  
  const scope = "openid profile email";
  const GoogleSignup = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
      REDIRECT_URL
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=login`;
    window.location.href = url;
  };

  const userinfo = (authorizationCode) => {
    setLoadingGoogle(true);
    axios
      .post("api/user/google_login/", {
        code: authorizationCode,
        redirect_uri: REDIRECT_URL,
      })
      .then((res) => {
        const payload = {
          name: res.data.name,
          email: res.data.email,
          password: res.data.id,
          username: res.data.id,
          profile_picture: res.data.picture ? res.data.picture.replace("s96-c", "s600-c") : "",
          is_advisor: true,
          phone: "",
        };
        submit_check_email(res.data.email, payload);
      })
      .catch((err) => {
        console.log("err", err);
        setLoadingGoogle(false);
      });
  };

  const check_email = (email) => {
    const url = "/api/user/email_check/";
    const payload = {
      email: email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setErrorMsg("");
        setEmail_exists(res.data.email_exists);
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
      });
  };

  const scheduled_delete = () => {
    const url = "/api/user/scheduled_delete/";
    axios
      .post(url)
      .then((res) => {
        console.log("res", res.data);
      })
      .catch((err) => {
        console.log("err", err.response.data.message);
      });
  };

  const submit_check_email = (email, google) => {
    if (!google) {
      setLoading(true);
    }
    const url = "/api/user/email_check/";
    const payload = {
      email: email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        if (res.data.email_exists !== true) {
          setEmail_exists(res.data.email_exists);
          sessionStorage.setItem("local_signup_info", JSON.stringify(formData));
          if (google) {
            sessionStorage.setItem("isGoogleSignup", true);
            sessionStorage.setItem("signup_data", JSON.stringify(google));
            navigate("/signup/checkout", {
              state: { isMetaSignup: true },
            });
          } else {
            setShowOTP(true);
            sessionStorage.setItem("isGoogleSignup", false);
            sessionStorage.setItem("signup_data", JSON.stringify(formData));
          }
        } else if (isGoogleSignup) {
          setLoadingGoogle(false);
          handelGoogleLogin();
        } else {
          setEmail_exists(res.data.email_exists);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        setErrorMsg(err.response.data.message);
      });
  };

  const handelGoogleLogin = () => {
    setLoadingGoogle(true);
    const url = "api/user/google_login/";
    const payload = {
      access_token: access_token,
    };
    axios
      .post(url, payload)
      .then((res) => {
        handleLoginNavigate(res.data);
        setLoadingGoogle(false);
        setErrorMsg("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
        setLoadingGoogle(false);
      });
  };

  const handleLoginNavigate = (data) => {
    localStorage.setItem("jwt", data.jwt);
    
    // Normalize package IDs to match internal system expectations
    let normalizedPackage = data.package;
    if (data.package === 1) normalizedPackage = 4;
    if (data.package === 2) normalizedPackage = 5;
    if (data.package === 3) normalizedPackage = 6;

    localStorage.setItem(
      "user_info",
      `{
        "name": "${data.name}",
        "user_id": "${data.id}",
        "email": "${data.email}", 
        "phone": "${data.phone}",
        "username": "${data.username}",
        "app_password": "${data.app_password}",
        "is_superuser": ${data.is_superuser},
        "is_team_admin": ${data.is_team_admin},
        "package": "${normalizedPackage}",
        "meet_link" : "${data.meet_link}",
        "suprsend_token": "${data.suprsend_token}"
        }`
    );
    localStorage.setItem("app_password", data.app_password);
    
    if (
      (data.jwt !== null && normalizedPackage === 4) ||
      normalizedPackage === 5 ||
      normalizedPackage === 6
    ) {
      window.location.replace("/card");
    } else {
      alert("Something wrong with this account");
      setLoading(false);
    }

    //     suprSendClient.identify(data.id, data.suprsend_token,
//       // { refreshUserToken: (oldUserToken, tokenPayload) => Promise<string> }
// );
const distinctId = data.id.toString();
  const userToken = data.suprsend_token;  // backend must send this

  suprSendClient.identify(distinctId, userToken)
    .then(() => {
      const perm = suprSendClient.webpush.notificationPermission();
    if (perm === "default") {
      // permission not decided — ask user
      Notification.requestPermission().then(result => {
        if (result === "granted") {
          suprSendClient.webpush.registerPush()
            .then(resp => console.log("Push registered:", resp))
            .catch(err => console.error("Push register failed", err));
        } else {
          console.log("User denied notifications");
        }
      });
    } else if (perm === "granted") {
      // Already granted — register push directly (or skip if already registered)
      suprSendClient.webpush.registerPush()
        .then(resp => console.log("Push registered:", resp))
        .catch(err => console.error("Push register failed", err));
    } else {
      // perm === "denied" — browser blocked notifications
      console.log("Notifications permission denied");
    }
  })
  .catch(err => console.error("SuprSend identify failed", err));
  };

  const btnDisabled =
    formData.name === "" ||
    formData.email === "" ||
    email_exists ||
    formData.password === "";

  return (
    <>
      <div className="signup_con meta_signup_con">
        <div className="meta_signup_con_wrapper">
          <div className="meta_signup_header_timer meta_signup_header_timer2">
            <p className="timer_desc timer_desc_pc">
              50% Off for a Limited Time — Act Now!
            </p>
            <p className="timer_desc timer_desc_mobile">50% Off - Act Now!</p>
            <CountdownTimer />
          </div>
          <div className="meta_signup_header_logo">
            <div className="meta_signup_header_logo_con">
              <img
                src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1_png_DSjkWEw.webp"
                alt="NSG"
              />
              <button
                onClick={() => {
                  $("#name_input").focus();
                }}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="meta_signup_header">
            <h1>
              Digital Business Card{" "}
              <span>
                with
                <br /> Built-in CRM!{" "}
              </span>
            </h1>
            <p>
              Turns Leads Into Opportunities. Create your account with 7-Day  Trial and Avail 50%<br/> Off on Yearly Plan Now
            </p>
            <div className="nfc_card_bottom_rating">
              <img src={star} alt="start45" loading="lazy" />
              <span>| Trusted by 1500+ professionals </span>
            </div>
          </div>
          <div className="meta_signup_wrapper">
            <div className="signup_con_left">
              <div className="signup_con_left_wrapper">
                {showOTP ? (
                  <>
                    <EmailVerification
                      handleBack={handleBack}
                      formData={formData}
                      isMetaSignup={true}
                    />
                  </>
                ) : (
                  <>
                    <InputField
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      label="Full Name*"
                      type="text"
                      className="login_input"
                      id="name_input"
                    />
                    <InputField
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      label="Enter Email Address*"
                      type="email"
                      className={
                        "login_input " + (email_exists ? "error_border" : "")
                      }
                      onBlur={(e) => {
                        check_email(e.target.value);
                      }}
                      autoComplete="off"
                    />
                    {email_exists && (
                      <p
                        className="error_text w-100 mb-2"
                        style={{ marginTop: -10 }}
                      >
                        Account with this email already exists
                      </p>
                    )}
                    <div className="signup_input_con">
                      <InputField
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        label="Create a password*"
                        type={showPassword ? "text" : "password"}
                        className="login_input"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                      >
                        {showPassword ? (
                          <RemoveRedEyeRoundedIcon />
                        ) : (
                          <VisibilityOffRoundedIcon />
                        )}
                      </button>
                    </div>
                    {errorMsg && (
                      <p
                        style={{ marginTop: "-10px" }}
                        className="error_text w-100 mb-3"
                      >
                        {errorMsg}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        submit_check_email(formData.email);
                        setIsGoogleSignup(false);
                      }}
                      
                      className="cta-btn"
                      style={{
                        borderRadius: 16,
                        width: "100%",
                        height: 48,
                        marginTop: 16,
                      }}
                      disabled={btnDisabled}
                    >
                      {!loading ? (
                        <>
                          Start Your 7-days Trial{" "}
                          <LoginIcon className="icon" fontSize="medium" />
                        </>
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
                   
                    <p style={{ marginTop: 40 }} className="login_left_term">
                      By continuing you are agreeing to the{" "}
                      <button
                        onClick={() =>
                          window.open("/terms-of-service")
                        }
                      >
                        Terms & Conditions
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="signup_con_right">
              <video
                className="smart_card_video"
                
                loop
                
                playsInline
                controls={true}
                poster="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1321316wf176_png.webp"
              >
                <source src="video/SmartCard.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>
                Turn every connection into a growth opportunity—capture,
                nurture,
                <br />
                and convert organic leads effortlessly with NSG.
              </p>
            </div>
          </div>
        </div>
      </div>
      <DigitalBusinessCard isSecondary={true} Meta1={true} />
    </>
  );
}

export default MetaSignup;
