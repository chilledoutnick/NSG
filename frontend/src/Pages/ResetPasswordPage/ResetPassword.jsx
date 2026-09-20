import axios from "axios";
import  { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import HeaderLogin from "../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../Components/LoginSlider/LoginSlider";
import "./ResetPassword.scss";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPasswordTop, setShowPasswordTop] = useState(false);
  const [showPasswordBtm, setShowPasswordBtm] = useState(false);
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    final_pass: "",
    password: "",
    password_confirmation: "",
  });

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

  const handleSubmit = () => {
    setLoading(true);
    const url = "/api/user/update_password/";
    const payload = {
      email: location.state.email,
      otp: location.state.otp,
      password: formData.final_pass,
    };
    axios
      .post(url, payload)
      .then((res) => {
        navigate("/login");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  const { errors } = formData;

  return (
    <div className="reset_pass_con">
     <div className="reset_pass_wrapper">
     <div className="reset_pass_content">
        <HeaderLogin title="Password recovery"/>
        <h1 className="reset-pass-header">Reset Password</h1>
        <div className="reset-password-con">
          <input
            name="password"
            type={!showPasswordTop ? "password" : "text"}
            placeholder="New password"
            onChange={handleChange}
          />
          <button onClick={() => setShowPasswordTop(!showPasswordTop)}>
            {!showPasswordTop ? (
              <VisibilityOffRoundedIcon />
            ) : (
              <RemoveRedEyeRoundedIcon />
            )}
          </button>
        </div>
        {errors?.has("password") && (
          <div className="error">{errors.first("password")}</div>
        )}
        <div className="reset-password-con mt-3">
          <input
            type={!showPasswordBtm ? "password" : "text"}
            name="password_confirmation"
            className="forgot-pass-input "
            placeholder="Confirm new password"
            onChange={handleChange}
          />
          <button onClick={() => setShowPasswordBtm(!showPasswordBtm)}>
            {!showPasswordBtm ? (
              <VisibilityOffRoundedIcon />
            ) : (
              <RemoveRedEyeRoundedIcon />
            )}
          </button>
        </div>

        {error ? <p className="error">{error}</p> : ""}
        {errors?.has("password_confirmation") && (
          <div className="error">{errors.first("password_confirmation")}</div>
        )}
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
          className={
            "btn-primary " +
            (formData.password !== "" ? "" : "btn-disabled")
          }
        >
          {" "}
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
     </div>
      <LoginSlider />
    </div>
  );
}
export default ResetPassword;
