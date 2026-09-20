import axios from "axios";
import { useState, useEffect, lazy } from "react";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import moment from "moment";
import dayjs from "dayjs";
import copy from "copy-to-clipboard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import EventIcon from "@mui/icons-material/Event";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BeenhereOutlinedIcon from "@mui/icons-material/BeenhereOutlined";
import PersonIcon from "@mui/icons-material/Person";
import Toast from "../../../Components/Toast/Toast";
import "./Timeline.scss";
import momentTz from "moment-timezone";
import SendEmail from "../../../Components/SendEmail/SendEmail";

const BlurPopup = lazy(() => import("../../../Components/BlurPopup/BlurPopup"));
const BookingIntegration = lazy(
  () => import("../../../Components/BookingIntegration/BookingIntegration"),
);
const NoteAndReminder = lazy(
  () => import("../../../Components/NoteAndReminder/NoteAndReminder"),
);

const square_icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <rect
      x="0.5"
      y="0.5"
      width="11"
      height="11"
      fill="#FFF8EC"
      stroke="#FEBD59"
      strokeDasharray="2 2"
    />
  </svg>
);

const image =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/clean_png.webp";

function Timeline(props) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [TimelineData, setTimelineData] = useState([]);
  const [timeZone, setTimeZone] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [directEmail, setdirectEmail] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  // const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailData, setEmailData] = useState({ subject: "", body: "" });
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });

  const [popupState, setPopupState] = useState({
    showCancel: false,
    showReschedule: false,
    showEditContact: false,
    showDeleteContact: false,
  });

  const updatePopupState = (key, value) => {
    setPopupState((prevState) => ({ ...prevState, [key]: value }));
  };

  const [state, setState] = useState({
    showBookingPopup: null,
    showCallPopup: null,
    showNotePopup: false,
  });

  const togglePopup = (key, id) => {
    setState((prevState) => ({
      ...prevState,
      [key]: prevState[key] === id ? null : id, // Toggle the popup for the specific item
    }));
  };
  const handleDirectSend = (suggestion) => {
    console.log("Timeline handleDirectSend called", directEmail);

    let lines = suggestion.message.split("\n");

    if (lines[0].trim().match(/^Hi\s+/i)) {
      lines.shift();
      if (lines[0]?.trim() === "") lines.shift();
    }

    const signatureKeywords =
      /^(best|regards|warm regards|sincerely|thanks|cheers)/i;
    let signatureIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (signatureKeywords.test(lines[i].trim())) {
        signatureIndex = i;
        break;
      }
    }
    if (signatureIndex !== -1) lines = lines.slice(0, signatureIndex);
    while (lines.length > 0 && lines[lines.length - 1].trim() === "")
      lines.pop();

    // ← State set karo, component render hoga JSX mein
    setEmailData({
      subject: suggestion.subject,
      body: lines.join("\n").trim(),
    });
    setShowEmailPopup(true);
  };

  const get_followup_suggestions = async (contact_id) => {
    if (props.isShowPotential || !contact_id) return;

    try {
      const res = await axios.post(
        // ← await add kiya
        "api/contact/followup_suggestions/",
        { contact_id },
        config,
      );
      console.log("get_followup_suggestions", res.data);

      const firstSuggestion = res.data.intents?.[0]?.suggestions?.[0] || null; // ← [0] add kiya
      setSuggestions(firstSuggestion);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  useEffect(() => {
    const selectedContactId = props.selectedPeople?.contact_id;
    const selectedPotentialContactId =
      props.selectedPeople?.potential_contact_id || selectedContactId;

    get_timeline(
      props.isShowPotential ? selectedPotentialContactId : selectedContactId,
    );
    get_followup_suggestions(selectedContactId);
  }, [
    props.selectedPeople?.contact_id,
    props.selectedPeople?.potential_contact_id,
    props.isShowPotential,
    props.noteAdded,
  ]);

  const get_timeline = (contact_id) => {
    if (!contact_id) return;

    const url = "api/timeline/get_timeline/";
    const payload = props.isShowPotential
      ? { potential_contact_id: contact_id }
      : { contact_id: contact_id };
    axios
      .post(url, payload, config)
      .then((res) => {
        setTimelineData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching timeline data", err);
      });
  };

  useEffect(() => {
    timeZoneGenerate();
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

  const timeZoneGenerate = () => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName = Intl.DateTimeFormat(undefined, options2).format(
      new Date(),
    );
    const timeZoneAbbreviation = userTimeZoneName.split(",")[1];

    setTimeZone(timeZoneAbbreviation);
  };

  const cancel_appointment = (appointment) => {
    let localDate = dayjs(appointment.timestamp).format("YYYY-MM-DD");
    let localTime = moment(appointment.timestamp, "HH:mm:ss").format("LT");
    setSubmitLoading(true);
    const url = "api/user_appointment/cancel_appointment/";
    const payload = {
      appointment_id: appointment.appointment_id,
      timezone_name: localTime + " " + localDate + timeZone,
      timezone: momentTz.tz.guess(),
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setSubmitLoading(false);
        get_timeline(props.selectedPeople.contact_id);
      })
      .catch((err) => {
        console.error("Error fetching timeline data", err);
        setSubmitLoading(false);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const delete_note_reminder = (id) => {
    setSubmitLoading(true);
    const url = "api/note_reminder/delete_note_reminder/";
    const payload = {
      note_reminder_id: id,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setSubmitLoading(false);
        get_timeline(props.selectedPeople.contact_id);
        updatePopupState("showDeleteContact", false);
        setState({
          ...state,
          showNotePopup: false,
        });
      })
      .catch((err) => {
        console.error("Error fetching delete_note_reminder data", err);
        setSubmitLoading(false);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const renderTimelineItem = (item, index) => {
    const {
      action_type,
      timestamp,
      meeting_details,
      note_reminder,
      email,
      call,
      icon,
    } = item;
    const itemId = timestamp + action_type;

    switch (action_type) {
      case "schedule_meeting":
      case "reschedule_meeting":
        const isAfter = moment(meeting_details?.timestamp).isAfter(moment());
        return (
          <div
            className={
              "timeline_item schedule_meeting " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "schedule_meeting"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                <EventIcon className="timeline_icon" />
                {isAfter ? (
                  <h6>Upcoming Meeting</h6>
                ) : (
                  <h6 className="bg_gray">Past meeting</h6>
                )}
              </div>
              <div className="timeline_item_top_right">
                <span className={!isAfter ? "color_gray" : ""}>
                  {moment(timestamp).format("MMM Do")}
                </span>
                <button
                  className={props.isShowArchived ? "btn_gray" : ""}
                  onClick={() => {
                    if (!props.isShowArchived) {
                      togglePopup("showBookingPopup", itemId);
                    }
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="timeline_item_content">
              <p>
                {action_type === "reschedule_meeting"
                  ? "Rescheduled"
                  : "Booked"}{" "}
                a meeting for {meeting_details?.duration} minutes at{" "}
                {moment(meeting_details?.timestamp).format("LT, Do MMM YYYY")}
              </p>
              <p>
                using{" "}
                <a
                  href={meeting_details?.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meet Link.
                </a>
              </p>
              <p>Subject: {meeting_details?.Subject || meeting_details?.subject}</p>
            </div>
            {state.showBookingPopup === itemId && (
              <div className="timeline_item_popup">
                <button
                  onClick={() => updatePopupState("showReschedule", true)}
                >
                  <CalendarMonthOutlinedIcon className="icon" />
                  Reschedule
                </button>
                <button onClick={() => updatePopupState("showCancel", true)}>
                  <DeleteForeverOutlinedIcon className="icon" /> Cancel meeting
                </button>
              </div>
            )}
            {state.showBookingPopup === itemId && popupState.showCancel && (
              <BlurPopup
                onClose={() => updatePopupState("showCancel", false)}
                openState={popupState.showCancel}
              >
                <div className="blurpopup_con_wrapper cancel_popup">
                  <h5>You are cancelling the booking.</h5>
                  <img src={image} alt="user" />
                  <div className="cancel_popup_btn">
                    <button
                      onClick={() => updatePopupState("showCancel", false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        cancel_appointment(meeting_details);
                      }}
                      className="btn-primary"
                    >
                      {!submitLoading ? (
                        "Yes, cancel"
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
                </div>
              </BlurPopup>
            )}
            {state.showBookingPopup === itemId && popupState.showReschedule && (
              <BlurPopup
                onClose={() => updatePopupState("showReschedule", false)}
                openState={popupState.showReschedule}
                ComponentClass="booking_integration_popup"
              >
                <div className="blurpopup_con_wrapper booking_integration_popup_wrapper">
                  <BookingIntegration
                    onClose={() => updatePopupState("showReschedule", false)}
                    selectedPeople={props.selectedPeople}
                    appointment={meeting_details}
                    get_timeline={() => {
                      get_timeline(props.selectedPeople.contact_id);
                      updatePopupState("showReschedule", false);
                      setState({
                        ...state,
                        showBookingPopup: false,
                      });
                    }}
                  />
                </div>
              </BlurPopup>
            )}
          </div>
        );

      case "delete_meeting":
        return (
          <div
            className={
              "timeline_item delete_meeting " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "delete_meeting"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                <EventIcon className="timeline_icon" />
                <h6 className="bg_gray">Meeting canceled</h6>
              </div>
              <div className="timeline_item_top_right">
                <span>{moment(timestamp).format("MMM Do")}</span>
                <button className="btn_gray">
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="timeline_item_content">
              <p>
                Booked a meeting at{" "}
                {moment(meeting_details.timestamp).format("LT, Do MMM YYYY")}
              </p>
              <p>
                <a
                  href={meeting_details?.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meet Link.
                </a>
              </p>
              <p>Subject: {meeting_details?.Subject || meeting_details?.subject}</p>
            </div>
          </div>
        );

      case "call":
        return (
          <div
            className={
              "timeline_item timeline_call " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "call"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                <CallOutlinedIcon className="timeline_icon" />
                <h6>Call made | {call}</h6>
              </div>
              <div className="timeline_item_top_right">
                <span>{moment(timestamp).format("MMM Do")}</span>
                <button
                  className={props.isShowArchived ? "btn_gray" : ""}
                  onClick={() => {
                    if (!props.isShowArchived) {
                      togglePopup("showCallPopup", itemId);
                    }
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
              {state.showCallPopup === itemId && (
                <div className="timeline_item_popup">
                  <button
                    onClick={() => {
                      window.location.href = `tel:${call}`;
                      setState({
                        ...state,
                        showCallPopup: false,
                      });
                    }}
                  >
                    <CallOutlinedIcon className="icon" />
                    Call again
                  </button>
                  <button
                    onClick={() => {
                      copy(call);
                      setToastText({
                        ...ToastText,
                        text: "Number copied",
                        show: true,
                      });
                      setState({
                        ...state,
                        showCallPopup: false,
                      });
                    }}
                  >
                    <ContentCopyOutlinedIcon className="icon" /> Copy number
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "note_reminder":
        return (
          <div
            className={
              "timeline_item note_reminder " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "note_reminder"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                {/* <span>{square_icon}</span> */}
                <EditNoteIcon className="timeline_icon" />
                {note_reminder.text && <h6>Note</h6>}
                {note_reminder.datetime && <h6>Upcoming reminder</h6>}
              </div>
              <div className="timeline_item_top_right">
                <span>{moment(timestamp).format("MMM Do")}</span>
                <button
                  className={props.isShowArchived ? "btn_gray" : ""}
                  onClick={() => {
                    if (!props.isShowArchived) {
                      togglePopup("showNotePopup", itemId);
                    }
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="timeline_item_content">
              {note_reminder?.text && <p>{note_reminder?.text}</p>}
              {note_reminder?.image?.map((img, idx) => (
                <img key={idx} src={img} alt={`Note ${idx}`} />
              ))}
              {note_reminder.datetime && (
                <span>
                  Reminder set{" "}
                  {moment(note_reminder?.datetime).format("LT, Do MMM, YYYY")}
                </span>
              )}
            </div>
            {state.showNotePopup === itemId && (
              <div className="timeline_item_popup">
                <button
                  onClick={() => updatePopupState("showEditContact", true)}
                >
                  <EditOutlinedIcon className="icon" />
                  Edit
                </button>
                <button
                  onClick={() => updatePopupState("showDeleteContact", true)}
                >
                  <DeleteForeverOutlinedIcon className="icon" /> Delete
                </button>
              </div>
            )}
            {state.showNotePopup === itemId && popupState.showDeleteContact && (
              <BlurPopup
                onClose={() => updatePopupState("showDeleteContact", false)}
                openState={popupState.showDeleteContact}
              >
                <div className="blurpopup_con_wrapper cancel_popup">
                  <h5>Do you really want to delete the note?</h5>
                  <img src={image} alt="user" />
                  <div className="cancel_popup_btn">
                    <button
                      onClick={() =>
                        updatePopupState("showDeleteContact", false)
                      }
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        delete_note_reminder(note_reminder?.id);
                      }}
                      className="btn-primary"
                    >
                      {!submitLoading ? (
                        "Yes, delete"
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
                </div>
              </BlurPopup>
            )}
            {state.showNotePopup === itemId && popupState.showEditContact && (
              <BlurPopup
                onClose={() => updatePopupState("showEditContact", false)}
                openState={popupState.showReschedule}
              >
                <div className="blurpopup_con_wrapper note_and_reminder_popup">
                  <NoteAndReminder
                    handleCLose={() => {
                      updatePopupState("showEditContact", false);
                      setState({
                        ...state,
                        showNotePopup: false,
                      });
                    }}
                    selectedPeople={[props.selectedPeople]}
                    note_id={note_reminder?.id}
                    get_timeline={() => {
                      get_timeline(props.selectedPeople.contact_id);
                    }}
                  />
                </div>
              </BlurPopup>
            )}
          </div>
        );

      case "note":
        return (
          <div
            className={
              "timeline_item timeline_call timeline_item_note " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "note"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                {icon === "priority" ? (
                  <BeenhereOutlinedIcon className="timeline_icon" />
                ) : (
                  <PersonIcon className="timeline_icon" />
                )}

                <h6>Note</h6>
              </div>
              <div className="timeline_item_top_right">
                <span>{moment(timestamp).format("MMM Do")}</span>
                <button className="btn_gray">
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="timeline_item_content">
              <p>{item?.note_reminder?.text}</p>
            </div>
          </div>
        );

      case "updated":
        return (
          <div
            className={
              "timeline_item timeline_call timeline_item_note " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "updated"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                <span>{square_icon}</span>
                <h6>Updated</h6>
              </div>
              <div className="timeline_item_top_right">
                <span>{moment(timestamp).format("MMM Do")}</span>
                <button>
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="timeline_item_content">
              <p>{item?.text}</p>
            </div>
          </div>
        );
      case "email":
        return (
          <div
            className={
              "timeline_item timeline_call timeline_item_note " +
              (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "email"}
          >
            <div className="timeline_item_top">
              <div className="timeline_item_top_left">
                <MailOutlineIcon className="timeline_icon" />
                <h6>Email sent</h6>
              </div>
              <div className="timeline_item_top_right">
                <span>{moment(timestamp).format("MMM Do")}</span>
                <button className="btn_gray">
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="timeline_item_content">
              <p>{email?.body}</p>
            </div>
          </div>
        );

      default:
        return (
          <div
            className={
              "timeline_item " + (index === 0 ? "active_timeline" : "")
            }
            key={timestamp + "Unknown"}
          >
            <h6>Unknown Action</h6>
            <p>Action Type: {action_type}</p>
            <span>{new Date(timestamp).toLocaleString()}</span>
          </div>
        );
    }
  };

  return (
    <div className="people_timeline_con">
      {ToastText.show && <Toast text={ToastText.text} />}
      <div className="timeline_container">
        {/* AI Suggestions */}

        <div className="followup_suggestions">
          <p className="suggestions_label">✨ Follow Up Suggestions</p>

          {suggestions?.message && (
            <div
              className={"timeline_item timeline_call timeline_item_note "}
              key={"suggestion email"}
            >
              <div className="timeline_item_content">
                <p>{suggestions.message?.slice(0, 120)}...</p>
              </div>

              <div className="timeline_item suggestion_cta">
                <button
                  className="button"
                  onClick={() => {
                    setdirectEmail(true);
                    handleDirectSend(suggestions);
                  }}
                >
                  <SendOutlinedIcon className="icon" />
                  Send
                </button>
                <button
                  className="button"
                  onClick={() => {
                    setdirectEmail(false);
                    handleDirectSend(suggestions);
                  }}
                >
                  <EditOutlinedIcon className="icon" />
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>

        {TimelineData.map((item, index) => renderTimelineItem(item, index))}
        {/* 
        {showEmailPopup && (
  <BlurPopup
    onClose={() => setShowEmailPopup(false)}
    openState={showEmailPopup}
    ComponentClass="people_sendemail_popup_wrapper"
  >
    <div className="blurpopup_con_wrapper people_sendemail_popup">
      <SendEmail
        selectedPeople={[props.selectedPeople]}
        handleCLose={() => setShowEmailPopup(false)}
        handleTimelineRefresh={props.handleTimelineRefresh}
        defaultSubject={emailData.subject}
        defaultBody={emailData.body}
        directEmail={directEmail}
      />
    </div>
  </BlurPopup>
)}  
 */}

 {showEmailPopup && (
  <BlurPopup
    onClose={() => setShowEmailPopup(false)}
    openState={showEmailPopup}
    ComponentClass="people_sendemail_popup_wrapper"
  >
    <div className="blurpopup_con_wrapper people_sendemail_popup">
      <SendEmail
        selectedPeople={[props.selectedPeople]}
        handleCLose={() => {
          setShowEmailPopup(false);
          // Refresh local timeline so sent email appears immediately
          get_timeline(props.selectedPeople?.contact_id);
          if (props.handleTimelineRefresh) props.handleTimelineRefresh();
        }}
        handleTimelineRefresh={() => {
          get_timeline(props.selectedPeople?.contact_id);
          if (props.handleTimelineRefresh) props.handleTimelineRefresh();
        }}
        defaultSubject={emailData.subject}
        defaultBody={emailData.body}
        directEmail={directEmail}
      />
    </div>
  </BlurPopup>
)}
      </div>
    </div>
  );
}

export default Timeline;
