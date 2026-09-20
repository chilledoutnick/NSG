import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import swal from "sweetalert";
import Swal from "sweetalert2";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import ProfileProgress from "../ProfileProgress/ProfileProgress";
import { useStore } from "../../store/advisorStore";
import Toast from "../../Components/Toast/Toast";
import "./CardProfileMenu.scss";

const Refer = lazy(() => import("../Refer/Refer"));
const Feedback = lazy(() => import("../../Pages/Feedback/Feedback"));
const FeedbackPopup = lazy(() => import("../FeedbackPopup/FeedbackPopup"));

const google_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/google-wallet-icon_png.webp";
const apple_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/pngwing_com_png.webp";

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

function CardProfileMenu(props) {
  const navigate = useNavigate();
  const { advisor_data, get_advisor_data } = useStore();
  let user = JSON.parse(localStorage.getItem("user_info"));
  const pathname = window.location.pathname;
  const isAdmin =
    pathname === "/analytics" ||
    pathname === "/admin-dashboard" ||
    pathname === "/integrations" ||
    pathname === "/admin-client-logs";
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const user_info = JSON.parse(localStorage.getItem("user_info"));
  const help_icon =
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Chat_duotone_line_png.webp";

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupPhone, setShowPopupPhone] = useState(false);
  const [showPopupReview, setShowPopupReview] = useState(false);
  const [showPopupRef, setShowPopupRef] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });

  useEffect(() => {
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/contact_sales/create_sales_contact/";
    const payload = {
      email: user_info.email,
      message: message,
      first_name: user_info.name,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setErrorMsg("");
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setLoading(false);
        setMessage("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
        setLoading(false);
      });
  };

  const addcard = async () => {
    $("#preloader").css("display", "block");
    // const url = "api/google_pass/googlepass/";
    const url = "api/google_pass/google_pass/";
    axios
      .post(url, {}, config)
      .then((res) => {
        const passUrl = res.data["Add to wallet"];
        if (passUrl) {
          window.location.href = passUrl;
        } else {
          swal({
            text: "Pass URL not found in the response",
            icon: "warning",
            buttons: true,
          });
        }
        $("#preloader").css("display", "none");
      })
      .catch((err) => {
        swal({
          text: err.response.data.message,
          icon: "warning",
          buttons: true,
        });
        $("#preloader").css("display", "none");
      });
  };

  const logout = () => {
    const url = "api/user/logout/";
    axios
      .post(url)
      .then((res) => {
        localStorage.removeItem("user_info");
        localStorage.removeItem("jwt");
        window.location.reload();
      })
      .catch((err) => console.log("err", err));
  };

  const handlePopupRefCLose = () => {
    setShowPopupRef(false);
  };
  const apple_pass = async () => {
    $("#preloader").css("display", "block");
    try {
      const response = await axios.post(
        "/api/apple_pass/generate_pass/",
        {},
        config
      );

      const downloadUrl = response.data.download_url;
      const downloadResponse = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      const passBlob = new Blob([downloadResponse.data], {
        type: "application/vnd.apple.pkpass",
      });

      if ("wallet" in navigator) {
        const pass = await navigator.wallet.loadPass(
          window.URL.createObjectURL(passBlob)
        );
        await pass.add();
        console.log("Pass added to Apple Wallet");
      } else {
        const url = window.URL.createObjectURL(passBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "NSG.pkpass";

        document.body.appendChild(link);
        link.click();
        console.log("Pass downloaded");
      }
      $("#preloader").css("display", "none");
    } catch (error) {
      console.error("Error adding pass to Apple Wallet:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error,
      });
      $("#preloader").css("display", "none");
    }
  };

  return (
    <div className="card_menu_con">
      {ToastText.show && <Toast text={ToastText.text} />}
      <div className="card_menu_wrapper">
        <div className="card_menu_top">
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
            <button onClick={props.handleClose}>
              {" "}
              <CloseIcon />{" "}
            </button>
          </div>
          <div className="card_menu_progress">
            <ProfileProgress />
          </div>
          {advisor_data.account_status === "Free" && (
            <div className="get_premium_con">
              <button
                onClick={() => navigate("/account/pricing")}
                className="get_premium"
              >
                {diamond} Get Premium
              </button>
            </div>
          )}

          <div className="card_menu_btn">
            {!isAdmin && (
              <>
                <button onClick={apple_pass}>
                  <img src={apple_icon} alt="icon" loading="lazy" />
                  Get it in Apple wallet
                </button>
                <button onClick={addcard}>
                  <img src={google_icon} alt="icon" loading="lazy" />
                  Get it in Google wallet
                </button>
              </>
            )}
            <button onClick={() => navigate("/account")}>
              <img src={AdminIcon} alt="icon" loading="lazy" />
              Account
            </button>
            {isAdmin ? (
              <button onClick={() => navigate("/card")}>
                <img src={AdminIcon} alt="icon" loading="lazy" />
                My NSG Profile
              </button>
            ) : (
              user_info.is_team_admin && (
                <button onClick={() => navigate("/admin-dashboard")}>
                  <img src={AdminIcon} alt="icon" loading="lazy" />
                  Admin Dashboard
                </button>
              )
            )}
            {!isAdmin && (
              <>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => {
                      // setShowPopupReview(true);
                      setShowFeedbackPopup(true);
                    }}
                  >
                    <img src={help_icon} alt="icon" loading="lazy" />
                    Give us feedback
                  </button>
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
                <button
                  onClick={() => {
                    navigate("/reset-password-dash");
                  }}
                >
                  <img src={resetIcon} alt="icon" />
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    setShowPopup(true);
                  }}
                >
                  <img src={help_icon} alt="icon" loading="lazy" />
                  Help
                </button>
                {/* <button onClick={() => navigate("/communication")}>
                  <img src={Broadcast_icon} alt="Broadcast_icon" loading="lazy" />
                  Broadcast
                </button> */}
                <button
                  onClick={() => {
                    navigate("/referral");
                  }}
                >
                  <img src={referraICon} alt="icon" loading="lazy" />
                  Refer a friend
                </button>
              </>
            )}
            <button onClick={logout}>
              <img src={logoutIcon} alt="icon" loading="lazy" />
              Log Out
            </button>
          </div>
        </div>
        <Dialog
          open={showPopupPhone}
          onClose={() => {
            setShowPopupPhone(false);
          }}
          maxWidth={"md"}
          fullScreen
        >
          <DialogContent className="edit_info_popup">
            <div className="edit_info_popup_header">
              <button
                onClick={() => {
                  setShowPopupPhone(false);
                }}
              >
                <KeyboardBackspaceIcon />
              </button>
              <h4>Add to Home Screen</h4>
            </div>
            <div className="phone_screen">
              <video muted loop autoPlay playsInline>
                <source src={"video/nsg.mp4"} type="video/mp4" />
                Sorry, your browser doesn't support embedded videos.
              </video>
              <p>
                Click the <span>"Share"</span> button in your browser.
                <br /> Scroll down and select
                <span> "Add to Home Screen."</span> <br /> Provide a name and
                click <span> "Add."</span>
              </p>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={showPopupReview}
          onClose={() => {
            setShowPopupReview(false);
          }}
          maxWidth={"md"}
          fullScreen
        >
          <DialogContent className="edit_info_popup p-0">
            <div className="edit_info_popup_header">
              <button
                onClick={() => {
                  setShowPopupReview(false);
                }}
              >
                <KeyboardBackspaceIcon />
              </button>
              <h4>Give Us Feedback</h4>
            </div>
            <Feedback />
          </DialogContent>
        </Dialog>
        <Dialog
          open={showPopup}
          onClose={() => {
            setShowPopup(false);
          }}
          maxWidth={"md"}
          fullScreen
        >
          <DialogContent className="edit_info_popup">
            <div className="edit_info_popup_header">
              <button
                onClick={() => {
                  setShowPopup(false);
                }}
              >
                <KeyboardBackspaceIcon />
              </button>
              <h4>Contact Support</h4>
            </div>
            <div className="edit_info_form">
              <p className="mb-3">
                We would love to hear how we can improve your experience with
                NSG.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here, or if you’d prefer, feel free to email us at nikhil@nsgcrm.com."
              />

              <div className="edit_info_btn" style={{ paddingTop: 25 }}>
                {errorMsg && <p className="error">{errorMsg}</p>}
                <button onClick={handleSubmit}>
                  {!loading ? (
                    "Send"
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
                <p className="mt-3">
                  Someone from our team will reach out to you soon.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={showPopupRef}
          onClose={handlePopupRefCLose}
          maxWidth={"md"}
          fullScreen
        >
          <DialogContent className="edit_info_popup">
            <Refer handlePopupRefCLose={handlePopupRefCLose} />
          </DialogContent>
        </Dialog>
      </div>
      {/* </ClickAwayListener> */}
    </div>
  );
}

export default CardProfileMenu;
