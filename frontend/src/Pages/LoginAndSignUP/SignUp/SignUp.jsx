import axios from "axios";
import { lazy, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../../Components/LoginSlider/LoginSlider";
import InputField from "../../../Components/InputField/InputField";
import "./SignUp.scss";

import { SuprSend } from "@suprsend/web-sdk";

const suprSendKey = process.env.REACT_APP_SUPRSEND_PUBLIC_KEY;
const suprSendVapid = process.env.REACT_APP_SUPRSEND_VAPID_KEY;
const suprSendClient = suprSendKey
  ? new SuprSend(suprSendKey, {
      vapidKey: suprSendVapid,
      swFileName: "/firebase-messaging-sw.js",
    })
  : null;


const EmailVerification = lazy(
  () => import("../EmailVerification/EmailVerification"),
);
const googleLogo =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/google_png_18nV7xw.webp";
const placeholderSrc =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/web_development___website_webpage_browser_ad_advertisement_man_people_mljidi_png.webp";

function SignUp() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromStripe = sessionStorage.getItem("signup_email") || "";
  const emailFromState = location.state?.email || emailFromStripe || "";
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const isMetalSignup = params.signup_url === "metal";

  let local_signup_info = JSON.parse(
    sessionStorage.getItem("local_signup_info"),
  );
  const session_signup_url = sessionStorage.getItem("signup_start_url");
  let isMetaSignup2 = params.signup_url === "metasignup";
  let isQuarterly = params.signup_url === "quarterly";
  let isLifetime = params.signup_url === "lifetime";
  let isredeem = params.signup_url === "redeem" || session_signup_url === "redeem";
  let signup_url = "";
  let access_token = "";
  const [showOTP, setShowOTP] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [expendInput, setExpendInput] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [email_exists, setEmail_exists] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: emailFromState,
    password: "",
    confirmPassword: "",
  });

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
    if (!isMetalSignup) return;

    const order = JSON.parse(localStorage.getItem("order")) || {};
    if (order.customer_email) {
      setFormData((prev) => ({
        ...prev,
        email: order.customer_email,
      }));
      setShowInput(true);
    }
  }, [isMetalSignup]);

  useEffect(() => {
    if (isMetalSignup) {
      setShowInput(true); // 🔥 direct email/password page
    }
  }, [isMetalSignup]);

  useEffect(() => {
    if (local_signup_info !== null && formData.name === "") {
      setFormData({
        ...formData,
        name: local_signup_info.name,
        email: local_signup_info.email,
        password: local_signup_info.password,
        confirmPassword: local_signup_info.confirmPassword,
      });
    }
  }, []);

  useEffect(() => {
    if (emailFromState) {
      setFormData((prev) => ({ ...prev, email: emailFromState }));
      setShowInput(true);
    }
  }, [emailFromState]);

  useEffect(() => {
    sessionStorage.removeItem("referral_host_advisor");
    if (params.signup_url !== undefined) {
      advisor_by_referralcode();
    }
  }, [params.signup_url]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const email = searchParams.get("email") || hashParams.get("email");
    const name = searchParams.get("name") || hashParams.get("name");
    const coupon = searchParams.get("coupon") || hashParams.get("coupon");
    const promo_code = searchParams.get("promo_code") || hashParams.get("promo_code");

    if (email) {
      setFormData(prev => ({
        ...prev,
        email: email,
        name: name || prev.name,
      }));
    }

    if (coupon) {
      sessionStorage.setItem("url_coupon", coupon);
    } else {
      sessionStorage.removeItem("url_coupon");
    }

    if (promo_code) {
      sessionStorage.setItem("promo_code", promo_code);
      // If code is detected, ensure we mark the flow as redemption flow
      if (!params.signup_url || params.signup_url === "redeem") {
        sessionStorage.setItem("signup_start_url", "redeem");
      }
    } else if (!isredeem) {
      // Only remove if we aren't in a redemption flow (to support redirects)
      sessionStorage.removeItem("promo_code");
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
  const REDIRECT_URL = axios.defaults.baseURL + "/signup";
  const scope = "openid profile email";
  const google_url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
    REDIRECT_URL,
  )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${
    params.signup_url || (isredeem ? "redeem" : "")
  }`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");
    signup_url = params.get("state");
    if (authorizationCode) {
      userinfo(authorizationCode);
    } else {
      const error = params.get("error");
      if (error) {
        alert("Google login failed. Please try again.");
      }
    }

    scheduled_delete();
    if (params.signup_url === undefined && session_signup_url !== "redeem") {
      sessionStorage.removeItem("signup_start_url");
    } else if (params.signup_url !== undefined) {
      sessionStorage.setItem("signup_start_url", params.signup_url);
    }
  }, []);

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
        console.log("err", err.response?.data || err.message);
        setLoadingGoogle(false);
      });
  };

  const check_email = (email, checkExist) => {
    if (checkExist) {
      setLoading(true);
    }
    const url = "/api/user/email_check/";
    const payload = {
      email: email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setErrorMsg("");
        if (checkExist) {
          if (res.data.email_exists) {
            handelLogin();
          } else {
            setExpendInput(true);
            setLoading(false);
          }
        } else {
          setEmail_exists(res.data.email_exists);
        }
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
          let starter_quarterly = "starter-quarterly";
          let starter_annual = "starter-annual";
          let pro_annual = "pro-annual";
          let pro_quarterly = "pro-quarterly";
          setEmail_exists(res.data.email_exists);
          sessionStorage.setItem("local_signup_info", JSON.stringify(formData));
          if (google) {
            sessionStorage.setItem("isGoogleSignup", true);
            sessionStorage.setItem("signup_data", JSON.stringify(google));
            console.log("signup_url", signup_url);
            if (signup_url === starter_annual) {
              sessionStorage.setItem("signup_start_url", starter_annual);
              navigate("/signup/checkout#" + starter_annual);
            } else if (signup_url === starter_quarterly) {
              sessionStorage.setItem("signup_start_url", starter_quarterly);
              navigate("/signup/checkout#" + starter_quarterly);
            } else if (signup_url === pro_annual) {
              sessionStorage.setItem("signup_start_url", pro_annual);
              navigate("/signup/checkout#" + pro_annual);
            } else if (signup_url === pro_quarterly) {
              sessionStorage.setItem("signup_start_url", pro_quarterly);
              navigate("/signup/checkout#" + pro_quarterly);
            } else if (signup_url === "metasignup") {
              navigate("/signup/checkout#metasignup");
            } else if (signup_url === "free") {
              navigate("/signup/domain");
            } else if (signup_url === "lifetime") {
              sessionStorage.setItem("meta_plan", "lifetime");
              navigate("/signup/checkout");
            } else if (signup_url === "quarterly") {
              navigate("/signup/checkout", {
                state: {
                  isQuarterly: true,
                },
              });
            } else if (signup_url === "redeem") {
              navigate("/signup/promo");
            } else {
              navigate("/signup/pricing");
            }
          } else {
            setShowOTP(true);
            sessionStorage.setItem("isGoogleSignup", false);
            sessionStorage.setItem("signup_data", JSON.stringify(formData));
            sessionStorage.setItem("signup_start_url", isredeem ? "redeem" : params.signup_url);

            if (isredeem) {
              const urlPromoCode = new URLSearchParams(window.location.search).get("promo_code");
              if (urlPromoCode) sessionStorage.setItem("promo_code", urlPromoCode);
            }
          }
        } else if (google) {
          setLoadingGoogle(false);
          handelGoogleLogin(google);
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

  const handelGoogleLogin = (google) => {
    setLoadingGoogle(true);
    const url = "api/user/google_login/";
    const payload = {
      access_token: google.access_token,
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
    // ✅ PACKAGE ID NORMALIZATION (FINAL FIX)
    let normalizedPackage = data.package;

    if (data.package === 1) normalizedPackage = 4;
    if (data.package === 2) normalizedPackage = 5;
    if (data.package === 3) normalizedPackage = 6;

    localStorage.setItem(
      "user_info",
      `{
        "name": "${data.name}",
        "email": "${data.email}", 
        "user_id": "${data.id}",
        "phone": "${data.phone}",
        "username": "${data.username}",
        "app_password": "${data.app_password}",
        "is_superuser": ${data.is_superuser},
        "is_team_admin": ${data.is_team_admin},
    "package": "${normalizedPackage}",

        "meet_link" : "${data.meet_link}",
        "suprsend_token": "${data.suprsend_token}",
        "signup_url": "${data.signup_url}",
        "promo_code": "${data.promo_code || ""}"
        }`,
    );
    localStorage.setItem("app_password", data.app_password);

    if (
      (data.jwt !== null && normalizedPackage === 4) ||
      normalizedPackage === 5 ||
      normalizedPackage === 6
    ) {
      // 🔁 POST LOGIN REDIRECT LOGIC
      const redirectTo = localStorage.getItem("post_login_redirect");

      if (redirectTo) {
        localStorage.removeItem("post_login_redirect");
        window.location.href = redirectTo; // full reload = safe for deep links
      } else {
        window.location.href = "/card";
      }
    } else {
      alert("Something wrong with this account");
      setLoading(false);
    }
    //     suprSendClient.identify(data.id, data.suprsend_token,
    //       // { refreshUserToken: (oldUserToken, tokenPayload) => Promise<string> }
    // );
    const distinctId = data.id.toString();
    const userToken = data.suprsend_token; // backend must send this

    suprSendClient
      .identify(distinctId, userToken)
      .then(() => {
        const perm = suprSendClient.webpush.notificationPermission();
        if (perm === "default") {
          // permission not decided — ask user
          Notification.requestPermission().then((result) => {
            if (result === "granted") {
              suprSendClient.webpush
                .registerPush()
                .then((resp) => console.log("Push registered:", resp))
                .catch((err) => console.error("Push register failed", err));
            } else {
              console.log("User denied notifications");
            }
          });
        } else if (perm === "granted") {
          // Already granted — register push directly (or skip if already registered)
          suprSendClient.webpush
            .registerPush()
            .then((resp) => console.log("Push registered:", resp))
            .catch((err) => console.error("Push register failed", err));
        } else {
          // perm === "denied" — browser blocked notifications
          console.log("Notifications permission denied");
        }
      })
      .catch((err) => console.error("SuprSend identify failed", err));
  };

  const btnDisabled =
    formData.name === "" ||
    formData.email === "" ||
    email_exists ||
    formData.password === "" ||
    formData.password !== formData.confirmPassword;

  const btnDisabledLogin = formData.email === "" || formData.password === "";

  const handelLogin = () => {
    setLoading(true);
    const url = "/api/user/login/";
    axios
      .post(url, formData)
      .then((res) => {
        handleLoginNavigate(res.data);
        setErrorMsg("");
      })
      .catch((err) => {
        setLoading(false);
        if (err.response.data.message === "Complete your payment to login") {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "It appears your payment has not been completed.",
            confirmButtonText: "Contact us",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/contact-sales";
            }
          });
        } else {
          setErrorMsg(err.response.data.message);
        }
      });
  };

  return (
    <>
      <div className="signup_con">
        <div className="signup_con_left">
          <div className="signup_con_left_wrapper">
            <div className="signup_con_left_header">
              <HeaderLogin
                title={
                  isMetalSignup
                    ? "Create your account"
                    : "Sign up / Login to get started"
                }
                Redirect={true}
                disableRedirect={isMetalSignup}
              />
            </div>
            {showOTP ? (
              <>
                <EmailVerification
                  handleBack={handleBack}
                  formData={formData}
                  isMetaSignup2={isMetaSignup2}
                  isQuarterly={isQuarterly}
                  isLifetime={isLifetime}
                  isredeem={isredeem}
                />
              </>
            ) : (
              <>
                {showInput ? (
                  <>
                    {!isMetalSignup && (
                      <button
                        onClick={() => setShowInput(false)}
                        className="backButton"
                      >
                        <ArrowBackIcon /> Back
                      </button>
                    )}

                    <InputField
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      label="Enter your Email ID*"
                      disabled={isMetalSignup}
                      type="email"
                      className={
                        "login_input " + (email_exists ? "error_border" : "")
                      }
                      onBlur={(e) => {
                        let value = e.target.value;
                        if (value && expendInput) {
                          check_email(value);
                        }
                      }}
                      autoComplete="off"
                    />
                    {email_exists && (
                      <p
                        className="error_text w-100 mb-2"
                        style={{ marginTop: -10 }}
                      >
                        Account with this email already exists
                      </p>
                    )}
                    <div className="signup_input_con">
                      <InputField
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        label={
                          isMetalSignup
                            ? "Create your password*"
                            : !expendInput
                              ? "Enter password*"
                              : "Create a password*"
                        }
                        type={showPassword ? "text" : "password"}
                        className="login_input"
                        onBlur={() => {
                          if (
                            expendInput &&
                            formData.password !== formData.confirmPassword
                          ) {
                            setErrorMsg("password didn't match");
                          } else {
                            setErrorMsg("");
                          }
                        }}
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
                    {expendInput && (
                      <>
                        <div className="signup_input_con">
                          <InputField
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            label="Re-enter password*"
                            type={showPassword2 ? "text" : "password"}
                            className="login_input"
                            onBlur={() => {
                              if (
                                formData.password !== formData.confirmPassword
                              ) {
                                setErrorMsg("password didn't match");
                              } else {
                                setErrorMsg("");
                              }
                            }}
                          />{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPassword2(!showPassword2);
                            }}
                          >
                            {showPassword2 ? (
                              <RemoveRedEyeRoundedIcon />
                            ) : (
                              <VisibilityOffRoundedIcon />
                            )}
                          </button>
                        </div>
                        <InputField
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          label="Enter Full Name*"
                          type="text"
                          className="login_input"
                        />
                      </>
                    )}

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
                        if (!expendInput) {
                          check_email(formData.email, true);
                        } else {
                          submit_check_email(formData.email);
                        }
                      }}
                      className="cta-btn"
                      disabled={expendInput ? btnDisabled : btnDisabledLogin}
                    >
                      {!loading ? (
                        <>
                          Next <ArrowForwardIcon className="icon" />
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
                    {!isMetalSignup && !expendInput && (
                      <Link className="forgot_btn" to="/forgot-password">
                        Forgot password?
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    {!isMetalSignup && (
                      <button
                        onClick={() => {
                          window.location.assign(google_url);
                        }}
                        className="cta-btn"
                      >
                        {!loadingGoogle ? (
                          <>
                            <LazyLoadImage
                              alt="google"
                              effect="blur"
                              src={googleLogo}
                              wrapperClassName="google-login-btn-img"
                              placeholderSrc={placeholderSrc}
                            />
                            Continue with Google
                          </>
                        ) : (
                          <ThreeDots
                            height="25"
                            width="60"
                            color="white"
                            ariaLabel="three-dots-loading"
                            visible={true}
                          />
                        )}
                      </button>
                    )}
                    <span className="or_divider">
                      <span className="line"></span>OR
                      <span className="line"></span>
                    </span>

                    <button
                      onClick={() => {
                        setExpendInput(false);
                        setShowInput(true);
                      }}
                      className="email_btn"
                    >
                      Continue with email address
                    </button>
                  </>
                )}

                <p className="login_left_term">
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
        <LoginSlider title="Sign up to get started" />
      </div>
    </>
  );
}

export default SignUp;
