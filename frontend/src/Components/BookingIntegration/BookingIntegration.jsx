import axios from "axios";
import { useState, useEffect, lazy } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import moment from "moment";
import momentTz from "moment-timezone";
import { ThreeDots } from "react-loader-spinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ThumbUpIcon from "@mui/icons-material/ThumbUpOutlined";
import CloseIcon from "@mui/icons-material/Close";

import CustomDatePicker from "../../Components/DatePicker/CustomDatePicker";
import "./BookingIntegration.scss";

const CalendarIntegration = lazy(() =>
  import("../CalendarIntegration/CalendarIntegration")
);
const ballon_img =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/balloon_png.webp";

function BookingIntegration(props) {
  const user_info = JSON.parse(localStorage.getItem("user_info"));
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const [Loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [is_google_meet, set_is_google_meet] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDates, setSelectedDates] = useState(undefined);
  const [selectedTime, setSelectedTime] = useState(undefined);
  const [slotTime, setSlotTime] = useState([]);
  const [Duration, setDuration] = useState(30);
  const [DurationList, setDurationList] = useState([]);
  const [showIngetraion, setShowIngetraion] = useState(false);
  const [google_access_token, setGoogle_access_token] = useState(false);
  const [outlook_access_token, setOutlook_access_token] = useState(false);
  const [isCalDev, setIsCalDev] = useState(false);
  const [meet_link, setMeet_link] = useState("");
  const [HasMeet_link, setHasMeet_link] = useState("");
  const [ErrorMsg, setErrorMsg] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const slotDate = selectedTime?.date || dayjs(selectedDates).format("YYYY-MM-DD");
  const slotTimeValue = selectedTime?.time || selectedTime;
  const eventStart = slotDate && slotTimeValue
    ? momentTz.tz(
      `${slotDate} ${slotTimeValue}`,
      "YYYY-MM-DD HH:mm:ss",
      momentTz.tz.guess()
    )
    : null;
  const eventEnd = eventStart ? eventStart.clone().add(Duration, "minutes") : null;

  const email_content = `Meet With ${props.selectedPeople?.name
    }\nEvent Name: ${Duration} Minute Meeting\n\n${!is_google_meet ? "Location: " + meet_link + "\n" : ""
    }You can join this meeting from your computer, tablet, or smartphone.\n\n${!is_google_meet ? "Join using this link: " + meet_link + "\n\n" : ""
    }${props.selectedPeople?.name} - organiser\n${props.selectedPeople?.email
    }\n\nReply to ${props.selectedPeople?.email}\nPowered by NSG.tech`;

  useEffect(() => {
    get_access_token();
    get_duration();
    timeZoneGenerate();
    meet_link_app();
    if (props.appointment) {
      setSelectedDates(
        moment(props.appointment?.timestamp).format("YYYY-MM-DD")
      );
      getTimeSlot(moment(props.appointment?.timestamp).format("YYYY-MM-DD"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDates) {
      getTimeSlot(selectedDates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Duration]);

  const meet_link_app = () => {
    const url = "/api/user/meet_link_app/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let is_google_meet = res.data.is_google_meet;
        set_is_google_meet(is_google_meet);
      })
      .catch((err) => console.log("err", err));
  };

  const get_access_token = () => {
    setCalendarLoading(true);
    const url = "api/user/get_access_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        setGoogle_access_token(google);
        setOutlook_access_token(outlook);
        setIsCalDev(other);
        if (google || outlook || other === true) {
          setShowIngetraion(false);
        } else {
          setShowIngetraion(true);
        }
        setCalendarLoading(false);
      })
      .catch((err) => {
        setShowIngetraion(true);
        setCalendarLoading(false);
      });
  };

  const get_duration = () => {
    const url = "api/working_hour/get_slot_times/";
    axios
      .post(url, {}, config)
      .then((res) => {
        const durationList = res.data?.[0]?.slot_time || [];
        setDurationList(durationList.length > 0 ? durationList : [30]);
      })
      .catch((err) => {
        setDurationList([30]);
        console.log("err");
      });
  };

  const getTimeSlot = (selectedDate) => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName = Intl.DateTimeFormat(undefined, options2).format(new Date());
    const timeZoneAbbreviation = userTimeZoneName.split(",")[1];
    const url = "/api/user_profile/get_time_slots/";
    const payload = {
      date: selectedDate,
      timezone: momentTz.tz.guess(),
      slot_time: Duration,
      day_number: moment(selectedDate).day(),
      window_timezone: timeZoneAbbreviation,
    };

    axios
      .post(url, payload, config)
      .then((res) => {
        const currentDate = dayjs().format("YYYY-MM-DD");
        const localTime = moment().format("HH:mm:ss");

        // Filter slots for today to only show future times
        let filteredSlots = res.data.time;
        if (currentDate === selectedDate) {
          filteredSlots = res.data.time.filter(
            (slot) => slot.date > currentDate || slot.time > localTime
          );
        }

        setSlotTime(filteredSlots); // store array of objects
        setMeet_link(res.data.meet_link);

        if (res.data.meet_link) {
          setHasMeet_link(true);
        } else {
          setHasMeet_link(false);
        }
      })
      .catch((err) => {
        setSlotTime([]);
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error fetching slots",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };


  const makeAppointment = (meetLink, eventId) => {
    setLoading(true);
    let localDate = slotDate;
    const givenTime = moment(
      `${localDate} ${slotTimeValue}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    let localTime = moment(slotTimeValue, "HH:mm:ss").format("LT");
    const currentTime = moment();
    const diffInMinutes = Math.abs(currentTime.diff(givenTime, "minutes")) + 1;
    const url = props.appointment?.appointment_id
      ? "api/user_appointment/reschedule_appointment/"
      : "api/user_appointment/create_appointment/";
    const data = {
      appointment_id: props.appointment
        ? props.appointment?.appointment_id
        : "",
      appointment_date: localDate,
      appointment_time: slotTimeValue,
      status: props.appointment?.appointment_id ? "reschedule" : "active",
      guest: [],
      meeting_name: "A meeting with " + props.selectedPeople.name,
      contact_id: props.selectedPeople.contact_id,
      duration: Duration,
      timezone: momentTz.tz.guess(),
      countdown: diffInMinutes,
      timezone_name: localTime + " " + localDate + timeZone,
      meet_link: meetLink,
      eventId: eventId,
    };
    axios
      .post(url, data, config)
      .then((res) => {
        setShowConfirm(false);
        setShowSuccess(true);
        setLoading(false);
      })
      .catch((err) => {
        console.log("res", err);
        setLoading(false);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .finally(() => {
        // Reset CalDAV safeguard
        window.isCalDavEventInProgress = false;
      });
  };

  const timeZoneGenerate = () => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName = Intl.DateTimeFormat(undefined, options2).format(
      new Date()
    );
    const timeZoneAbbreviation = userTimeZoneName.split(",")[1];

    setTimeZone(timeZoneAbbreviation);
  };

  const addEvent = () => {
    console.log("time:  ", eventStart?.format());
    
    const event = {
      summary:
        "App. with " + props.selectedPeople?.name + " X " + user_info.name,
      location: !is_google_meet ? meet_link : "",
      description: email_content,
      start: {
        timeZone: momentTz.tz.guess(),
        dateTime: eventStart?.format(),
      },
      end: {
        timeZone: momentTz.tz.guess(),
        dateTime: eventEnd?.format(),
      },
      conferenceDataVersion: 1,
      recurrence: ["RRULE:FREQ=DAILY;COUNT=1"],
      attendees: [
        { email: user_info?.email },
        { email: props.selectedPeople?.email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
      guestsCanSeeOtherGuests: true,
      sendUpdates: "all",
    };
    // Conditionally add conferenceData if is_google_meet is true
    if (is_google_meet) {
      event.conferenceData = {
        createRequest: {
          requestId: "unique-string-" + Date.now(), // Generate a unique request ID
          conferenceSolutionKey: {
            type: "hangoutsMeet", // Specifies Google Meet
          },
        },
      };
    }

    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1";

    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${google_access_token}`,
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then((res) => {
        makeAppointment(res.hangoutLink, res.id);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  const AddOutlookEvent = () => {
    const event = {
      subject:
        "App. with " + props.selectedPeople?.name + " X " + user_info.name,
      body: {
        contentType: "HTML",
        content: email_content,
      },
      start: {
        timeZone: momentTz.tz.guess(),
        dateTime: eventStart?.format(),
      },
      end: {
        timeZone: momentTz.tz.guess(),
        dateTime: eventEnd?.format(),
      },
      location: {
        displayName: meet_link,
      },
      attendees: [
        {
          emailAddress: {
            address: user_info?.email,
            name: user_info?.name,
          },
          type: "required",
        },
        {
          emailAddress: {
            address: props.selectedPeople?.email,
            name: props.selectedPeople?.name,
          },
          type: "required",
        },
      ],
    };

    const url = "https://graph.microsoft.com/v1.0/me/events";
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${outlook_access_token}`,
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then((res) => {
        makeAppointment("", res.id);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  const updateAdvisor = () => {
    const url = "api/user_profile/update_user/";
    let payload = {
      meet_url: meet_link,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        if (props.appointment?.appointment_id) {
          makeAppointment();
        } else {
          if (google_access_token) {
            addEvent();
          } else if (outlook_access_token) {
            AddOutlookEvent();
          } else if (isCalDev) {
            if (!window.isCalDavEventInProgress) {
              window.isCalDavEventInProgress = true;
              caldavAddEvent();
            }
          } else {
            makeAppointment();
          }
        }
        setErrorMsg("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
        setLoading(false);
      });
  };

  const caldavAddEvent = () => {
    const url = "api/caldav/AddEvent/";
    let payload = {
      user_id: user_info.user_id,
      dtstart: eventStart?.format("YYYYMMDDTHHmmss"),
      dtend: eventEnd?.format("YYYYMMDDTHHmmss"),
      timeZone: momentTz.tz.guess(),
      summary:
        "App. with " + props.selectedPeople?.name + " X " + user_info.name,
    };

    // Ensure no loop or cycle is created
    axios
      .post(url, payload, config)
      .then((res) => {
        makeAppointment("", res.data.event.id);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  return showIngetraion ? (
    <CalendarIntegration onClose={props.onClose} />
  ) : !calendarLoading ? (
    <div className="booking_integration">
      <button
        onClick={() => {
          props.onClose();
          if (props.handleTimelineRefresh && showSuccess) {
            props.handleTimelineRefresh();
          }
          if (props.get_timeline && showSuccess) {
            props.get_timeline();
          }
        }}
        className="close_btn"
      >
        <CloseIcon />
      </button>
      <h3>
        {showConfirm
          ? "Confirm & book"
          : showSuccess
            ? "Successfully booked a meeting"
            : "Let’s schedule a meeting"}{" "}
      </h3>
      {!showConfirm && !showSuccess && <h5>{props.selectedPeople?.name}</h5>}
      {showCalendar && (
        <>
          <p className="booking_integration_select">
            {props.selectedPeople?.email}
          </p>
          <p
            className="booking_integration_text text-center"
            style={{ marginBottom: 12 }}
          >
            Select a suitable date for the meeting.
          </p>
          <div className="booking_calendar">
            <CustomDatePicker
              selectedDate={selectedDates}
              onDateChange={(date) => {
                setSelectedDates(date);
                getTimeSlot(date);
              }}
            />
          </div>
          <div className="booking_integration_submit">
            <button onClick={props.onClose} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={() => {
                setShowCalendar(false);
                setShowTime(true);
              }}
              disabled={!selectedDates}
              className="btn-primary"
            >
              Next
            </button>
          </div>
        </>
      )}
      {showTime && (
        <>
          <p className="booking_integration_select">
            {props.selectedPeople.email}|{" "}
            {moment(selectedDates).format("MMM Do YYYY")}
          </p>
          <p className="booking_integration_text">Meeting duration</p>
          <div className="booking_meeting_duration">
            {DurationList.map((item, index) => {
              return (
                <div key={index} className="meeting_duration_item">
                  <input
                    checked={Duration === item}
                    type="radio"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDuration(item);
                      } else {
                        setDuration(0);
                      }
                    }}
                  />
                  <span>{item} min duration</span>
                </div>
              );
            })}
            {DurationList.length === 0 && <p>No duration available</p>}
          </div>
          <p className="booking_integration_text">Select a slot</p>
          <div className="booking_meeting_time">
            {slotTime.map((item, index) => {
              const slotStart = moment(item.time, "HH:mm:ss");
              const slotEnd = slotStart.clone().add(Duration, "minutes");

              let displayLabel = slotStart.format("LT") + " - " + slotEnd.format("LT");

              // Append day info if different from selected date
              if (item.day_offset !== 0) {
                const dayLabel = item.day_offset > 0 ? " (Next Day)" : " (Previous Day)";
                displayLabel += dayLabel;
              }

              return (
                <button
                  onClick={() => setSelectedTime(item)}
                  key={index + "time"}
                  className={selectedTime === item ? "active_time" : ""}
                >
                  {displayLabel}
                </button>
              );
            })}

            {slotTime.length === 0 && <p>No slot available</p>}
          </div>
          <div className="booking_integration_submit">
            <button
              onClick={() => {
                setShowCalendar(true);
                setShowTime(false);
              }}
              className="btn-outline"
            >
              Back
            </button>
            <button
              onClick={() => {
                setShowTime(false);
                setShowConfirm(true);
              }}
              className="btn-primary"
              disabled={Duration === 0 || !selectedTime}
            >
              Next
            </button>
          </div>
        </>
      )}
      {showConfirm && (
        <>
          <div className="booking_confirm">
            <div className="booking_confirm_details">
              <p>
                Meeting with<span>:</span>
              </p>
              <span>{props.selectedPeople.name}</span>
            </div>
            <div className="booking_confirm_details">
              <p>
                Duration<span>:</span>
              </p>
              <span>{Duration} mins</span>
            </div>
            <div className="booking_confirm_details">
              <p>
                Date<span>: </span>
              </p>
              <span>{moment(slotDate).format("MMM Do YYYY")}</span>
            </div>
            <div className="booking_confirm_details">
              <p>
                Starts at <span>:</span>
              </p>
              <span> {moment(slotTimeValue, "HH:mm:ss").format("LT")}</span>
            </div>
            <div className="booking_confirm_details">
              <p>
                Meeting link <span>:</span>
              </p>
              {is_google_meet ? (
                <span>Google default meeting link</span>
              ) : (
                meet_link && <span>{meet_link}</span>
              )}
            </div>
            {!HasMeet_link && !is_google_meet && (
              <div className="booking_confirm_details">
                <input
                  type="text"
                  placeholder="+ Add meeting link"
                  value={meet_link}
                  onChange={(e) => setMeet_link(e.target.value)}
                />
              </div>
            )}
            {ErrorMsg && <p className="error">{ErrorMsg}</p>}
          </div>
          <div className="booking_integration_submit">
            <button
              onClick={() => {
                setShowTime(true);
                setShowConfirm(false);
              }}
              className="btn-outline"
            >
              Back
            </button>
            <button
              disabled={!meet_link && !is_google_meet}
              onClick={() => {
                setLoading(true);
                updateAdvisor();
              }}
              className="btn-primary"
            >
              {!Loading ? (
                "Book"
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
        </>
      )}
      {showSuccess && (
        <>
          <p className="booking_integration_select text-center">
            A notification has been sent to your email with all details. You may
            reschedule the meeting in the timeline.
          </p>

          <div className="booking_success_img_con">
            <LazyLoadImage
              src={ballon_img}
              effect="blur"
              alt="ballon img"
              wrapperClassName="booking_success_img"
            />
          </div>
          <h5 className="text-center"> {props.selectedPeople.name}</h5>
          <p className="booking_integration_select text-center">
            {props.selectedPeople.email}
          </p>
          <p className="booking_integration_select text-center">
            {Duration} min | {moment(slotDate).format("MMM Do YYYY")} |{" "}
            {moment(slotTimeValue, "HH:mm:ss").format("LT")}
          </p>
          <div className="booking_integration_submit">
            <button
              onClick={() => {
                props.onClose();
                if (props.handleTimelineRefresh) {
                  props.handleTimelineRefresh();
                }
                if (props.get_timeline) {
                  props.get_timeline();
                }
              }}
              className="btn-primary"
              style={{ width: "fit-content", margin: "auto" }}
            >
              <ThumbUpIcon /> Done
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <div
      style={{
        margin: "auto",
        marginTop: "60%",
      }}
    >
      <ThreeDots
        height="25"
        width="60"
        radius="9"
        color="black"
        ariaLabel="three-dots-loading"
      />
    </div>
  );
}

export default BookingIntegration;
