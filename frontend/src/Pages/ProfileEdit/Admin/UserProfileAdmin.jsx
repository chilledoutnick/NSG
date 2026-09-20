import axios from "axios";
import { useState, useEffect, useRef, lazy } from "react";
import QRCode from "react-qr-code";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ThreeDots } from "react-loader-spinner";
import { ChromePicker } from "react-color";
import $ from "jquery";
import Swal from "sweetalert2";
import moment from "moment/moment";
import copy from "copy-to-clipboard";
import swal from "sweetalert";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import AddIcon from "@mui/icons-material/Add";
import ProfileEdit from "../Skeleton/ProfileEdit";
import "../UserProfileEdit/UserProfileEditRes.scss";
import "../UserProfileEdit/UserProfileEdit.scss";

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

const pen_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003286_png.webp";
const sent_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/send_png.webp";
const upload_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003388_png.webp";
const profilePlacholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003424_2_png.webp";

function TemplateThree(props) {
  const [loading, setLoading] = useState(false);
  const [InitialLoading, setInitialLoading] = useState(false);
  const [isProfileClicked, setIsProfileClicked] = useState(false);
  const [isLogoUpload, setIsLogoUpload] = useState(false);
  const [error, setError] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [advisor_data, setAdvisor_data] = useState({});
  const [active_popup, setActive_popup] = useState(0);
  const [active_bg, setActive_bg] = useState(0);
  const [Logo, setLogo] = useState("");
  const [sendMail, setSendMail] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSuccessMSg, setShowSuccessMSg] = useState(false);
  const isAdmin = window.location.pathname === "/admin-dashboard";
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  let user_info = JSON.parse(localStorage.getItem("user_info"));

  const [contactDetails, setContactDetails] = useState({
    email: "",
    name: "",
    phone: "",
    timestamp: moment().format("YYYY-MM-DD"),
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
      Authorization: `Bearer ${props.token}`,
    },
  };

  const [EmailCardData, setEmailCardData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleEmailCardDataChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    EmailCardData[name] = value;
    setEmailCardData({
      ...EmailCardData,
    });
  };

  useEffect(() => {
    setInitialLoading(true);
    get_logo();
    get_advisor_data();
  }, []);

  const get_advisor_data = () => {
    const url = "api/user_profile/get_user/";
    axios
      .post(url, {}, config)
      .then((res) => {
        const data = res.data;
        setAdvisor_data(data);
        setData({
          ...Data,
          name: data.name,
          about: data.about,
          company: data.company,
          designation: data.Designation,
          meet_url: data.meet_url,
          phone: data.phone,
          profile_picture: data.profile_picture,
          background_colour: data.background_colour,
        });
        setInitialLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching advisor data", err);
        setInitialLoading(false);
      });
  };

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

  const handleReceiveCard = () => {
    setLoading(true);
    const url = "api/digital_card/email_business_card/";
    const payaload = {
      receiver_name: EmailCardData.name,
      message: EmailCardData.message,
      receiver_email: EmailCardData.email,
    };
    axios
      .post(url, payaload, config)
      .then(() => {
        setLoading(false);
        setSendMail(false);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setEmailCardData({
          ...EmailCardData,
          name: "",
          email: "",
          message: "",
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.message,
          icon: "warning",
          buttons: true,
        });
        setLoading(false);
      });
  };

  const update_web = () => {
    setLoading(true);
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then(() => {
        get_advisor_data();
        setLoading(false);
        setActive_popup(0);
        handleSuccessPopup();
      })
      .catch(() => setLoading(false));
  };

  const exchangeContact = () => {
    setLoading(true);
    const url = "api/exchange_contact/create_exchange_contact/";
    const payload = {
      email: contactDetails.email,
      name: contactDetails.name,
      phone: contactDetails.phone,
      comment: contactDetails.comment,
      user_id: advisor_data.user_id,
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

  const addcard = async () => {
    $("#preloader").css("display", "block");
    setActive_popup(0);
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

  const apple_pass = async () => {
    $("#preloader").css("display", "block");
    setActive_popup(0);
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
      $("#preloader").css("display", "none");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error,
      });
      $("#preloader").css("display", "none");
    }
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

  return (
    <div className="template-three-con-edit">
      {InitialLoading ? (
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
              <div className="tm3-about">
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
                  {advisor_data.about !== "" && <p>{advisor_data.about}</p>}
                </div>
              </div>
              <div className="tm3-schedule">
                <Avaialability
                  advisor={advisor_data}
                  get_data={get_advisor_data}
                  isAdmin={true}
                  token={props.token}
                />
              </div>
              <SocialLinks token={props.token} isAdmin={true} />
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
            </>
            {!advisor_data.is_team_member && (
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
            {Data.about.length > 300 && (
              <span className="text-red-500 text-sm">
                Character limit exceeded! Please stay within 300 characters.
              </span>
            )}
            <span
              className={
                "limit_text " + (Data.about.length > 300 ? "text-danger" : "")
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
        <DialogContent className="edit_info_popup qr_info_popup">
          {sendMail ? (
            <>
              <div className="edit_info_popup_header">
                <button onClick={() => setSendMail(false)}>
                  <KeyboardBackspaceIcon />
                </button>
                <h4>Email Your Card</h4>
              </div>
              <div className="edit_info_form">
                <label htmlFor="Name">Name*</label>
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  value={EmailCardData.name}
                  onChange={handleEmailCardDataChange}
                />
                <label htmlFor="Email">Email*</label>
                <input
                  type="text"
                  placeholder="Email"
                  name="email"
                  value={EmailCardData.email}
                  onChange={handleEmailCardDataChange}
                />
                <label htmlFor="Message">Message</label>
                <input
                  type="text"
                  name="message"
                  placeholder="Message"
                  value={EmailCardData.message}
                  onChange={handleEmailCardDataChange}
                />
              </div>
              <div className="edit_info_btn">
                <button
                  disabled={
                    EmailCardData.name === "" || EmailCardData.email === ""
                  }
                  onClick={handleReceiveCard}
                >
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
              </div>
            </>
          ) : (
            <>
              <div className="edit_info_popup_header">
                <button onClick={() => setActive_popup(0)}>
                  <KeyboardBackspaceIcon />
                </button>
                <h4>Share Your Card</h4>
              </div>
              <div className="qr_info_popup_content">
                <div className="qr_wrapper">
                  <QRCode
                    size={197}
                    value={"/" + advisor_data.username}
                    viewBox={`0 0 256 256`}
                  />
                  <p>
                    Scan the QR card to
                    <br />
                    receive the card
                  </p>
                </div>
                <div className="qr_btns">
                  <button
                    onClick={() => {
                      swal({
                        text: "Success",
                        icon: "success",
                        timer: 2000,
                        buttons: false,
                      });
                      copy("/" + advisor_data.username);
                    }}
                  >
                    <div>
                      Copy link
                      <span>Copy link and share with your friends</span>
                    </div>
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/copy-01_png.webp"
                      alt="icon"
                      loading="lazy"
                    />
                  </button>
                  <button onClick={() => setSendMail(true)}>
                    <div>
                      Email
                      <span>Email your digital card to anyone</span>
                    </div>
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/arrow-up_png.webp"
                      alt="icon"
                      loading="lazy"
                    />
                  </button>
                  <button onClick={apple_pass}>
                    <div>
                      Add to Apple Wallet
                      <span>Add card to your apple wallet</span>
                    </div>
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/pngwing_com_png.webp"
                      alt="icon"
                      loading="lazy"
                    />
                  </button>
                  <button onClick={addcard}>
                    <div>
                      Add to Google Wallet
                      <span>Add card to your google wallet</span>
                    </div>
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/google-wallet-icon_png.webp"
                      alt="icon"
                      loading="lazy"
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <BottomBar />
    </div>
  );
}

export default TemplateThree;
