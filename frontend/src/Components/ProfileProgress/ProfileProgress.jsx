import axios from "axios";
import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ColorRing } from "react-loader-spinner";
import Swal from "sweetalert2";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useStore } from "../../store/advisorStore";
import ImageEditor from "../ImageEditor/ImageEditor";
import InputField from "../../Components/InputField/InputField";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import Toast from "../../Components/Toast/Toast";
import "./ProfileProgress.scss";

const successImg =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/people2_png.webp";
const profilePlacholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003424_2_png.webp";
// images

const data = [
  {
    id: 1,
    name: "designation",
    title: "What describes you best?",
    placeholder: "e.g. Chief editor",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/people_png.webp",
  },
  {
    id: 2,
    name: "company",
    title: "Which company are you in?",
    placeholder: "e.g. Airbnb",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/relaxation_png.webp",
  },
  {
    id: 3,
    name: "team_member_count",
    title: "What is your team size?",
    placeholder: "e.g. Airbnb",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/together_png.webp",
  },
  {
    id: 4,
    name: "phone",
    title: "Your phone number",
    placeholder: "+1 000 000 0000",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/tag_png.webp",
  },
  {
    id: 5,
    name: "picture",
    title: "Profile picture",
    placeholder: "",
    img: "",
  },
  {
    id: 6,
    name: "background_colour",
    title: "Theme colour",
    placeholder: "",
    img: "",
  },
];

const dotsId = [1, 2, 3, 4, 5, 6];
const bgId = [
  {
    id: 1,
    color: "#a9cd08",
    bg: "#E8F3D5",
  },
  {
    id: 2,
    color: "#4a35ed",
    bg: "#ECEEF9",
  },
  {
    id: 3,
    color: "#6018c0",
    bg: "#F3EAFF",
  },
  {
    id: 4,
    color: "#1b0000",
    bg: "#ECECEC",
  },
];

