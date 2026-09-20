import axios from "axios";
import { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import CloseIcon from "@mui/icons-material/Close";
import Loader from "../Loader/Loader";
import InputField from "../../Components/InputField/InputField";
import "./CalendarIntegration.scss";

const google_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_5_png.webp";
const outlook_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_4_png.webp";
const others_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_6_png.webp";

function CalendarIntegration(props) {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const [Loading, setLoading] = useState(false);
  const [isCallDev, setIsCallDev] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState(""); // 'google', 'outlook', 'other'
  const [error, setError] = useState(false);
  const [errorPermission, setErrorPermission] = useState(false);
  const [othersData, setOthersData] = useState({
    url: "",
    username: "",
    password: "",
    platform: "",
  });

  const isDisableOther =
    !othersData.password || !othersData.username || !othersData.platform;
  const url_outlook = window.location.href.split("?");
  const url_google = window.location.href.split("&");
  const isOutlook =
    url_google[1] && url_google[1].replace("state=", "") === "outlook";
  const REDIRECT_URL =
    props.redirectUri ||
    (props.isSchedule
      ? axios.defaults.baseURL + "/calendar"
      : axios.defaults.baseURL + "/people");
  const CLEANUP_PATH =
    props.cleanupPath || (props.isSchedule ? "/calendar" : "/people");

  // const REDIRECT_URL = props.isSchedule
  //   ? "http://localhost:4000/calendar"
  //   : "http://localhost:4000/people";
  const CALENDAR_REDIRECT_URL = process.env.REACT_APP_CALENDAR_REDIRECT_URL;
  const SCOPES = process.env.REACT_APP_CALENDAR_SCOPES;
  const GOOGLE_URL =
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=" +
    SCOPES +
    "&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=" +
    REDIRECT_URL +
    CALENDAR_REDIRECT_URL +
    "&prompt=consent";
  const client_id = "f83997d2-f3c2-4ad1-b57e-37383d5f82c0";
  const scope = "Mail.Send offline_access Calendars.ReadWrite User.Read Mail.Read Contacts.Read ";
  const state = "outlook";

  // useEffect(() => {
  //   let code = undefined;
  //   if (isOutlook) {
  //     if (url_outlook[1] !== undefined) {
  //       const code_outlook = url_outlook[1].split("&");
  //       code = code_outlook[0].replace("code=", "");
  //       generate_outlook_token(code);
  //     }
  //   } else {
  //     if (url_google[1] !== undefined) {
  //       let code = url_google[1].replace("code=", "");
  //       save_access_token(code);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
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
}, []);

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    othersData[name] = value;
    setOthersData({
      ...othersData,
    });
  };

  const redirect_outlook = () => {
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${REDIRECT_URL}&response_mode=query&scope=${encodeURIComponent(
      scope
    )}&state=${state}&prompt=consent`;
    window.location.assign(url);
  };

  const CalDavUser = () => {
    setLoading(true);
    const url = "api/caldav/CalDavUser/";
    axios
      .post(url, othersData, config)
      .then((_res) => {
        setLoading(false);
        setShowSuccess(true);
        setSuccessType("other");
        setError(false);
        setErrorPermission(false);
      })
      .catch((_err) => {
        setError(true);
        setShowSuccess(false);
        setLoading(false);
        setErrorPermission(false);
      });
  };

  const generate_outlook_token = (code) => {
    const url = "api/outlook/outlookToken/";
    const payload = {
      code: code,
      redirect_uri: REDIRECT_URL,
    };
    setLoading(true);
    axios
      .post(url, payload, config)
      .then((_res) => {
        setShowSuccess(true);
        setSuccessType("outlook");
        setError(false);
        setErrorPermission(false);
      })
      .catch((_err) => {
        setError(true);
        setShowSuccess(false);
        setErrorPermission(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const save_access_token = async (code) => {
    const url = "api/user/save_access_token/";
    const payload = {
      code: code,
      redirect_uri: REDIRECT_URL,
    };
    try {
      setLoading(true);
      await axios.post(url, payload, config);

      const tokenRes = await axios.post(
        "/api/user/get_access_token/",
        {},
        config
      );
      const google_access_token = tokenRes.data.google_access_token;
      const scopeRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${google_access_token}`
      );
      const scopes = scopeRes.data.scope || "";
      const hasCalendar = scopes.includes(
        "https://www.googleapis.com/auth/calendar"
      );
      const hasGmail = scopes.includes(
        "https://www.googleapis.com/auth/gmail.send"
      );

      if (!(hasCalendar && hasGmail)) {
        await axios.post("/api/user/revoke_token/", {}, config);
        setErrorPermission(true);
        setShowSuccess(false);
        setError(false);
        return;
      }
      setShowSuccess(true);
      setSuccessType("google");
      setError(false);
      setErrorPermission(false);
    } catch (_err) {
      setError(true);
      setShowSuccess(false);
      setErrorPermission(false);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div
      className={
        "calender_integration " +
        (props.isMail ? "calender_integration_mail" : "")
      }
    >
      {Loading && <Loader />}

      <button
        onClick={() => {
          window.history.pushState({}, "", CLEANUP_PATH);
          props.onClose();
        }}
        className="close_btn"
      >
        <CloseIcon />
      </button>

      <h3>
        {showSuccess ? (
          <>
            {successType === "other"
              ? "CalDAV"
              : successType === "outlook"
              ? "Outlook"
              : "Google"}{" "}
            is connected
          </>
        ) : (
          "Add account"
        )}
      </h3>

      {props.isSchedule && <h5>Add your mailbox & calendar account first</h5>}

      {error ? (
        <div className="calendar_integration_sucesss">
          <h5>Something went wrong. Please try again.</h5>
        </div>
      ) : showSuccess ? (
        <div className="calendar_integration_sucesss">
          <h5>
            {successType === "other"
              ? "CalDAV successfully integrated."
              : successType === "outlook"
              ? "Outlook successfully integrated."
              : "Google successfully integrated."}
          </h5>
          <img
            src={
              successType === "other"
                ? others_icon
                : successType === "outlook"
                ? outlook_icon
                : google_icon
            }
            alt="integration success icon"
            loading="lazy"
          />
        </div>
      ) : (
        <>
          <p className="booking_integration_text">
            One email account for both calendar & mailbox
          </p>
          <div className="booking_integration_calendar">
            <span>
              {props.isSchedule ? "Select your account" : "Sync your calendar"}
            </span>
            <div className="booking_integration_calendar_btns">
              <button
                onClick={() => {
                  window.location.assign(GOOGLE_URL);
                }}
                disabled={Loading}
              >
                <img src={google_icon} alt="google icon" loading="lazy" />
                Google
              </button>
              <button
                onClick={() => {
                  redirect_outlook();
                }}
                disabled={Loading}
              >
                <img src={outlook_icon} alt="outlook icon" loading="lazy" />
                Outlook
              </button>
              <button
                className={isCallDev ? "active" : ""}
                onClick={() => setIsCallDev(true)}
                disabled={Loading}
              >
                <img src={others_icon} alt="others icon" loading="lazy" />
                Other
              </button>
            </div>
            {errorPermission && (
              <div
                className="calendar-error"
                style={{ margin: "12px 0 -4px 0" }}
              >
                <span
                  style={{
                    color: "red",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  You must have missed either of the consents. Make sure you
                  checked both the boxes. Click on “Allow both mail & calendar”
                  to provide consent for both.
                </span>
              </div>
            )}
            {isCallDev && (
              <>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    // marginTop: "4px",
                    // marginBottom: "-4px",
                  }}
                >
                  <strong>Note:</strong> We currently support only{" "}
                  <strong>iCloud</strong>, <strong>Webnames</strong>, and{" "}
                  <strong>Zoho.</strong>
                </p>
                <select
                  value={othersData.platform}
                  className="calednar_input"
                  onChange={(e) => {
                    setOthersData({
                      ...othersData,
                      platform: e.target.value,
                    });
                  }}
                >
                  <option value="">
                    Select your email and calendar provider
                  </option>
                  <option value="icloud">iCloud</option>
                  <option value="webnames">Webnames</option>
                  <option value="zoho">Zoho</option>
                </select>
                <InputField
                  name="username"
                  label="Enter your email/username"
                  type="text"
                  className="calednar_input"
                  onChange={handleChange}
                  value={othersData.username || ""}
                />

                <InputField
                  name="password"
                  label="Enter your password"
                  type="password"
                  className="calednar_input"
                  onChange={handleChange}
                  value={othersData.password || ""}
                />
                {othersData.platform === "zoho" && (
                  <InputField
                    name="url"
                    label="Enter your calendar URL"
                    type="text"
                    className="calednar_input"
                    onChange={handleChange}
                    value={othersData.url || ""}
                  />
                )}
              </>
            )}
          </div>
          <p className="booking_integration_text booking_integration_text2">
            By tapping onto any of the above account types you would agree to
            NSG’s Terms & conditions
          </p>
        </>
      )}

      {(showSuccess || error || isCallDev) && (
        <div className="booking_integration_submit">
          <button
            onClick={() => {
              props.onClose();
              if (showSuccess && props.onComplete) {
                props.onComplete();
                return;
              }
              window.history.pushState({}, "", CLEANUP_PATH);
            }}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (showSuccess) {
                props.onClose();
                if (props.onComplete) {
                  props.onComplete();
                  return;
                }
                window.history.pushState({}, "", CLEANUP_PATH);
              } else if (isCallDev && !Loading) {
                CalDavUser();
              }
            }}
            disabled={isCallDev && (isDisableOther || Loading)}
            className="btn-primary"
          >
            {!Loading ? (
              showSuccess ? (
                "Done"
              ) : (
                "Connect"
              )
            ) : (
              <ThreeDots
                height="25"
                width="60"
                radius="9"
                color="white"
                ariaLabel="three-dots-loading"
              />
            )}
          </button>
        </div>
      )}
       
    </div>
  );
}

export default CalendarIntegration;
