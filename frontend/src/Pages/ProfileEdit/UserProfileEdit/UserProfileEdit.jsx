import axios from "axios";
import { useState, useEffect, useRef, lazy } from "react";
import QRCode from "react-qr-code";
import { ThreeDots } from "react-loader-spinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ChromePicker } from "react-color";
import Swal from "sweetalert2";
import swal from "sweetalert";
import moment from "moment/moment";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useStore } from "../../../store/advisorStore";
import ProfileEdit from "../Skeleton/ProfileEdit";
import { useNotificationStore } from "../../../store/notificationStore";
import ShareYourCard from "../../../Components/ShareYourCard/ShareYourCard";
import "./UserProfileEditRes.scss";
import "./UserProfileEdit.scss";

const Review = lazy(() => import("../../../Components/Ask_Reviews/Review"));
const Service = lazy(() => import("../../../Components/Service/Service"));
const ConfirmPopup = lazy(() =>
  import("../../../Components/ConfirmPopup/ConfirmPopup")
);
const BottomBar = lazy(() =>
  import("../../../Components/CardProfileBottomBar/BottomBar")
);
const Avaialability = lazy(() =>
  import("../../../Components/CardProfileAvailability/Avaialability")
);
const ImageEditor = lazy(() =>
  import("../../../Components/ImageEditor/ImageEditor")
);
const BlurPopup = lazy(() => import("../../../Components/BlurPopup/BlurPopup"));
const FeaturesGallery = lazy(() =>
  import("../../../Components/FeaturesGallery/FeaturesGallery")
);
const PopupTrigger = lazy(() =>
  import("../../../Components/PopupTrigger/PopupTrigger")
);
const SocialLinks = lazy(() =>
  import("../../../Components/SocialLinks/SocialLinks")
);
const ProfileLinks = lazy(() =>
  import("../../../Components/ProfileLinks/ProfileLinks")
);
const ProfileVideo = lazy(() =>
  import("../../../Components/ProfileVideo/ProfileVideo")
);
const AddToHome = lazy(() => import("../../../Components/AddToHome/AddToHome"));
const ProfileProgress = lazy(() =>
  import("../../../Components/ProfileProgress/ProfileProgress")
);

const pen_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003286_png.webp";
const sent_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/send_png.webp";
const upload_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003388_png.webp";
const profilePlacholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003424_2_png.webp";