function ProfileProgress(props) {
  const {
    advisor_data,
    get_advisor_data,
    profile_percent,
    profile_percentage_data,
  } = useStore();
  const [showProgress, setShowProgress] = useState(props.isOpen ? true : false);
  const [actibeTab, setActibeTab] = useState(0);
  const [useLinkdin, setUseLinkdin] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [isCompleted, setCompleted] = useState(false);
  const [remindLater, setRemindLater] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [hideControll, setHideControll] = useState(false);
  const [linkedin_url, setLinkedin_url] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    designation: "",
    company: "",
    phone: "",
    background_colour: "",
    team_member_count: "",
    background_pattern: "",
  });
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });
  };

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  const TeamMemberCount = ["1", "2-5", "6-10", "11-20", "20+"];

  useEffect(() => {
    if (Object.keys(profile_percentage_data).length !== 0) {
      setFormData({
        designation: profile_percentage_data.designation,
        company: profile_percentage_data.company,
        phone: profile_percentage_data.phone,
        background_colour: profile_percentage_data.background_colour,
        team_member_count: profile_percentage_data.team_member_count,
        background_pattern: profile_percentage_data.background_pattern,
      });
    }
  }, [profile_percentage_data]);

  useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({
          ...ToastText,
          show: false,
        });
      }, 3000);
    }
  }, [ToastText]);

  const handleProfile = (editedImage) => {
    const formData = new FormData();
    formData.append("profile_picture", editedImage);
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then(() => {
        setHideControll(false);
        setCompleted(true);
      })
      .catch((err) => {
        console.error("Error uploading image:", err);
      });
  };

  const update_web = () => {
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then(() => {
        get_advisor_data();
      })
      .catch((err) => console.log("err", err));
  };

  const linkedin_profile = () => {
    setLoading(true);
    const url = "api/feature/linkedin_profile/";
    const payload = {
      l_url: linkedin_url,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        get_advisor_data();
        setLoading(false);
        setErrorMsg("");
        setShowSuccess(true);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.response?.data?.error);
      });
  };

  const profile_picture_deletion = () => {
    const url = "api/user/profile_picture_deletion/";
    axios
      .post(url, {}, config)
      .then(() => {
        get_advisor_data();
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Oops",
          text: "something went wrong.",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const notify = () => {
    setToastText({
      ...ToastText,
      text: "Data saved successfully 🎉",
      show: true,
    });
  };

  return (
    <div
      className={
        "profile_progress_con " +
        (props.isProfile && profile_percent > 59 ? "d-none" : "")
      }
      style={showProgress ? { zIndex: 100 } : {}}
    >
      {ToastText.show && <Toast text={ToastText.text} />}
      <h5>{profile_percent}% of your profile is complete 🎉</h5>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${profile_percent}%` }}
        ></div>
      </div>
      <button
        onClick={() => {
          setShowProgress(true);
        }}
        className="profile_progress_btn"
      >
        Let’s complete your profile <ArrowForwardIcon fontSize="small" />{" "}
      </button>
      {profile_percent > 59 && (
        <p>
          Add social media links, services, reviews, etc. to complete your
          profile!
        </p>
      )}
      <div className="profile_progress_popup">
        {showProgress && (
          <BlurPopup
            onClose={() => {
              setShowProgress(false);
              setActibeTab(0);
              setUseLinkdin(false);
              setHideControll(false);
              update_web();
              notify();
            }}
            openState={actibeTab}
          >
            <div className="blurpopup_con_wrapper">
              {actibeTab === 0 ? (
                !useLinkdin ? (
                  <div className="progress_integration">
                    <h5>How would you like to set up your profile?</h5>
                    <div className="progress_integration_btn">
                      <button
                        disabled={true}
                        onClick={() => {
                          setUseLinkdin(true);
                        }}
                      >
                        <span>
                          Use LinkedIn{" "}
                          <img
                            src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_351_png.webp"
                            alt="Star"
                            width={24}
                            height={24}
                          />
                        </span>
                        <ArrowForwardIcon />
                      </button>
                      <p className="disable_text">*This feature is temporary disabled.</p>
                      <button
                        onClick={() => {
                          setActibeTab(1);
                          setUseLinkdin(false);
                        }}
                      >
                        Manually <ArrowForwardIcon />
                      </button>
                    </div>
                    <button
                      onClick={() => setShowProgress(false)}
                      className="remind_btn"
                    >
                      Remind Later
                    </button>
                  </div>
                ) : (
                  <div className="progress_item progress_linkedIn">
                    <h5>Great choice to sync your LinkedIn profile</h5>
                    <LazyLoadImage
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/social_media_png.webp"
                      effect="blur"
                      wrapperClassName="progress_item_img"
                    />
                    <h3>Add your LinkedIn profile URL</h3>
                    <div className="progress_linkedIn_input">
                      <input
                        type="text"
                        placeholder="e.g. https://www.linkedin.com/in/johndoe/"
                        value={linkedin_url}
                        onChange={(e) => setLinkedin_url(e.target.value)}
                      />
                      <button
                        disabled={!linkedin_url}
                        onClick={linkedin_profile}
                      >
                        {Loading ? (
                          <ColorRing
                            visible={true}
                            height="30"
                            width="30"
                            ariaLabel="color-ring-loading"
                            wrapperStyle={{}}
                            wrapperClass="color-ring-wrapper"
                            colors={["#000000"]}
                          />
                        ) : (
                          <ArrowForwardIcon className="icon" />
                        )}
                      </button>
                    </div>
                    <p className="error">{errorMsg}</p>

                    <button
                      onClick={() => setUseLinkdin(false)}
                      className="remind_btn"
                    >
                      Remind Later
                    </button>
                  </div>
                )
              ) : (
                data.map((item, index) => {
                  return (
                    <div
                      className={
                        "progress_item " +
                        (item.id !== actibeTab ? "d-none" : "")
                      }
                      key={"item" + index}
                    >
                      <h5>Personalise your business card</h5>
                      {actibeTab !== 5 && actibeTab !== 6 && (
                        <>
                          <LazyLoadImage
                            src={item.img}
                            effect="blur"
                            wrapperClassName="progress_item_img"
                            className={item.id === 5 ? "rounded-circle" : ""}
                          />
                          <h3>{item.title}</h3>
                          {actibeTab !== 3 ? (
                            <InputField
                              name={item.name}
                              value={formData[item.name]}
                              onChange={handleChange}
                              label={item.placeholder}
                              type="text"
                              className="login_input w-100"
                            />
                          ) : (
                            <div className="progress_team_size">
                              {TeamMemberCount.map((item, index) => {
                                return (
                                  <button
                                    key={index + "team_member_count"}
                                    className={
                                      formData.team_member_count === item
                                        ? "active"
                                        : ""
                                    }
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        team_member_count: item,
                                      })
                                    }
                                  >
                                    {item}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                      {actibeTab === 5 && (
                        <ImageEditor
                          title="Add Profile Picture"
                          onImageEdited={handleProfile}
                          onDelete={profile_picture_deletion}
                          handleClose={() => {
                            get_advisor_data();
                            setHideControll(false);
                          }}
                          image={
                            advisor_data.profile_picture !== ""
                              ? advisor_data.profile_picture
                              : profilePlacholder
                          }
                          hideNav={true}
                          isCompleted={isCompleted}
                          handleCompleted={() => setCompleted(false)}
                          hideControll={() => setHideControll(true)}
                          showControll={() => setHideControll(false)}
                          isProgress={true}
                        />
                      )}
                      {actibeTab === 6 && (
                        <>
                          <div
                            style={{
                              backgroundColor: formData.background_pattern,
                            }}
                            className="bg_color_con"
                          >
                            {bgId.map((item, index) => {
                              return (
                                <button
                                  key={"bg" + index}
                                  className={
                                    formData.background_colour === item.color
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      background_colour: item.color,
                                      background_pattern: item.bg,
                                    });
                                  }}
                                ></button>
                              );
                            })}
                          </div>
                        </>
                      )}
                      {!hideControll && (
                        <>
                          {actibeTab === 5 || actibeTab === 6 ? (
                            <h3 className="m-0">{item.title}</h3>
                          ) : (
                            ""
                          )}
                          <div className="loading-dots">
                            {dotsId.map((item, index) => {
                              return (
                                <button
                                  key={"dot" + index}
                                  onClick={() => setActibeTab(item)}
                                  className={
                                    "dot " +
                                    (actibeTab === item ? "active" : "")
                                  }
                                ></button>
                              );
                            })}
                          </div>
                          <div className="profile_progress_nav">
                            <button
                              onClick={() => {
                                setRemindLater(actibeTab);
                                setActibeTab(0);
                                setIsUnsaved(true);
                                update_web();
                              }}
                              className="remind_btn"
                            >
                              Remind Later
                            </button>
                            <div className="progress_nav">
                              <button
                                disabled={actibeTab === 1}
                                onClick={() => {
                                  update_web();
                                  setActibeTab(actibeTab - 1);
                                }}
                              >
                                <ArrowBackIcon />
                              </button>
                              <button
                                // disabled={actibeTab === 6}
                                onClick={() => {
                                  update_web();
                                  if (advisor_data.is_team_member) {
                                    if (actibeTab === 5) {
                                      // setIsUnsaved(true);
                                      setShowSuccess(true);
                                      setActibeTab(0);
                                      setRemindLater(6);
                                    } else {
                                      setActibeTab(actibeTab + 1);
                                    }
                                  } else {
                                    if (actibeTab === 6) {
                                      // setIsUnsaved(true);
                                      setShowSuccess(true);
                                      setActibeTab(0);
                                      setRemindLater(6);
                                    } else {
                                      setActibeTab(actibeTab + 1);
                                    }
                                  }
                                }}
                              >
                                <ArrowForwardIcon />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="loading-dots loading-dots-mobile">
                        {dotsId.map((item, index) => {
                          return (
                            <button
                              key={"dot" + index}
                              onClick={() => setActibeTab(item)}
                              className={
                                "dot " + (actibeTab === item ? "active" : "")
                              }
                            ></button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </BlurPopup>
        )}
      </div>
      {isUnsaved && (
        <BlurPopup onClose={() => setIsUnsaved(false)} openState={isUnsaved}>
          <div className="blurpopup_con_wrapper success_popup_con">
            <div className="success_popup">
              <h3>You have unsaved changes!</h3>
              <LazyLoadImage
                src={successImg}
                effect="blur"
                wrapperClassName="success_img"
              />
              <div className="success_popup_progress">
                <h5>{profile_percent}% of your profile is complete 🎉</h5>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${profile_percent}%` }}
                  ></div>
                </div>
              </div>
              <p>
                Press ‘Back’ to complete your profile, or ‘Save & exit’ to save
                already filled details and exit.
              </p>
              <div className="success_popup_btns">
                <button
                  onClick={() => {
                    setActibeTab(remindLater);
                    setIsUnsaved(false);
                  }}
                  className="btn-outline"
                >
                  <ArrowBackIcon /> Back
                </button>
                <button
                  onClick={() => {
                    setIsUnsaved(false);
                    update_web();
                    notify();
                  }}
                  className="btn-primary"
                >
                  <SaveIcon /> Save & exit
                </button>
              </div>
            </div>
          </div>
        </BlurPopup>
      )}
      {showSuccess && (
        <BlurPopup
          onClose={() => setShowSuccess(false)}
          openState={showSuccess}
        >
          <div className="blurpopup_con_wrapper success_popup_con">
            <div className="success_popup">
              <h3>
                {useLinkdin
                  ? "Successfully added LinkedIn information to your profile."
                  : "Wow! your business profile looks quite good."}{" "}
              </h3>
              <LazyLoadImage
                src={successImg}
                effect="blur"
                wrapperClassName="success_img"
              />
              {!useLinkdin && (
                <>
                  <div className="success_popup_progress">
                    <h5>{profile_percent}% of your profile is complete 🎉</h5>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${profile_percent}%` }}
                      ></div>
                    </div>
                  </div>
                  <p>
                    Add social media links, services, reviews, etc. to complete
                    your profile!
                  </p>
                </>
              )}

              <div
                style={useLinkdin ? { marginTop: 20 } : {}}
                className="success_popup_btns"
              >
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    update_web();
                    notify();
                  }}
                  className="btn-primary"
                >
                  <ThumbUpIcon /> Done
                </button>
              </div>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default ProfileProgress;
