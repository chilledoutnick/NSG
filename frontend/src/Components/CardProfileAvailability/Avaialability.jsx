import React, { useState, useEffect, useRef } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import "./Avaialability.scss";
import Availability from "../Availability/Availability";
import "../Availability/Availability.scss";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import { useStore } from "../../store/advisorStore";
import { useNavigate } from "react-router-dom";

const google =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/iconCal_png.webp";

const CLIENT_ID = process.env.REACT_APP_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CALENDAR_CLIENT_SECRET;
const CALENDAR_REDIRECT_URL = process.env.REACT_APP_CALENDAR_REDIRECT_URL;
const SCOPES = process.env.REACT_APP_CALENDAR_SCOPES;
// const REDIRECT_URL = "http://localhost:4000/card";
const REDIRECT_URL = axios.defaults.baseURL + "/card";
const GOOGLE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=" +
  SCOPES +
  "&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=" +
  REDIRECT_URL +
  CALENDAR_REDIRECT_URL +
  "&prompt=consent";

function Avaialability(props) {
  const navigate = useNavigate();
  const { get_advisor_data } = useStore();
  const [loading, setloading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState(props.isAdmin === true ? 2 : 1);
  const [meet_links, setMeet_links] = useState("");
  const [isSchedule, setIsSchedule] = useState(false);
  const [refresh_token, setRefresh_token] = useState("");
  const [error, setError] = useState("");

  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${props_token}`,
    },
  };
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;

  useEffect(() => {
    if (props.advisor.scheduling !== undefined) {
      setIsSchedule(props.advisor.scheduling);
      setMeet_links(props.advisor.meet_url);
    }
  }, [props.advisor]);

  useEffect(() => {
    get_refresh_token();
    const url = window.location.href.split("&");
    if (url[1] !== undefined) {
      let code = url[1].replace("code=", "");
      generate_refresh_token(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revoke_token = () => {
    const url = "https://oauth2.googleapis.com/token";
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        axios
          .post(
            "https://oauth2.googleapis.com/revoke?token=" + res.access_token
          )
          .then((res) => console.log("res", res))
          .catch((err) => console.log("err", err));
      });
  };

  const get_refresh_token = () => {
    const url = "api/user/get_access_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setRefresh_token(res.data.refresh_token);
      })
      .catch((err) => console.log("err", err));
  };

  const generate_refresh_token = (code) => {
    const url = "https://oauth2.googleapis.com/token";
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URL,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        save_access_token(res.refresh_token);
      })
      .catch((err) => console.log("err", err));
  };

  const save_access_token = (refresh_token) => {
    const url = "api/user/save_access_token/";
    const payload = {
      refresh_token: refresh_token,
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
        get_refresh_token();
        setShowPopup(true);
      })
      .catch((err) => console.log("err", err));
  };

  const delete_google_token = () => {
    const url = "api/user/delete_google_tokens/";
    axios
      .delete(url, config)
      .then(() => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setRefresh_token("");
      })
      .catch((err) => console.log("err", err));
  };

  const update_web = (schedule) => {
    const formData = new FormData();
    formData.append("scheduling", schedule);
    // const url = "api/advisor/update_web/";
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then(() => {
        if (props.isAdmin) {
          props.get_data();
        } else {
          get_advisor_data();
        }
      })
      .catch((err) => console.log("err", err));
  };

  const update_meet = () => {
    setloading(true);
    let payload = {
      meet_url: meet_links,
    };
    // const url = "api/advisor/update_web/";
    const url = "api/user_profile/update_user/";
    axios
      .post(url, payload, config)
      .then(() => {
        setError("");
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setloading(false);
      })
      .catch((err) => {
        setError(err.response.data.message);
        setloading(false);
      });
  };

  return (
    <>
      <Dialog
        open={showPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopup(false)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Scheduling</h4>
          </div>
          <div className="schedules_content">
            <div className="schedule_content_btn">
              <p>
                Enable NSG scheduling with integration of your Google
                Calendar, along with automated email communication.
              </p>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  size={"xl"}
                  id="flexSwitchCheckDefault"
                  checked={isSchedule}
                  onChange={(e) => {
                    setIsSchedule(e.target.checked);
                    update_web(e.target.checked);
                  }}
                />
              </div>
            </div>
            {isSchedule && (
              <div className="schedule_content_bottom">
                <div className="schedule_bottom_btn">
                  {!props.isAdmin && (
                    <button
                      onClick={() => setActiveTab(1)}
                      className={activeTab === 1 ? "active" : ""}
                    >
                      Calendar
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab(2)}
                    className={activeTab === 2 ? "active" : ""}
                  >
                    Meeting link
                  </button>
                  <button
                    onClick={() => setActiveTab(3)}
                    className={activeTab === 3 ? "active" : ""}
                  >
                    Availability
                  </button>
                </div>
                <div className="schedule_bottom_btn_content">
                  {activeTab === 1 && (
                    <div className="schedules_content_calendar">
                      <p>
                        <img src={google} loading="lazy" alt="google" />{" "}
                        <span>Connect</span> with Google Calendar
                      </p>
                      {refresh_token === "" ? (
                        <button
                          onClick={() => window.location.assign(GOOGLE_URL)}
                          className="btn-primary"
                        >
                          Add Google Calendar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            delete_google_token();
                            revoke_token();
                          }}
                          className="btn-primary"
                        >
                          Logout Google Calendar
                        </button>
                      )}
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div className="schedules_content_meet">
                      <h4>Personal meeting link</h4>
                      <p>All your meetings will be redirected to this URL</p>
                      <input
                        type="text"
                        placeholder="Insert your meeting link here"
                        value={meet_links}
                        onChange={(e) => setMeet_links(e.target.value)}
                      />
                      {error && <p className="error mt-2">{error}</p>}
                      <button onClick={update_meet} className="btn-primary">
                        {!loading ? (
                          "Save & Continue"
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
                  )}
                  {activeTab === 3 && (
                    <div className="schedules_content_avaialability">
                      <Availability
                        token={props_token}
                        isAdmin={props.isAdmin}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <h2>Add Availability</h2>
      <button onClick={() => navigate("/calendar")} className="profile_edit_btn">
        <ModeEditOutlineOutlinedIcon className="icon" />
        {props.advisor.scheduling ? "Edit" : "Add"}
      </button>
      {isSchedule && (
        <button
          onClick={() => {
            navigate("/calendar");
          }}
          className="schedule_content"
        >
          <img src={props.advisor.profile_picture} alt="profile" />
          <p>Add Availablity</p>
          <span></span>
        </button>
      )}
    </>
  );
}

export default Avaialability;
