import axios from "axios";
import { useEffect, useState, lazy } from "react";
import { Link } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import QRCode from "react-qr-code";
import $ from "jquery";
import swal from "sweetalert";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Avatar from "@mui/material/Avatar";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useStore } from "../../store/advisorStore";
import Toast from "../../Components/Toast/Toast";
import logo from "./img/logonew.png";
import "./Sidebar.scss";
import "./Responsive.scss";



const FeedbackPopup = lazy(() => import("../FeedbackPopup/FeedbackPopup"));

const help_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/comment_png.webp";
const gift =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gift_1_png.webp";
const gift_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gift_png.webp";
const gift_icon2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/vip-gift_png.webp";

const helpIcon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/help-circle_png_pzSajNm.webp";
const card_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icons_png.webp";
const Schedule_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Schedule_png.webp";
const contact_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Contacts_1_png.webp";
const Integrations =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/share-link--share-transmit_png_mzK2h6l.webp";
const ReferralIcon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_png_eRZ8wij.webp";
const person_list_png =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/person_list_png.webp";
const diamond = (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.2 5.25L9.85 0L10.15 0L12.8 5.25L7.2 5.25ZM9.25 17.1L0.625 6.75L9.25 6.75L9.25 17.1ZM10.75 17.1L10.75 6.75L19.375 6.75L10.75 17.1ZM14.45 5.25L11.85 0L17 0L19.625 5.25H14.45ZM0.375 5.25L3 0L8.15 0L5.55 5.25L0.375 5.25Z"
      fill="#C58A2E"
    />
  </svg>
);