function TemplateThree(props) {
  const { advisor_loading, advisor_data, get_advisor_data } = useStore();
  const { setNotificationId } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isLogoUpload, setIsLogoUpload] = useState(false);
  const [error, setError] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [active_popup, setActive_popup] = useState(0);
  const [active_bg, setActive_bg] = useState(0);
  const [Logo, setLogo] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSuccessMSg, setShowSuccessMSg] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [showFull, setShowFull] = useState("");
  const isLong = advisor_data.about?.length > 300;
  const toggleReadMore = () => setShowFull(!showFull);

  const isAdmin = window.location.pathname === "/admin-dashboard";
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  let user_info = JSON.parse(localStorage.getItem("user_info"));
  let showProgress = JSON.parse(sessionStorage.getItem("showProgress"));

  const [contactDetails, setContactDetails] = useState({
    email: "",
    name: "",
    phone: "",
    timestamp: moment().format("YYYY-MM-DD"),
    fk_advisor: props.advisorId,
  });

  const [Data, setData] = useState({
    name: "",
    about: "",
    company: "",
    designation: "",
    meet_url: "",
    phone: "",
    profile_picture: "",
    background_colour: "",
  });
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  useEffect(() => {
    get_logo();
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }

    ger_fcm_permission();
    if (showProgress) {
      setShowProgressBar(true);
      setTimeout(() => {
        sessionStorage.removeItem("showProgress");
      }, 5000);
    }
    get_refresh_token();
  }, []);

  const ger_fcm_permission = () => {
    const fcm_permission = "api/notification/get_fcm_permission/";
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    };
    const payload = {};
    axios
      .post(fcm_permission, payload, config)
      .then((res) => {
        if (res.data.action === "generate_token") {
          localStorage.removeItem("NSG_ask_notification_permission");
          Ask_notification_permission();
        }
      })
      .catch((err) => console.log("err", err));
  };

  const Ask_notification_permission = () => {
    let NSG_ask_notification_permission = localStorage.getItem(
      "NSG_ask_notification_permission"
    );
    if (!NSG_ask_notification_permission) {
      if ("Notification" in window) {
        setNotificationId(1, user_info.user_id);
      } else {
        console.warn("Notifications not supported on this device.");
        try {
          localStorage.setItem("NSG_ask_notification_permission", "false");
        } catch (e) {
          console.warn("LocalStorage not available", e);
        }
      }
    }
  };
  useEffect(() => {
    if (Object.keys(advisor_data).length !== 0) {
      setData({
        ...Data,
        name: advisor_data.name,
        about: advisor_data.about ? advisor_data.about : "",
        company: advisor_data.company ? advisor_data.company : "",
        designation: advisor_data.Designation ? advisor_data.Designation : "",
        meet_url: advisor_data.meet_url ? advisor_data.meet_url : "",
        phone: advisor_data.phone ? advisor_data.phone : "",
        profile_picture: advisor_data.profile_picture,
        background_colour: advisor_data.background_colour,
      });
    }
  }, [advisor_data]);

  useEffect(() => {
    if (Logo instanceof File) {
      upload_logo();
    }
  }, [Logo]);

  const get_logo = () => {
    const url = "api/logo/get_logo/";
    axios
      .post(url, {}, config)
      .then((res) => setLogo(res.data.logo))
      .catch((err) => console.log("err", err));
  };

  const handleShareClick = () => {
    const customShareUrl = "/" + advisor_data.username;
    if (navigator.share && customShareUrl) {
      try {
        navigator.share({
          title: "Check out this link!",
          text: "Shared from NSG",
          url: customShareUrl,
        });
      } catch (error) {
        console.error("Error sharing via Web Share API:", error);
      }
    } else {
      alert(`Share this link: ${customShareUrl}`);
    }
  };

  const formData = new FormData();
  formData.append("name", Data.name);
  formData.append("about", Data.about);
  formData.append("company", Data.company);
  formData.append("designation", Data.designation);
  formData.append("meet_url", Data.meet_url);
  formData.append("phone", Data.phone);
  formData.append("background_colour", Data.background_colour);

  const update_web = () => {
    setLoading(true);
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then((res) => {
        get_advisor_data();
        setLoading(false);
        setActive_popup(0);
        handleSuccessPopup();
      })
      .catch((err) => setLoading(false));
  };

  const exchangeContact = () => {
    setLoading(true);
    const url = "api/exchange_contact/create_exchange_contact/";
    const payload = {
      email: contactDetails.email,
      name: contactDetails.name,
      phone: contactDetails.phone,
      comment: contactDetails.comment,
      user_id: props.advisorId,
    };
    axios
      .post(url, payload)
      .then(() => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setLoading(false);
        setShowContact(false);
        setError("");
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response.data.message);
      });
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    Data[name] = value;
    setData({
      ...Data,
    });
  };

  const { errors } = Data;

  const handleSuccessPopup = () => {
    setShowSuccessMSg(true);
    setTimeout(() => {
      setShowSuccessMSg(false);
    }, 1500);
  };

  const handleProfile = (editedImage) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("profile_picture", editedImage);
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then(() => {
        get_advisor_data();
        setIsProfileClicked(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile picture successfully uploaded",
          showConfirmButton: false,
          timer: 3000,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error uploading image:", err);
        setLoading(false);
      });
  };

  const handleLogo = (editedImage) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("logo", editedImage);

    const url = "api/logo/upload_logo/";
    axios
      .post(url, formData, config)
      .then(() => {
        get_logo();
        setIsLogoUpload(false);
        setLoading(false);
        setActive_popup(1);
      })
      .catch((err) => {
        console.error("Error uploading image:", err);
        setLoading(false);
      });
  };

  const upload_logo = () => {
    const url = "api/logo/upload_logo/";
    const formDatas = new FormData();
    formDatas.append("logo", Logo);
    axios
      .post(url, formDatas, config)
      .then(() => {
        get_logo();
      })
      .catch((err) => console.log("err", err));
  };

  const profile_picture_deletion = () => {
    const url = "api/user/profile_picture_deletion/";
    axios
      .post(url, {}, config)
      .then(() => {
        get_advisor_data();
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const get_refresh_token = (id) => {
    const url = "api/user/get_access_token/";
    const payload = {
      user_id: props.advisorId,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        setShowScheduling(google || outlook || other);
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <div className="template-three-con-edit">
      {advisor_loading ? (
        <ProfileEdit />
      ) : (
        <div className="tm3-contant-wrapper">
          <div className="tm3-hero">
            <div className="tm3-user-info">
              <div className="tm3-user-info-wrapper">
                <h2>
                  Hello,
                  <br />{" "}
                  <span>
                    {advisor_data.name && advisor_data.name.split(" ")[0]}
                  </span>
                </h2>
              </div>
              <p>
                Welcome to your profile! Customize it anytime
                <br /> and enjoy connecting with others.
              </p>
              <div
                className="bg"
                style={{ backgroundColor: advisor_data.background_colour }}
              >
                <LazyLoadImage
                  alt="bg"
                  src={
                    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003352_png.webp"
                  }
                  effect="blur"
                  wrapperClassName="bg_inner"
                />
              </div>
            </div>
          </div>
          <div className="tm3-bottom-contant-wrapper">
            <div className="tm3-bottom-contant">
              <ProfileProgress isProfile={true} isOpen={showProgressBar} />
              {/* {!isMobile && !isAdmin && (
                <ProfileProgress isProfile={true} isOpen={showProgressBar} />
              )} */}
              <div
                className="tm3-about"
                style={showFull ? { maxHeight: 1000 } : {}}
              >
                <div className="tm3-about-btn">
                  <button
                    onClick={() => {
                      setActive_popup(8);
                    }}
                  >
                    Share Your Card
                    <img src={sent_icon} alt="sent_icon" loading="lazy" />
                  </button>
                </div>
                <div
                  className={
                    "tm3-about-text " +
                    (advisor_data.about !== "" ? "" : "py-3")
                  }
                >
                  <h3>
                    About
                    <button
                      onClick={() => setActive_popup(2)}
                      className="tm_edit_btn"
                    >
                      {advisor_data.about !== "" ? "Edit" : "Add"}
                    </button>
                  </h3>
                  <p>
                    {showFull || !isLong
                      ? advisor_data.about
                      : `${advisor_data.about.substring(0, 300)}...`}
                  </p>
                  {isLong && (
                    <button className="read-more-btn" onClick={toggleReadMore}>
                      {showFull ? "Read less..." : "Read more..."}
                    </button>
                  )}
                </div>
              </div>
              {showScheduling && (
                <div className="tm3-schedule">
                  <Avaialability advisor={advisor_data} />
                </div>
              )}
              <SocialLinks />
              <div className="tm3-service">
                <Service advisor={advisor_data} token={props.token} />
              </div>
              <ProfileLinks token={props.token} />
              <FeaturesGallery token={props.token} />
              <div className="tm3-reviews">
                <Review advisor={advisor_data} token={props.token} />
              </div>
              <ProfileVideo token={props.token} />
            </div>
            <div
              className={"tm3-right-contant "}
              style={isAdmin ? { marginTop: "-50px" } : {}}
            >
              {isMobile && !isAdmin && <ProfileProgress isProfile={true} />}
              <div className="tm3-user">
                <button
                  onClick={() => {
                    setIsProfileClicked(true);
                  }}
                  className="tm3-user-img-wrapper"
                >
                  <img
                    src={
                      advisor_data.profile_picture !== ""
                        ? advisor_data.profile_picture
                        : profilePlacholder
                    }
                    alt="profile_picture"
                    className="tm3-user-img"
                  />
                  <p className="edit_pen">
                    <img
                      src={pen_icon}
                      alt="pen_icon"
                      className="edit_pen_icon"
                      loading="lazy"
                    />
                  </p>
                </button>

                <div className="tm3-name">
                  <h1>{advisor_data.name}</h1>
                  {advisor_data.Designation !== "null" && (
                    <p>{advisor_data.Designation}</p>
                  )}
                  {advisor_data.company !== "null" && (
                    <p className="mt-1">{advisor_data.company}</p>
                  )}
                  <img
                    src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Mask_group_png.webp"
                    alt="bg"
                    loading="lazy"
                    className="bg_img"
                  />
                  {Logo !== "" && (
                    <img
                      className="tm3_company_logo"
                      src={Logo}
                      alt="Company"
                      loading="lazy"
                    />
                  )}
                </div>
                <button className="edit_pen" onClick={() => setActive_popup(1)}>
                  <img
                    src={pen_icon}
                    alt="pen_icon"
                    className="edit_pen_icon"
                    loading="lazy"
                  />
                </button>
              </div>

              <div className="tm3-bottom-contant-qr">
                <div className="qr-con">
                  <QRCode
                    size={200}
                    value={"/card"}
                    viewBox={`0 0 256 256`}
                    className="qr-div"
                  />
                  <p>
                    <span>Scan</span> the QR card to open
                    <br /> your profile on your phone
                  </p>
                  <button onClick={handleShareClick}>
                    <InsertLinkIcon className="icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isAdmin && <AddToHome />}
      <PopupTrigger />
      {showSuccessMSg && <ConfirmPopup />}
      {isProfileClicked && (
        <BlurPopup
          onClose={() => setIsProfileClicked(false)}
          openState={isProfileClicked}
        >
          <div className="blurpopup_con_wrapper p-0">
            <ImageEditor
              title="Add Profile Picture"
              onImageEdited={handleProfile}
              onDelete={profile_picture_deletion}
              handleClose={() => setIsProfileClicked(false)}
              image={
                advisor_data.profile_picture !== ""
                  ? advisor_data.profile_picture
                  : profilePlacholder
              }
            />
          </div>
        </BlurPopup>
      )}
      {isLogoUpload && (
        <BlurPopup
          onClose={() => setIsLogoUpload(false)}
          openState={isLogoUpload}
        >
          <div className="blurpopup_con_wrapper p-0">
            <ImageEditor
              title="Add Logo"
              onImageEdited={handleLogo}
              handleClose={() => {
                setIsLogoUpload(false);
                setActive_popup(1);
              }}
              image={Logo !== "" ? Logo : profilePlacholder}
            />
          </div>
        </BlurPopup>
      )}
      <Dialog
        open={showContact}
        onClose={() => setShowContact(false)}
        maxWidth={"md"}
      >
        <DialogContent className="contact-popup">
          <h2>Exchange Contact</h2>
          <label>
            Name<span>*</span>
          </label>
          <input
            className="review-popup-input"
            value={contactDetails.name}
            onChange={(e) =>
              setContactDetails({
                ...contactDetails,
                name: e.target.value,
              })
            }
          />
          <label>
            Email<span>*</span>
          </label>
          <input
            value={contactDetails.email}
            className="review-popup-input"
            onChange={(e) =>
              setContactDetails({
                ...contactDetails,
                email: e.target.value,
              })
            }
          />
          <label>Phone</label>
          <input
            value={contactDetails.phone}
            className="review-popup-input"
            onChange={(e) =>
              setContactDetails({
                ...contactDetails,
                phone: e.target.value,
              })
            }
          />
          <p className="error">{error}</p>
          <button onClick={exchangeContact} className="btn-primary mt-3">
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
        </DialogContent>
      </Dialog>
      <Dialog
        open={active_popup === 1}
        onClose={() => setActive_popup(0)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setActive_popup(0)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Edit Profile Info</h4>
          </div>
          <div className="edit_info_form">
            <label htmlFor="Name">Name</label>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={Data.name}
              onChange={handleChange}
            />
            <label htmlFor="Designation">Designation</label>
            <input
              type="text"
              placeholder="Designation"
              name="designation"
              value={Data.designation}
              onChange={handleChange}
            />
            <label htmlFor="Company">Company</label>
            <input
              type="text"
              placeholder="Desigtion/Company"
              name="company"
              value={Data.company}
              onChange={handleChange}
            />
            <label htmlFor="Phone Number">Phone Number</label>
            <input
              type="text"
              placeholder="Phone Number"
              name="phone"
              value={Data.phone}
              onChange={handleChange}
            />
            {!advisor_data.is_team_admin && (
              <>
                <div
                  onClick={() => {
                    setIsLogoUpload(true);
                    setActive_popup(0);
                  }}
                  className="edit_info_sub mt-3"
                >
                  <img src={upload_icon} alt="upload_icon" loading="lazy" />
                  <h5>Manage Logo</h5>
                </div>
                {Logo !== "" && (
                  <img
                    loading="lazy"
                    className="preview_img"
                    alt="profile"
                    src={Logo}
                  />
                )}
                <div className="edit_info_bg">
                  <h5>Background Color</h5>
                  <div className="edit_info_bg_btn">
                    <button
                      className={active_bg === 1 ? "active" : ""}
                      onClick={() => {
                        setActive_bg(1);
                        setData({
                          ...Data,
                          background_colour: "#a9cd08",
                        });
                      }}
                    ></button>
                    <button
                      className={active_bg === 2 ? "active" : ""}
                      onClick={() => {
                        setActive_bg(2);
                        setData({
                          ...Data,
                          background_colour: "#4a35ed",
                        });
                      }}
                    ></button>
                    <button
                      className={active_bg === 3 ? "active" : ""}
                      onClick={() => {
                        setActive_bg(3);
                        setData({
                          ...Data,
                          background_colour: "#6018c0",
                        });
                      }}
                    ></button>
                    <button
                      className={active_bg === 4 ? "active" : ""}
                      onClick={() => {
                        setActive_bg(4);
                        setData({
                          ...Data,
                          background_colour: "#000",
                        });
                      }}
                    ></button>
                    {user_info.package === "6" && (
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      >
                        <AddIcon
                          className={
                            "icon " + (showColorPicker ? "active_icon" : "")
                          }
                        />
                      </button>
                    )}
                  </div>
                  <ChromePicker
                    className={
                      "color_picker " +
                      (showColorPicker ? "color_picker_active" : "")
                    }
                    color={Data.background_colour}
                    onChange={(newColor) =>
                      setData({
                        ...Data,
                        background_colour: newColor.hex,
                      })
                    }
                  />
                </div>
              </>
            )}

            <div className="p-5"></div>
          </div>
          <div className="edit_info_btn edit_info_btn2">
            <button
              onClick={() => {
                update_web();
              }}
            >
              {!loading ? (
                "Save"
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
        </DialogContent>
      </Dialog>
      <Dialog
        open={active_popup === 2}
        onClose={() => setActive_popup(0)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setActive_popup(0)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>About You</h4>
          </div>
          <div className="edit_info_form">
            <label htmlFor="About">Tell us about yourself</label>
            <textarea
              name="about"
              type="text"
              placeholder="Tell more about you in 100 - 300 characters"
              value={Data.about}
              onChange={handleChange}
              className={`textarea ${Data.about.length > 300 ? "textarea-error" : ""}`}
            />
            {errors?.has("about") && (
              <span className="error">{errors.first("about")}</span>
            )}
            {Data.about.length > 300 && (
              <span className="warning">Character limit exceeded! Please stay within 300 characters.</span>
            )}
            <span
              className={
                "limit_text " + (Data?.about.length > 300 ? "text-danger" : "")
              }
            >
              {Data.about.length}/300
            </span>

          </div>
          <div className="edit_info_btn">
            <button onClick={update_web} disabled={Data.about.length > 300}>
              {!loading ? (
                "Save"
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
        </DialogContent>
      </Dialog>
      <Dialog
        open={active_popup === 6}
        onClose={() => setActive_popup(0)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setActive_popup(0)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Reviews Section </h4>
          </div>
          <div className="edit_info_form">
            <div>
              <p>
                Enable NSG review section to collect review and build trust
                on your profile.
              </p>
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckChecked"
                checked
              ></input>
            </div>
          </div>
          <div className="edit_info_btn">
            <button onClick={() => setActive_popup(0)}>
              {!loading ? (
                "Save"
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
        </DialogContent>
      </Dialog>
      <Dialog
        open={active_popup === 8}
        onClose={() => {
          setActive_popup(0);
        }}
        fullScreen={isMobile}
      >
        <ShareYourCard
          advisor_data={advisor_data}
          handleClose={() => {
            setActive_popup(0);
          }}
        />
      </Dialog>
      <BottomBar />
    </div>
  );
}

export default TemplateThree;
