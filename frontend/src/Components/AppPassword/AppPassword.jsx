import axios from "axios";
import { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";

import "./AppPassword.scss";

function AppPassword() {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const [app_password, setApp_password] = useState();
  const [platform, setPlatform] = useState("gmail");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [app_password_exist, setApp_password_exist] = useState(
    localStorage.getItem("app_password")
  );

  useEffect(() => {
    setApp_password(app_password_exist);
    get_app_password(app_password_exist);
  }, [app_password_exist]);

  const get_app_password = () => {
    // const url = "api/advisor/get_app_password/";
    const url = "api/user_profile/get_app_password/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setPlatform(res.data.platform);
        setApp_password(res.data.app_password);
        localStorage.setItem("app_password", res.data.app_password);
      })
      .catch((err) => console.log("err", err));
  };

  const create_app_password = () => {
    setLoading(true);
    const url = "api/user_profile/create_app_password/";
    // const url = "api/advisor/create_app_password/";
    const payload = {
      app_password: app_password,
      platform: platform,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setPlatform(res.data.platform);
        setApp_password(res.data.app_password);
        localStorage.setItem("app_password", res.data.app_password);
        setLoading(false);
        setErrorMsg("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
        setLoading(false);
      });
  };

  return (
    <div className="email-integration-con">
      <h4>App Password</h4>
      <div>
        <label htmlFor="Password">Enter Your Email Integration Password</label>
        <div className="app-password-con">
          <input
            onChange={(e) => setApp_password(e.target.value)}
            placeholder="Password"
            value={app_password || ""}
            className="app-password-input"
            type={!showPassword ? "password" : "text"}
          />
          <button onClick={() => setShowPassword(!showPassword)}>
            {!showPassword ? (
              <RemoveRedEyeRoundedIcon />
            ) : (
              <VisibilityOffRoundedIcon />
            )}
          </button>
        </div>
        <label>Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="form-select form-select-platform"
          aria-label="Default select example"
        >
          <option value="gmail">Gmail</option>
          <option value="outlook">Outlook</option>
          <option value="hotmail">Hotmail</option>
          <option value="aol">Aol</option>
          <option value="zoho">Zoho</option>
        </select>
        <p className="error">{errorMsg}</p>
        <button
          className={app_password ? "btn-primary" : "btn-disabled"}
          onClick={create_app_password}
        >
          {!loading ? (
            "Submit"
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

      <div className="email-integration-con-header">
        <p>
          Note : This integration password will help you to send all your emails
          via your provided <br /> email address otherwise all the emails will
          be sent via NSG.
        </p>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.google.com/document/d/1P2ybO8wn3ElWsQNfEUkDKn5q_bDWqwmDOlA0ywC3UW8/edit"
        >
          <InfoRoundedIcon fontSize="small" /> Step to generate email app
          password
        </a>
      </div>
    </div>
  );
}

export default AppPassword;