function Sidebar() {
  const { advisor_data, get_advisor_data } = useStore();
  const [showPopupRef, setShowPopupRef] = useState(false);
  let is_superuser = JSON.parse(localStorage.getItem("user_info")).is_superuser;
  const [loading, setLoading] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [EmailID, setEmailID] = useState("");
  const location = window.location.pathname;
  const [showPopupQr, setShowPopupQr] = useState(false);
  let data = JSON.parse(localStorage.getItem("user_info"));
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({
          ...ToastText,
          show: false,
        });
      }, 4000);
    }
  }, [ToastText]);

  useEffect(() => {
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
    if (localStorage.getItem("user_info") !== null) {
      setUser(JSON.parse(localStorage.getItem("user_info")));
    }
    $(document).ready(function () {
      $("#addLogo").mouseover(function () {
        $("#addApptHover").css("display", "flex");
      });
      $("#addApptHover").mouseout(function () {
        $("#addApptHover").css("display", "none");
      });
    });

    $(document).ready(function () {
      $("#root").removeClass("overlay");
      $(".mobile-menu").click(function (e) {
        e.stopPropagation();
        $(".sidebar-con").toggleClass("sidebar-mobile");
        $("#root").toggleClass("overlay");
      });

      $(document).click(function (event) {
        var $target = $(event.target);
        if (
          !$target.closest(".sidebar-con").length &&
          $(".sidebar-con").is(":visible")
        ) {
          if ($(".sidebar-con").hasClass("sidebar-mobile")) {
            $(".sidebar-con").removeClass("sidebar-mobile");
            $("#root").removeClass("overlay");
          }
        }
      });
    });
  }, []);

  const refer_friend = () => {
    setLoading(true);
    const url = "api/user/refer_friend/";
    const payload = {
      referral_email: EmailID,
      refer_code: "NSG22",
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setEmailID("");
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        swal({
          text: err.response.data.message,
          icon: "warning",
        });
      });
  };

  const isAdmin =
    location === "/analytics" ||
    location === "/admin-dashboard" ||
    location === "/admin-client-logs" ||
    location === "/integrations";
  const profileNavigatin = isAdmin ? "/admin-dashboard" : "/card";
  const clientNavigation = isAdmin ? "/admin-client-logs" : "/client-logs";

  return (
    <div className="dash-sidebar">
      {ToastText.show && <Toast text={ToastText.text} />}
      <div>
        <div className="dash-sidebar-logo">
          <Link to="/calendar">
            <img
              loading="lazy"
              className="sidebar-logo"
              src={logo}
              alt="logo"
            />
          </Link>
          <div className="sidebar-advisor-info">
            <div className="sidebar-advisor-info-inner">
              <div>
                <p className="sidebar-advisor-info-name">{user.name}</p>
                <p className="sidebar-advisor-info-email">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
        <Dialog open={showPopupQr} onClose={() => setShowPopupQr(false)}>
          <DialogContent className="header-qr-popup">
            <div className="header-qr-popup-top">
              <Avatar
                src="Avatar"
                alt={data.name}
                className="name-user-icon"
                sx={{ height: 60, width: 60 }}
              />
            </div>
            <h2 className="mb-3">{user.name}</h2>
            <div className="qr-code-wrapper">
              <QRCode
                size={256}
                value={"https://" + data.username + ".youradviser.ca/"}
                viewBox={`0 0 256 256`}
                className="qr-div"
              />
            </div>
          </DialogContent>
        </Dialog>
        <div className="sidebar-advisor-wc">
          <div>
            <p className="sidebar-advisor-wc-name">
              Welcome Back, {user.name.split(" ")[0]}
            </p>
            <p className="sidebar-advisor-wc-time">
              {moment().format("LT")} | {moment().format("LL")}
            </p>
          </div>
        </div>

        <div className="sidebar-btn-con">
          <Link
            to="/dashboard"
            className={
              "sidebar-btn " +
              (location === "/dashboard" ? "sidebar-btn-active" : "")
            }
          >
            <img src={card_icon} alt="calendar" loading="lazy" />
            Dashboard
            <span
              style={{
                backgroundColor: "#f0ad4e",
                color: "white",
                fontSize: "7px",
                padding: "2px 4px",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              BETA
            </span>
          </Link>
          <Link
            to={profileNavigatin}
            className={
              "sidebar-btn " +
              (location === "/card" || location === "/admin-dashboard"
                ? "sidebar-btn-active"
                : "")
            }
          >
            <img src={contact_icon} alt="calendar" loading="lazy" />
            {isAdmin ? "Profiles" : "Profile"}
          </Link>
          {isAdmin && (
            <Link
              to={clientNavigation}
              className={
                "sidebar-btn " +
                (location === "/client-logs" ||
                location === "/admin-client-logs"
                  ? "sidebar-btn-active"
                  : "")
              }
            >
              <img width={24} src={contact_icon} alt="client" loading="lazy" />
              Contacts
            </Link>
          )}

          {!isAdmin ? (
            <>
              <Link
                to="/people"
                className={
                  "sidebar-btn " +
                  (location === "/people" ? "sidebar-btn-active" : "")
                }
              >
                <img src={person_list_png} alt="contact_icon" loading="lazy" />
                Contact List
              </Link>
              <Link
                to="/calendar"
                className={
                  "sidebar-btn " +
                  (location === "/calendar" ? "sidebar-btn-active" : "")
                }
              >
                <img src={Schedule_icon} alt="calendar" loading="lazy" />
                Schedule
              </Link>
              <Link
                to="/referral"
                className={
                  "sidebar-btn " +
                  (location === "/referral" ? "sidebar-btn-active" : "")
                }
              >
                <img
                  width={24}
                  src={ReferralIcon}
                  alt="client"
                  loading="lazy"
                />
                Referral
              </Link>
            </>
          ) : (
            ""
          )}

          {isAdmin && (
            <Link
              to="/integrations"
              className={
                "sidebar-btn " +
                (location === "/integrations" ? "sidebar-btn-active" : "")
              }
            >
              <img
                width={18}
                style={{ width: 18 }}
                src={Integrations}
                alt="Integrations"
                loading="lazy"
              />
              Integrations
            </Link>
          )}
        </div>
        {!isAdmin && (
          <div className="sidebar-btn-con sidebar-btn-con2">
            <Link
              to="/help"
              className={
                "sidebar-btn " +
                (location === "/help" ? "sidebar-btn-active" : "")
              }
            >
              <img height={24} src={helpIcon} alt="support" loading="lazy" />
              Help
            </Link>
            <div style={{ position: "relative" }}>
              <Link
                onClick={() => setShowFeedbackPopup(!showFeedbackPopup)}
                className="sidebar-btn"
              >
                <img height={24} src={help_icon} alt="support" loading="lazy" />
                Feedback
              </Link>
              {showFeedbackPopup && (
                <FeedbackPopup
                  handleClose={() => setShowFeedbackPopup(false)}
                  showFeedbackPopup={showFeedbackPopup}
                  onSuccess={() => {
                    setToastText({
                      ...ToastText,
                      text: "Thank you for your feedback",
                      show: true,
                    });
                  }}
                />
              )}
            </div>

            {is_superuser && (
              <>
                <Link
                  to="/user-info"
                  className={
                    "sidebar-btn " +
                    (location === "/user-info" ? "sidebar-btn-active" : "")
                  }
                >
                  <img
                    height={24}
                    src={contact_icon}
                    alt="support"
                    loading="lazy"
                  />
                  Active User
                </Link>
                <Link
                  to="/campaign"
                  className={
                    "sidebar-btn " +
                    (location === "/campaign" ? "sidebar-btn-active" : "")
                  }
                >
                  <img
                    height={24}
                    src={contact_icon}
                    alt="support"
                    loading="lazy"
                  />
                  Create card
                </Link>
                <Link
                  to="/contact-info"
                  className={
                    "sidebar-btn " +
                    (location === "/contact-info" ? "sidebar-btn-active" : "")
                  }
                >
                  <img
                    height={24}
                    src={contact_icon}
                    alt="support"
                    loading="lazy"
                  />
                  Popup Data
                </Link>
                <Link
                  to="/countdown"
                  className={
                    "sidebar-btn " +
                    (location === "/countdown" ? "sidebar-btn-active" : "")
                  }
                >
                  <img
                    height={24}
                    src={contact_icon}
                    alt="support"
                    loading="lazy"
                  />
                  Count Down
                </Link>
              </>
            )}
            {advisor_data.account_status === "Free" && (
              <Link to="/account/pricing" className="sidebar-btn-card">
                {diamond} Get Premium
              </Link>
            )}
            {advisor_data.account_status === "Pro (Yearly)" ||
            advisor_data.account_status === "Pro (Monthly)" ? (
              <Link to="/account/card-upgrade" className="sidebar-btn-card">
                Get Smart Card
              </Link>
            ) : (
              ""
            )}
          </div>
        )}
      </div>

      <div className="dashboard-footer"></div>
      <Dialog
        open={showPopupRef}
        onClose={() => {
          setShowPopupRef(false);
        }}
        maxWidth={"md"}
      >
        <DialogContent className="edit_info_popup">
          <div className="refer_content">
            <button
              className="back_btn"
              onClick={() => {
                setShowPopupRef(false);
              }}
            >
              <KeyboardBackspaceIcon />
            </button>
            <div className="refer_img">
              <img src={gift} alt="gift" />
            </div>
            <h3>Make it a win-win</h3>
            <p>
              You will get credits in your account when your friend places an
              order using a promo code.
            </p>
            <div className="refer_discount">
              <img src={gift_icon} alt="gift_icon" />
              <div>
                <h5>You get 18% off</h5>
                <p>Use it for tech and marketing services</p>
              </div>
            </div>
            <div className="refer_discount refer_discount_last">
              <img src={gift_icon2} alt="gift_icon" />
              <div>
                <h5>They get 22% off promo code</h5>
                <p>Use for digital business card</p>
              </div>
            </div>
            <div className="refer_send_mail">
              <h4>Send them via email</h4>
              <input
                placeholder="Enter email id"
                value={EmailID}
                onChange={(e) => setEmailID(e.target.value)}
              />
              <div className="edit_info_btn">
                <button onClick={refer_friend}>
                  {!loading ? (
                    "Invite friends"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Sidebar;
