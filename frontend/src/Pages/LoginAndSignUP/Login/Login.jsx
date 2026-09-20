import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LoginIcon from "@mui/icons-material/Login";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../../Components/LoginSlider/LoginSlider";
import InputField from "../../../Components/InputField/InputField";
import "./Login.scss";

const googleLogo =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/google_png_18nV7xw.webp";

function Login() {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(isMobile ? false : true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");
    if (authorizationCode) {
      handelGoogleLogin(authorizationCode);
    } else {
      const error = params.get("error");
      if (error) {
        alert("Google login failed. Please try again.");
      }
    }
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const client_id =process.env.REACT_APP_CALENDAR_CLIENT_ID;;

  const REDIRECT_URL = axios.defaults.baseURL + "/login";
  const scope = "openid profile email";
  const login = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
      REDIRECT_URL
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=login`;
    window.location.href = url;
  };
  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });
  };

  const handleLoginNavigate = (data) => {
    localStorage.setItem("jwt", data.jwt);
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
        "package": "${data.package}",
        "meet_link" : "${data.meet_link}",
        "google_meet": ${data.google_meet}
        }`
    );
    localStorage.setItem("app_password", data.app_password);
    if (
      (data.jwt !== null && data.package === 4) ||
      data.package === 5 ||
      data.package === 6
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
  };

  const handelLogin = () => {
    setLoading(true);
    const url = "/api/user/login/";
    axios
      .post(url, formData)
      .then((res) => {
        handleLoginNavigate(res.data);
        setError("");
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
          setError(err.response.data.message);
        }
      });
  };

  const handelGoogleLogin = (authorizationCode) => {
    setLoadingGoogle(true);
    const url = "api/user/google_login/";
    const payload = {
      code: authorizationCode,
      redirect_uri: REDIRECT_URL,
    };
    axios
      .post(url, payload)
      .then((res) => {
        handleLoginNavigate(res.data);
        setLoadingGoogle(false);
        setError("");
      })
      .catch((err) => {
        console.log(err.response.data.access_token);
        const access_token = err.response.data.access_token;
        setLoadingGoogle(false);
        userinfo(access_token);
      });
  };

  const userinfo = (access_token) => {
    setLoadingGoogle(true);
    const url = "api/user/google_proxy/";
    const payload = {
      access_token: access_token,
    };
    axios
      .post(url, payload)
      .then((res) => {
        const payload = {
          name: res.data.name,
          email: res.data.email,
          password: res.data.id,
          username: res.data.id,
          profile_picture: res.data.picture.replace("s96-c", "s600-c"),
          is_advisor: true,
          phone: "",
        };
        sessionStorage.setItem("signup_data", JSON.stringify(payload));
        sessionStorage.setItem("isGoogleSignup", true);
        navigate("/signup/pricing");
      })
      .catch(() => setLoadingGoogle(false));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handelLogin();
    }
  };

  return (
    <div className="login_con">
      <div className="login_con_left">
        <div className="login_con_left_wrapper">
          <div
            className={"login_con_left_header " + (showInput ? "" : "d-none")}
          >
            <HeaderLogin title="Login to get started" Redirect={true} />
          </div>
          {isMobile && showInput && (
            <button onClick={() => setShowInput(false)} className="backButton">
              <ArrowBackIcon /> Back
            </button>
          )}
          {showInput ? (
            <>
              <InputField
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Enter your Email ID*"
                type="email"
                className={"login_input " + (error ? "error_border" : "")}
              />
              <div className="login_input_con">
                <InputField
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  label="Enter password*"
                  type={showPassword ? "text" : "password"}
                  className={"login_input " + (error ? "error_border" : "")}
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
              {error && <span className="error_text">{error}</span>}
              <button
                type="submit"
                className="gray_btn"
                disabled={formData.email === "" || formData.password === ""}
                onClick={(e) => {
                  e.preventDefault();
                  if (formData.email === "") {
                    alert("Please enter your email id");
                  } else if (formData.password === "") {
                    alert("Please enter your password");
                  } else {
                    handelLogin();
                  }
                }}
              >
                {!loading ? (
                  <>
                    Login <LoginIcon className="icon" fontSize="medium" />
                  </>
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    radius="9"
                    color="black"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                )}
              </button>
              <button
                onClick={() => navigate("/forgot-password")}
                className="forgot_pass_btn"
              >
                Forgot Password?
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (isMobile) {
                  setShowInput(true);
                }
              }}
              className="gray_btn"
            >
              <MailOutlineIcon className="icon" fontSize="medium" /> Login with
              Email ID
            </button>
          )}

          <span className="or_divider">
            <span className="line"></span>OR
            <span className="line"></span>
          </span>
          {isMobile ? (
            !showInput && (
              <button onClick={login} className="google-login-btn">
                {!loadingGoogle ? (
                  <>
                    <LazyLoadImage
                      alt="google"
                      effect="blur"
                      src={googleLogo}
                      wrapperClassName="google-login-btn-img"
                    />
                    Continue with Google
                  </>
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    radius="9"
                    color="white"
                    visible={true}
                  />
                )}
              </button>
            )
          ) : (
            <button onClick={login} className="google-login-btn">
              {!loadingGoogle ? (
                <>
                  <LazyLoadImage
                    alt="google"
                    effect="blur"
                    src={googleLogo}
                    wrapperClassName="google-login-btn-img"
                  />
                  Continue with Google
                </>
              ) : (
                <ThreeDots
                  height="25"
                  width="60"
                  radius="9"
                  color="white"
                  visible={true}
                />
              )}
            </button>
          )}

          <span className="login_left_account">Do not have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="login_left_signup"
          >
            Sign up
          </button>
          <p className="login_left_term">
            By continuing you are agreeing to the
            <button onClick={() => window.open("/privacy")}>
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
      {isMobile ? (
        !showInput && <LoginSlider title="Login to get started" />
      ) : (
        <LoginSlider title="Login to get started" />
      )}
    </div>
  );
}

export default Login;
