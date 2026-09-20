import axios from "axios";
import  { lazy, useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import Swal from "sweetalert2";
import copy from "copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import Toast from "../../../Components/Toast/Toast";
import "./SyncAndIntegration.scss";
import calendar from "./img/calendar.svg";

const CalendarIntegration = lazy(() =>
  import("../../../Components/CalendarIntegration/CalendarIntegration.jsx")
);
const BlurPopup = lazy(() => import("../../../Components/BlurPopup/BlurPopup"));

const REDIRECT_URL = axios.defaults.baseURL + "/calendar";
  //  const REDIRECT_URL = "http://localhost:4000/calendar";
const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
};
const google_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/google_png.webp";
const outlook_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_4_png.webp";

function SyncAndIntegration(props) {
  const isOnboarding = props.isOnboarding;
  const oauthRedirectUrl = props.oauthRedirectPath
    ? `${window.location.origin}${props.oauthRedirectPath}`
    : REDIRECT_URL;
  const cleanUrlAfterOAuth = props.oauthRedirectPath || "/calendar";
  const [calendarData, setCalendarData] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [PermissionError, setPermissionError] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [Loading2, setLoading2] = useState(false);
  const [showInteg, setShowInteg] = useState();
  const [showRemove, setShowRemove] = useState(false);
  const [meet_link, setMeet_link] = useState("");
  const [MeetLink, setMeetLink] = useState({
    google_meet: false,
    personal_meet: false,
    is_google_integrated: false,
  });
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  const url_outlook = window.location.href.split("?");
  const url_google = window.location.href.split("&");
  const isGoogle = calendarData.platform === "google";
  const isOutlook =
    url_google[1] && url_google[1].replace("state=", "") === "outlook";

  const handleOnboardingComplete = () => {
    if (props.onComplete) {
      props.onComplete();
      return;
    }
    if (props.redirectPathOnComplete) {
      window.location.href = props.redirectPathOnComplete;
    }
  };

  useEffect(() => {
    get_access_token();
    get_advisor();
    triggerSave();
    meet_link_app();
  }, []);

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

  const triggerSave = () => {
    // let code = undefined;
    // if (isOutlook) {
    //   if (url_outlook[1] !== undefined) {
    //     const code_outlook = url_outlook[1].split("&");
    //     code = code_outlook[0].replace("code=", "");
    //     generate_outlook_token(code);
    //   }
    // } else {
    //   if (url_google[1] !== undefined) {
    //     let code = url_google[1].replace("code=", "");
    //     save_access_token(code);
    //   }
    // }
    const params = new URLSearchParams(window.location.search);

  const code = params.get("code");
  const state = params.get("state");
  console.log("code state", code, state, window.location.search);
  

  if (!code) return;

  if (state === "outlook") {
    generate_outlook_token(code);
  } else {
    save_access_token(code);
  }
  };

  const get_advisor = () => {
    axios
      .post("/api/user_profile/get_user/", {}, config)
      .then((res) => {
        setMeet_link(res.data.meet_url);
      })
      .catch((err) => console.log("Error:", err));
  };

  const get_access_token = () => {
    const url = "api/user/get_access_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setCalendarData(res.data);
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        get_google_token_info(google);
        if (google || outlook || other) {
          setCalendarAdded(true);
        } else {
          setCalendarAdded(false);
        }
      })
      .catch((err) => setCalendarAdded(false));
  };

  const get_google_token_info = (google_access_token) => {
    const url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${google_access_token}`;
    const calendar = "https://www.googleapis.com/auth/calendar";
    const gmail = "https://www.googleapis.com/auth/gmail.send";
    const userinfo = "https://www.googleapis.com/auth/userinfo.email";
    axios
      .post(url)
      .then((res) => {
        let scope = res.data.scope;
        let hasCalendar = scope.includes(calendar);
        let hasGmail = scope.includes(gmail);
        let hasUserinfo = scope.includes(userinfo);
        if (hasCalendar && hasGmail && hasUserinfo) {
          setPermissionError(false);
        } else {
          setPermissionError(true);
          revoke_calendar(true);
        }
      })
      .catch((err) => console.log("res", err));
  };

  const save_access_token = (code) => {
    const url = "api/user/save_access_token/";
    const payload = {
      code: code,
      redirect_uri: oauthRedirectUrl,
    };
    axios
      .post(url, payload, config)
      .then(() => {
        setToastText({
          ...ToastText,
          text: "Calendar added successfully",
          show: true,
        });
        get_access_token();
        props.get_access_token?.();
        meet_link_app();
        updateAdvisor("", true, false);
        window.history.pushState({}, "", cleanUrlAfterOAuth);
        if (isOnboarding) {
          handleOnboardingComplete();
        }
      })
      .catch((err) => {
        window.history.pushState({}, "", cleanUrlAfterOAuth);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: true,
        });
      });
  };

  const generate_outlook_token = (code) => {
    const url = "api/outlook/outlookToken/";
    const payload = {
      code: code,
      redirect_uri: oauthRedirectUrl,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setToastText({
          ...ToastText,
          text: "Calendar added successfully",
          show: true,
        });
        get_access_token();
        props.get_access_token?.();
        meet_link_app();
        window.history.pushState({}, "", cleanUrlAfterOAuth);
        if (isOnboarding) {
          handleOnboardingComplete();
        }
      })
      .catch((err) => {
        window.history.pushState({}, "", cleanUrlAfterOAuth);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: true,
        });
      });
  };

  const revoke_calendar = (noLoading) => {
    setLoading(true);
    const url = "api/user/revoke_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        if (!noLoading) {
          setToastText({
            ...ToastText,
            text: "Calendar removed successfully",
            show: true,
          });
        }
        get_access_token();
        props.get_access_token?.();
        setLoading(false);
        updateAdvisor(meet_link, false, false);
        setShowRemove(false);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: true,
        });
        setLoading(false);
      });
  };

  const meet_link_app = () => {
    const url = "/api/user/meet_link_app/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let has_meet_link = res.data.has_meet_link;
        let is_google_integrated = res.data.is_google_integrated;
        let is_google_meet = res.data.is_google_meet;
        setMeetLink({
          google_meet: is_google_meet,
          personal_meet: has_meet_link,
          is_google_integrated: is_google_integrated,
        });
      })
      .catch((err) => console.log("err", err));
  };

  const updateAdvisor = (meet_link, is_google_meet, showLoading) => {
    if (showLoading) {
      setLoading2(true);
    }
    const url = "api/user_profile/update_user/";
    let payload = {
      meet_url: meet_link,
      is_google_meet: is_google_meet,
    };
    axios
      .post(url, payload, config)
      .then(() => {
        if (showLoading) {
          setToastText({
            ...ToastText,
            text: "Meeting link saved successfully",
            show: true,
          });
        }
        meet_link_app();
        get_advisor();
        setLoading2(false);
        $("#meet-error").text("");
      })
      .catch((err) => {
        setLoading2(false);
        $("#meet-error").text(err.response.data.message);
      });
  };

  const calendarIcon = calendarData.google_access_token
    ? google_icon
    : calendarData.outlook_access_token
    ? outlook_icon
    : calendar;

  return (
    <div
      className={
        "sync_integ_con " + (isOnboarding ? "sync_integ_con_onboarding" : "")
      }
    >
      {ToastText.show && <Toast text={ToastText.text} />}
      {calendarAdded ? (
        <>
          <div className="sync_integ_card sync_integ_card_added">
            <div>
              <h5>
                <img src={calendarIcon} alt="Calendar" />
                Account is added
              </h5>
              <p>{calendarData.user_mail}</p>
            </div>
            <button
              onClick={() => {
                setShowRemove(true);
              }}
              className="btn-outline"
            >
              Remove
            </button>
          </div>
          <div className="sync_integ_card">
            <div className="sync_integ_card_account">
              {isGoogle && (
                <>
                  <div
                    className={
                      "calendar_manage_btn " +
                      (!MeetLink.is_google_integrated
                        ? "calendar_manage_btn_disabled"
                        : "")
                    }
                  >
                    <h5>Default meeting link</h5>
                    <label className="switch">
                      <input
                        checked={MeetLink.google_meet}
                        onChange={(e) => {
                          if (MeetLink.is_google_integrated) {
                            if (e.target.checked) {
                              setMeetLink({
                                ...MeetLink,
                                google_meet: e.target.checked,
                                personal_meet: false,
                              });
                              updateAdvisor("", true, false);
                            } else {
                              setMeetLink({
                                ...MeetLink,
                                google_meet: false,
                              });
                              updateAdvisor("", false, false);
                            }
                          }
                        }}
                        type="checkbox"
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <p>Google meet</p>
                  <hr />
                </>
              )}
              <div
                style={{ transition: ".2s" }}
              >
                <div className="calendar_manage_btn">
                  <h5>
                    Add your personal meeting link {isGoogle && "(optional)"}{" "}
                  </h5>
                  {isGoogle && (
                    <label className="switch">
                      <input
                        checked={MeetLink.personal_meet}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMeetLink({
                              ...MeetLink,
                              google_meet: false,
                              personal_meet: e.target.checked,
                            });
                          } else {
                            setMeetLink({
                              ...MeetLink,
                              personal_meet: e.target.checked,
                            });
                            setMeet_link("");
                            updateAdvisor("", false, false);
                          }
                        }}
                        type="checkbox"
                      />
                      <span className="slider round"></span>
                    </label>
                  )}
                </div>
                <p>
                  Add zoom, webex or any other meeting link for video
                  conferencing. Your contacts will receive this link when you
                  book any meeting with them.
                </p>
                <div className="sync_integ_card_wrapper">
                  <input
                    value={meet_link}
                    onChange={(e) => setMeet_link(e.target.value)}
                    type="text"
                    placeholder="Enter meeting link"
                  />
                  {meet_link && (
                    <>
                      <button
                        onClick={() => {
                          copy(meet_link);
                          setToastText({
                            ...ToastText,
                            text: "Meeting link copied",
                            show: true,
                          });
                        }}
                        className="copy_btn"
                      >
                        <ContentCopyIcon className="icon" />
                      </button>
                      <button
                        onClick={() => {
                          updateAdvisor("", false, false);
                          setToastText({
                            ...ToastText,
                            text: "Meeting link removed",
                            show: true,
                          });
                        }}
                        className="copy_btn"
                      >
                        <DeleteForeverOutlinedIcon className="delete_con" />
                      </button>
                    </>
                  )}
                  <button
                    disabled={!meet_link}
                    onClick={() => updateAdvisor(meet_link, false, true)}
                    className="btn-primary"
                  >
                    {!Loading2 ? (
                      "Save"
                    ) : (
                      <ThreeDots
                        height="25"
                        width="50"
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
                <p className="error" id="meet-error"></p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="sync_integ_card">
          <h5>First add an account with both mailbox & calendar service</h5>
          <p>
            By adding an account you will be able to schedule meetings & send
            mails to your contacts from NSG, yet access & get notified in
            your mailbox & calendar directly.
          </p>
          <button onClick={() => setShowInteg(true)} className="btn-primary">
            {PermissionError ? "Allow both mail & calendar" : "Add account"}
          </button>

          {PermissionError ? (
            <p className="error">
              You must have missed either of the consents. Make sure you checked
              both the boxes. Click on “Allow both mail & calendar” to provide
              consent for both.
            </p>
          ) : (
            <p>
              Important note: Many of our customers skips at least check box
              while providing consent. Make sure you provide consent for both
              mail & calendar services.
            </p>
          )}
        </div>
      )}
      {isOnboarding && (
        <div className="sync_integ_onboarding_actions">
          <button className="btn-outline" onClick={props.onSkip}>
            I&apos;ll add it later
          </button>
          <button
            className="btn-primary"
            onClick={handleOnboardingComplete}
            disabled={!calendarAdded}
          >
            Continue
          </button>
        </div>
      )}
      {showInteg && (
        <BlurPopup onClose={() => setShowInteg(false)} openState={showInteg}>
          <div className="blurpopup_con_wrapper sync_integ_popup_wrapper">
            <CalendarIntegration
              onClose={() => setShowInteg(false)}
              isSchedule={true}
              isOnboarding={isOnboarding}
              redirectUri={oauthRedirectUrl}
              cleanupPath={cleanUrlAfterOAuth}
              onComplete={isOnboarding ? handleOnboardingComplete : undefined}
            />
          </div>
        </BlurPopup>
      )}
      {showRemove && (
        <BlurPopup onClose={() => setShowRemove(false)} openState={showRemove}>
          <div className="blurpopup_con_wrapper sync_integ_remove">
            <h2>Account</h2>
            <h3>Are you sure you want to permanently remove the account?</h3>
            <div className="sync_integ_remove_btn">
              <button
                className="btn-outline"
                onClick={() => {
                  setShowRemove(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => revoke_calendar(false)}
              >
                {!Loading ? (
                  "Remove"
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
        </BlurPopup>
      )}
    </div>
  );
}

export default SyncAndIntegration;
