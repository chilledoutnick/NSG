import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import Skeleton from "react-loading-skeleton";
import $ from "jquery";
import dayjs from "dayjs";
import swal from "sweetalert";
import Swal from "sweetalert2";
import moment from "moment";
import momentTz from "moment-timezone";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import EastIcon from "@mui/icons-material/East";
import CustomDatePicker from "../../Components/DatePicker/CustomDatePicker";
import "./Booking.scss";
import "./Responsive.scss";

function Booking(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [selectedTime, setSelectedTime] = useState();
  const [errorMsg, setErrorMsg] = useState("");
  const [meet_link, setMeet_link] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isTimeSelected, setIsTimeSelected] = useState(false);
  const [selectedDates, setSelectedDates] = useState(undefined);
  const [Durations, setDurations] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [timeZone, setTimeZone] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [duration, setDuration] = useState();
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState();
  const [inputData, setInputData] = useState("");
  const [inputFields] = useState([{ value: "" }]);

  const [Guests, setGuest] = useState([]);
  const [outlook_access_token, setOutlook_access_token] = useState(false);
  const [is_google_meet, set_is_google_meet] = useState(false);
  const [isCalDev, setIsCalDev] = useState(false);
  const [Advisor_details, setAdvisor_details] = useState({
    name: "",
    email: "",
  });
  const [user_id, setUser_id] = useState();
  const username = window.location.pathname.split("/")[1];
  const [user_name] = useState(
    location.state ? location.state.user_name : username
  );
  const meetDuration = window.location.pathname.split("/")[3];

  useEffect(() => {
    if (
      meetDuration &&
      meetDuration !== "" &&
      Durations.includes(JSON.parse(meetDuration))
    ) {
      setSelectedDuration(JSON.parse(meetDuration));
    } else {
      setSelectedDuration(0);
    }
  }, [meetDuration, Durations]);

  useEffect(() => {
    timeZoneGenerate();
    get_advisor_by_user_name();
    get_slot_times();
  }, []);

  useEffect(() => {
    if (selectedDuration !== 0 && selectedDates !== undefined) {
      getTimeSlot(selectedDates);
    }
  }, [selectedDuration]);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const timeZoneGenerate = () => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName = Intl.DateTimeFormat(undefined, options2).format(
      new Date()
    );
    const timeZoneAbbreviation = userTimeZoneName.split(",")[1];
    setTimeZone(timeZoneAbbreviation);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    service: "",
    appointment_name: "",
  });

  const slotDate = selectedTime?.date || dayjs(selectedDates).format("YYYY-MM-DD");
  const slotTimeValue = selectedTime?.time || selectedTime;
  const eventStart = slotDate && slotTimeValue
    ? momentTz.tz(
      `${slotDate} ${slotTimeValue}`,
      "YYYY-MM-DD HH:mm:ss",
      momentTz.tz.guess()
    )
    : null;
  const eventEnd = eventStart ? eventStart.clone().add(duration, "minutes") : null;

  const makeAppointment = (contact_id, meetLink, eventId) => {
    let localDate = slotDate;
    const url = "api/user_appointment/create_appointment/";
    let localTime = moment(slotTimeValue, "HH:mm:ss").format("LT");
    const givenTime = moment(
      `${localDate} ${slotTimeValue}`,
      "YYYY-MM-DD HH:mm:ss"
    );
    const currentTime = moment();
    const diffInMinutes = Math.abs(currentTime.diff(givenTime, "minutes")) + 1;
    const data = {
      appointment_date: localDate,
      appointment_time: slotTimeValue,
      status: "active",
      guest: Guests.length > 0 ? Guests : [],
      meeting_name: formData.appointment_name,
      contact_id: contact_id,
      username: props.username ? props.username : undefined,
      duration: duration,
      timezone: momentTz.tz.guess(),
      timezone_name: localTime + " " + localDate + timeZone,
      countdown: diffInMinutes,
      meet_link: meetLink,
      eventId: eventId,
    };
    axios
      .post(url, data)
      .then((res) => {
        if (props.username !== undefined) {
          props.setCalendarActiveTab();
          swal({
            text: "Success",
            icon: "success",
            timer: 2000,
            buttons: false,
          });
        } else {
          navigate("/confirm-booking", {
            state: {
              name: formData.name,
              appointment: res.data,
              user_name: user_name,
              timeZone: timeZone,
            },
          });
        }

        setLoading(false);
        setError("");
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response.data.message);
      });
  };

  console.log("accessToken", accessToken);

  const makeClient = () => {
    setLoading(true);
    const url = "api/contact/create_contact/";
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.number,
      message: formData.service,
      category: "prospect",
      tags: "Added from Scheduler",
      username: props.username ? props.username : undefined,
    };
    axios
      .post(url, payload, config)
      .then((response) => {
        if (accessToken) {
          addEvent(response.data.contact_id);
        } else if (outlook_access_token) {
          AddOutlookEvent(response.data.contact_id);
        } else if (isCalDev) {
          if (!window.isCalDavEventInProgress) {
            window.isCalDavEventInProgress = true;
            caldavAddEvent(response.data.contact_id);
          }
        } else {
          makeAppointment(response.data.contact_id);
        }
        setError("");
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  const meet_link_app = (id) => {
    const url = "/api/user/meet_link_app/";
    const payload = {
     username: props.username ? props.username : undefined,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        let is_google_meet = res.data.is_google_meet;
        set_is_google_meet(is_google_meet);
      })
      .catch((err) => console.log("err", err));
  };

  const get_slot_times = () => {
    const url = "api/working_hour/get_slot_times/";
    const payload = {
      slot_time: duration,
      username: props.username ? props.username : undefined,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        const durations = res.data?.[0]?.slot_time || [];
        if (durations.length > 0) {
          setDurations(durations);
        } else {
          setDurations([30]);
          setErrorMsg("No time available");
        }
        setInitialLoading(false);
      })
      .catch((err) => {
        setDurations([30]);
        setInitialLoading(false);
        setErrorMsg("No time available");
      });
  };

  const get_advisor_by_user_name = () => {
    const get_advisorUrl = "/api/user_profile/get_user_by_user_name/";
    const get_advisorPayload = {
      username: props.username ? props.username : undefined,
    };
    axios
      .post(get_advisorUrl, get_advisorPayload,config)
      .then((res) => {
        let id = res.data.user_id;
        setUser_id(id);
        get_refresh_token(id);
        meet_link_app(id);
        setAdvisor_details({
          ...Advisor_details,
          name: res.data.name,
          email: res.data.email,
        });
      })
      .catch((err) => console.log("err", err));
  };

  const getTimeSlot = (selectedDate) => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName = Intl.DateTimeFormat(undefined, options2).format(
      new Date()
    );
    const timeZoneAbbreviation = userTimeZoneName.split(",")[1];
    $("#preloader").css("display", "block");
    const url = "/api/user_profile/get_time_slots/";
    const payload = {
      date: selectedDate,
      timezone: momentTz.tz.guess(),
      slot_time: selectedDuration,
      day_number: moment(selectedDate).day(),
      username: props.username ? props.username : undefined,
      window_timezone: timeZoneAbbreviation,
    };

    axios
      .post(url, payload,config)
      .then((res) => {
        setIsDateSelected(true);
        let currentDate = dayjs().format("YYYY-MM-DD");
        let localTime = moment().format("HH:mm:ss");
        setDuration(res.data.duration);
        setMeet_link(res.data.meet_link);
        if (currentDate === selectedDate) {
          var timeSlot = [];
          res.data.time.forEach((slot) => {
            const slotTime = slot.time;
            const slotDate = slot.date;
            const dayOffset = slot.day_offset;

            if (selectedDate === currentDate) {
              if (slotTime > localTime) {
                timeSlot = [...timeSlot, slot];
              }
            } else {
              timeSlot = [...timeSlot, slot];
            }
          });

          setTimeSlots(timeSlot);
        } else {
          setTimeSlots(res.data.time);
        }
        $("#preloader").css("display", "none");
      })
      .catch((err) => {
        $("#preloader").css("display", "none");
        setTimeSlots([]);
      });
  };

  const handleChange = (e) => {
    e.preventDefault();
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });
  };

  const btnDisable =
    selectedDates === undefined ||
      loading === true ||
      selectedTime === undefined ||
      formData.name === "" ||
      formData.email === "" ||
      formData.number === ""
      ? true
      : false;

  const get_refresh_token = (id) => {
    const url = "api/user/get_access_token/";
    const payload = {
      username: props.username ? props.username : undefined,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        setAccessToken(google);
        setOutlook_access_token(outlook);
        setIsCalDev(other);
      })
      .catch((err) => console.log("err", err));
  };

  const email_content = `Meet With ${Advisor_details.name
    }\nEvent Name: 30 Minute Meeting\n\n${!is_google_meet ? "Location: " + meet_link + "\n" : ""
    }You can join this meeting from your computer, tablet, or smartphone.\n\n${!is_google_meet ? "Join using this link: " + meet_link + "\n\n" : ""
    }${Advisor_details.name} - organiser\n${Advisor_details.email}\n\nReply to ${Advisor_details.email
    }\nPowered by NSG.tech`;

  const addEvent = (contact_id) => {
    let guests = [];
    guests = [{ email: Advisor_details.email }, { email: formData.email }];
    Guests.map((item) => {
      guests.push({
        email: item,
      });
    });
    console.log(" booking time:  ", eventStart?.format());

    const event = {
      summary: "App. with " + Advisor_details.name + " X " + formData.name,
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
      attendees: guests,
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

    if (is_google_meet) {
      event.conferenceData = {
        createRequest: {
          requestId: "unique-string-" + Date.now(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
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
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then((res) => {
        makeAppointment(contact_id, res.hangoutLink, res.id);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const AddOutlookEvent = (contact_id) => {
    let guests = [];
    guests = [{ email: Advisor_details.email }, { email: formData.email }];
    Guests.map((item) => {
      guests.push({
        email: item,
      });
    });

    const event = {
      subject: "App. with " + Advisor_details.name + " X " + formData.name,
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
      attendees: guests.map((guest) => ({
        emailAddress: {
          address: guest.email,
          name: guest.name || "",
        },
        type: "required",
      })),
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
        makeAppointment(contact_id, "", res.id);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const caldavAddEvent = (contact_id) => {
    const url = "api/caldav/AddEvent/";
    let payload = {
      user_id: user_id,
      dtstart: eventStart?.format("YYYYMMDDTHHmmss"),
      dtend: eventEnd?.format("YYYYMMDDTHHmmss"),
      timeZone: momentTz.tz.guess(),
      summary: "App. with " + Advisor_details?.name + " X " + formData.name,
    };

    axios
      .post(url, payload, config)
      .then((res) => {
        makeAppointment(contact_id, "", res.data.event.id);
        console.log("res", res.data.event.id);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Error occurred",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const { errors } = formData;

  return (
    <div
      className={
        "booking-container " +
        (props.isExternal
          ? "booking-container-page"
          : props.isPopup === true
            ? "booking-container-popup"
            : "")
      }
    >
      <div
        className={
          "booking-container-wrapper " +
          (!props.isExternal ? "min-vh-auto" : "")
        }
      >
        <div className="booking-con-top">
          <button
            className="back_btn"
            onClick={() => {
              if (selectedDuration === 0) {
                if (props.isExternal) {
                  window.location.replace("/" + user_name);
                } else {
                  props.setCalendarActiveTab();
                }
              } else {
                if (isTimeSelected) {
                  setIsTimeSelected(false);
                } else {
                  setSelectedDuration(0);
                }
              }
            }}
          >
            <KeyboardBackspaceIcon className="icon" />
          </button>

          <div className="booking-con-top-wrapper">
            <div>
              <h2>Let's Talk</h2>
              <p>Please follow the instructions to schedule</p>
            </div>
          </div>
        </div>
        {selectedDuration === 0 ? (
          <div className="booking-item-duration">
            <p>Select meeting duration:</p>
            <div className="btn_wrapper">
              {initialLoading ? (
                <div className="btn_wrapper_skeleton">
                  <div>
                    <Skeleton count={2} className="bws" />
                  </div>
                  <div>
                    <Skeleton count={2} className="bws" />
                  </div>
                </div>
              ) : Durations.length > 0 ? (
                Durations.map((item, index) => {
                  return (
                    <button
                      key={index + "duration"}
                      onClick={() => setSelectedDuration(item)}
                    >
                      {item + " Minute Meeting"}
                      <EastIcon className="icon" />
                    </button>
                  );
                })
              ) : (
                <p className="error">{errorMsg}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="booking-con-bottom">
              <div className="booking-item-booking-details">
                <h4>{Advisor_details.name}</h4>
                <h4>
                  {selectedTime && moment(slotDate).format("Do MMM")}
                  {selectedTime &&
                    ", " + moment(slotTimeValue, "HH:mm:ss").format("LT")}
                </h4>
                <h5>{selectedDuration} Min Meeting</h5>
                <h3 className="time-zone-text">{timeZone}</h3>
              </div>
              {!isTimeSelected ? (
                <>
                  <div className="booking-item booking-item-calendar">
                    <p className="booking-item-choose">Choose Date:</p>
                    <div className="booking-item-calender">
                      <CustomDatePicker
                        selectedDate={selectedDates}
                        onDateChange={(date) => {
                          setSelectedDates(date);
                          getTimeSlot(date);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={
                      "booking-item " +
                      (!isDateSelected
                        ? "booking-item-time-hide"
                        : "booking-item-time")
                    }
                  >
                    <p className="booking-item-choose">
                      {moment(selectedDates).format("dddd, MMM Do")}
                    </p>
                    <div className="booking-time-slot-con">
                      {timeSlots.length !== 0 ? (
                        timeSlots.map((item, index) => {
                          return (
                            <div
                              key={index + "time"}
                              className="booking-time-slot-item-wrapper"
                            >
                              <button
                                onClick={() => setSelectedTime(item)}
                                className={
                                  selectedTime?.time === item.time && selectedTime?.date === item.date
                                    ? "booking-time-slot-item-active"
                                    : ""
                                }
                              >
                                {/* format time nicely */}
                                {moment(item.time, "HH:mm:ss").format("LT")}

                                {/* show prev/next day info */}
                                {item.day_offset === -1 && <span> (Prev Day)</span>}
                                {item.day_offset === 1 && <span> (Next Day)</span>}
                              </button>

                              <button
                                className={
                                  selectedTime?.time === item.time && selectedTime?.date === item.date
                                    ? "active_next_btn"
                                    : "next_btn"
                                }
                                onClick={() => setIsTimeSelected(true)}
                              >
                                Next
                              </button>
                            </div>
                          );
                        })

                      ) : (
                        <p className="not-time-available">No Time Available</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="booking-customer-details-wrapper">
                  <p className="booking-item-choose">Customer Details</p>
                  <div className="booking-customer-details">
                    <div className="booking-customer-details-input">
                      <label htmlFor="Name*">Name*</label>
                      <input name="name" onChange={handleChange} />
                      {errors?.has("name") && (
                        <p className="error">{errors.first("name")}</p>
                      )}
                    </div>
                    <div className="booking-customer-details-input">
                      <label htmlFor="Name*">Email ID*</label>
                      <input name="email" onChange={handleChange} />
                      {errors?.has("email") && (
                        <p className="error">{errors.first("email")}</p>
                      )}
                    </div>

                    <div className="booking-customer-details-input">
                      <label htmlFor="Name*">Contact Number*</label>
                      <input name="number" onChange={handleChange} />

                      {errors?.has("number") && (
                        <p className="error">{errors.first("number")}</p>
                      )}
                    </div>
                    {!props.isExternal ? (
                      <>
                        <div className="dynamic-input my-3">
                          <label htmlFor="Name*">Add guest email</label>
                          {inputFields.map((index) => (
                            <div className="dynamic-input-inner" key={index}>
                              <input
                                type="text"
                                value={inputData}
                                onChange={(event) =>
                                  setInputData(event.target.value)
                                }
                              />
                              <button
                                className="remove-input-2"
                                type="button"
                                onClick={() => {
                                  Guests.push(inputData);
                                  setGuest(JSON.parse(JSON.stringify(Guests)));
                                  setInputData("");
                                }}
                              >
                                Add
                              </button>
                            </div>
                          ))}

                          {Guests.length > 0 ? (
                            <p style={{ fontWeight: 500, fontSize: 14 }}>
                              {Guests.length} guests
                            </p>
                          ) : (
                            ""
                          )}
                          {Guests.map((item, index) => {
                            return (
                              <div
                                className="guests-item"
                                index={"guest" + index}
                              >
                                <Avatar
                                  src="Avatar"
                                  alt={item}
                                  className="name-user-icon"
                                />
                                <p>{item}</p>
                                <button
                                  onClick={() => {
                                    let index = Guests.indexOf(item);
                                    if (index !== -1) {
                                      Guests.splice(index, 1);
                                      setGuest(
                                        JSON.parse(JSON.stringify(Guests))
                                      );
                                    }
                                  }}
                                >
                                  <CloseIcon className="guest-remove" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      ""
                    )}

                    <div className="booking-customer-details-input">
                      <label htmlFor="Message*">
                        Write a Personalized Note
                      </label>
                      <input name="service" onChange={handleChange} />

                      {errors?.has("service") && (
                        <p className="error">{errors.first("service")}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {isTimeSelected && (
              <div className="book-now-btn-con ">
                <p className="error mb-3">{error}</p>
                <button
                  disabled={
                    isMobile
                      ? selectedTime === undefined
                        ? true
                        : false
                      : btnDisable
                  }
                  onClick={() => {
                    makeClient();
                  }}
                  className={
                    "btn-primary " + (btnDisable ? "btn-disabled" : "")
                  }
                >
                  {!loading ? (
                    "Book Now"
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
          </>
        )}
      </div>
    </div>
  );
}
export default Booking;
