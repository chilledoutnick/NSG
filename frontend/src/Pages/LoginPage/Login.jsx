import axios from "axios";
import  { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import Header from "../../Components/AfterLogin/Header/Header";
import googleLogo from "./img/google.png";
import "./Login.scss";
import {SuprSend} from '@suprsend/web-sdk';


const suprSendKey = process.env.REACT_APP_SUPRSEND_PUBLIC_KEY;
const suprSendVapid = process.env.REACT_APP_SUPRSEND_VAPID_KEY;
const suprSendClient = suprSendKey
  ? new SuprSend(suprSendKey, {
      vapidKey: suprSendVapid,
      swFileName: "/firebase-messaging-sw.js",
    })
  : null;



function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const client_id = process.env.REACT_APP_CALENDAR_CLIENT_ID;
  const REDIRECT_URL =axios.defaults.baseURL+"/login";
  const scope= "openid profile email";
  const login = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&response_type=code&scope=${encodeURIComponent(scope)}&state=login`;
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
        "suprsend_token": "${data.suprsend_token}"
        }`
    );
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
      window.location.href = "/card";;
    }
    } else {
      alert("Something wrong with this account");
      setLoading(false);
} };

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
        });
    };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handelLogin();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");
    if (authorizationCode) {
      handelGoogleLogin(authorizationCode);
    }
    else{
      const error = params.get("error");
      if (error) {
        alert("Google login failed. Please try again.");
      }
    }
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="login-body-container">
      <Header />
      <div className="login-con">
        <div className="merchant-login-container">
          <div className="merchant-login-form">
            <div className="form-row form-row-title">
              <h4 className="login-header">Login</h4>
            </div>
            <form>
              <div className="form-row login-container">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
                  placeholder="you@example.com"
                />
                <label htmlFor="password">Password</label>
                <div className="password-con">
                  <input
                    name="password"
                    type={!showPassword ? "password" : "text"}
                    onChange={handleChange}
                    value={formData.password}
                    placeholder="password"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                  >
                    {!showPassword ? (
                      <RemoveRedEyeRoundedIcon />
                    ) : (
                      <VisibilityOffRoundedIcon />
                    )}
                  </button>
                </div>
              </div>
              {error !== "" && <span style={{ color: "red" }}>{error}</span>}
              <div className="form-row">
                <button
                  type="submit"
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
                  disabled={formData.email === "" || formData.password === ""}
                  className="login-btn cta-btn"
                  sx={{
                    width: "100%",
                    marginTop: "1vh",
                    backgroundColor: "black",
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
              </div>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="forgot-password-text"
              >
                Forgot Password?
              </button>
            </form>
            <div className="or-text-con-login">
              <span>OR</span>
            </div>
            <div className="login-google-con">
              <button onClick={() => login()} className="google-login-btn">
                {!loadingGoogle ? (
                  <>
                    <img
                      className="google-login-btn-img"
                      alt="google"
                      src={googleLogo}
                      loading="lazy"
                    />
                    Login with Google
                  </>
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    radius="9"
                    color="black"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
                  />
                )}
              </button>
            </div>
            <div className="forgot-password-con mb-3">
              <Link to="/signup/" className="sign-up-con">
                Don't have an account? <span>Sign Up Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
