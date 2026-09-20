import axios from "axios";
import { useState, useEffect } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { useStore } from "../../store/advisorStore";
import ProfileProgress from "../ProfileProgress/ProfileProgress";
import BlurPopup from "../BlurPopup/BlurPopup";
import "./Header.scss";
import "./Responsive.scss";

import logo from "./img/logonew.png";
const AdminIcon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/ic32on_png.webp";
const resetIcon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Refresh_light_png.webp";
const logoutIcon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Export_png.webp";
const referraICon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Menu_icon_png.webp";

const diamond = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
  >
    <path
      d="M9.2 8.75L11.85 3.5H12.15L14.8 8.75H9.2ZM11.25 20.6L2.625 10.25H11.25V20.6ZM12.75 20.6V10.25H21.375L12.75 20.6ZM16.45 8.75L13.85 3.5H19L21.625 8.75H16.45ZM2.375 8.75L5 3.5H10.15L7.55 8.75H2.375Z"
      fill="black"
    />
  </svg>
);

function Header() {
  const navigate = useNavigate();
  const { advisor_data, get_advisor_data } = useStore();
  const pathname = window.location.pathname;
  let data = JSON.parse(localStorage.getItem("user_info"));
  const isAdmin =
    pathname === "/analytics" ||
    pathname === "/admin-dashboard" ||
    pathname === "/admin-client-logs" ||
    pathname === "/integrations";

  const [showPopup, setShowPopup] = useState(false);
  const [smallPopup, setSmallPopup] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    meet_url: "",
    username: "",
    app_password: "",
    is_superuser: "",
  });

  useEffect(() => {
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
    setUser(data);
    setFormData({
      ...formData,
      name: data?.name,
      email: data?.email,
      meet_url: data?.meet_link,
      phone: data?.phone,
      username: data?.username,
      app_password: data?.app_password,
      is_superuser: data?.is_superuser,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    const url = "api/user/logout/";
    axios
      .post(url)
      .then(() => {
        localStorage.removeItem("user_info");
        localStorage.removeItem("jwt");
        window.location.reload();
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <div className="dash-header">
      <div className="dash-header-logo-con">
        <div className="dash-header-logo-con-wrapper">
          <img loading="lazy" alt="logo" src={logo} />
        </div>
        <div className="dash-header-logo-con-right">
          <p className="dash-header-name">My NSG Account</p>
          <p className="dash-header-date">
            {moment().format("LT")} | {moment().format("LL")}{" "}
          </p>
        </div>
      </div>
      <div className="dash-header-end">
        {advisor_data.account_status === "Free" && (
          <button
            onClick={() => navigate("/account/pricing")}
            className="get_premium"
          >
            {diamond}Get Premium
          </button>
        )}
        <button
          onClick={() => {
            setSmallPopup(!smallPopup);
            setShowPopup(!showPopup);
          }}
          id="openPopupBtn"
          className="dash-header-end-img"
        >
          <Avatar
            src="Avatar"
            alt={user.name}
            className="name-user-icon"
            sx={{ height: 30, width: 30 }}
          />
          <p>{user.name}</p>
          {!showPopup ? (
            <KeyboardArrowDownRoundedIcon
              fontSize="small"
              className="ms-2 mt-1"
            />
          ) : (
            <KeyboardArrowUpRoundedIcon
              fontSize="small"
              className="ms-2 mt-1"
            />
          )}
        </button>
      </div>
      {showPopup && (
        <BlurPopup
          ComponentClass="header_profile_popup"
          onClose={() => setShowPopup(false)}
          openState={showPopup}
        >
          <div className="blurpopup_con_wrapper">
            <div id="popupProfile" className="dash-header-popup">
              <div className="dash-header-popup-info">
                <Avatar
                  src="Avatar"
                  alt={user.name}
                  sx={{ height: 48, width: 48 }}
                />
                <div>
                  <p className="dash-header-popup-name">{user.name}</p>
                  <p className="dash-header-popup-email">{user.email}</p>
                </div>
              </div>
              <ProfileProgress />
              <div className="dash-header-popup-btn-con">
                <button
                  onClick={() => {
                    navigate("/account");
                    setShowPopup(false);
                  }}
                >
                  <img src={AdminIcon} alt="resetIcon" loading="lazy" />
                  Account
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => {
                      navigate("/card");
                      setShowPopup(false);
                    }}
                  >
                    <img src={AdminIcon} alt="resetIcon" loading="lazy" />
                    My NSG Profile
                  </button>
                ) : (
                  data?.is_team_admin && (
                    <button
                      onClick={() => {
                        navigate("/admin-dashboard");
                        setShowPopup(false);
                      }}
                    >
                      <img src={AdminIcon} alt="resetIcon" loading="lazy" />
                      Admin Dashboard
                    </button>
                  )
                )}
                <button
                  onClick={() => {
                    navigate("/reset-password-dash");
                    setShowPopup(false);
                  }}
                >
                  <img src={resetIcon} alt="resetIcon" loading="lazy" />
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    navigate("/referral");
                    setShowPopup(false);
                  }}
                >
                  <img src={referraICon} alt="resetIcon" loading="lazy" />
                  Refer a friend
                </button>
                <button onClick={logout}>
                  <img src={logoutIcon} alt="resetIcon" loading="lazy" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}
export default Header;
