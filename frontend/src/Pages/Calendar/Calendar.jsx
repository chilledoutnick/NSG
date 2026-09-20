import axios from "axios";
import  { useState, useEffect, lazy } from "react";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
import copy from "copy-to-clipboard";
import Swal from "sweetalert2";
import momentTz from "moment-timezone";
import dayjs from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import Toast from "../../Components/Toast/Toast";
import "./Calendar.scss";
import "./ResCalendar.scss";


const delete_icon = (
  <svg
    width="16"
    height="18"
    viewBox="0 0 16 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14ZM10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14Z"
      fill="#463E5F"
    />
  </svg>
);

const Booking = lazy(() => import("../Booking/Booking"));
const CardBottomBar = lazy(() =>
  import("../../Components/CardProfileBottomBar/BottomBar")
);
const CardProfileMenu = lazy(() =>
  import("../../Components/CardProfileMenu/CardProfileMenu")
);
const Availability = lazy(() =>
  import("../../Components/Availability/Availability")
);
const SyncAndIntegration = lazy(() =>
  import("../../Pages/Account/SyncAndIntegration/SyncAndIntegration")
);

function Calendar() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSchedule, setIsSchedule] = useState(false);
  const [isCalendarAdded, setIsCalendarAdded] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [appData, setApptData] = useState([]);
  const [share_meet_link, setShareMeet_link] = useState(false);
  const [next_appt, setNext_appt] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showApptText, setShowApptText] = useState(false);
  const [activeTab, setActiveTab] = useState(2);
  const [EventsItems, setEventsItems] = useState(undefined);
  const [showSidebarCard, setShowSidebarCard] = useState(false);
  const [timeZone, setTimeZone] = useState("");
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  const user_info = JSON.parse(localStorage.getItem("user_info"));

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    get_advisor();
    get_access_token();
    timeZoneGenerate()
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

    useEffect(() => {
    get_appointments();
  }, [next_appt]);

  const timeZoneGenerate = () => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName = Intl.DateTimeFormat(undefined, options2).format(
      new Date()
    );
    const timeZoneAbbreviation = userTimeZoneName.split(",")[1];

    setTimeZone(timeZoneAbbreviation);
  };

  const handleShowText = () => {
    setShowApptText(true);
    setTimeout(() => {
      setShowApptText(false);
    }, 2000);
  };

  const get_appointments = () => {
    setInitialLoading(true);
    const url = "api/user_appointment/get_appointments/";

    const payload = {
      num_appointments: 20,
      fetch_previous: !next_appt ? true : false,
      timezone: momentTz.tz.guess(),
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setInitialLoading(false);
        setApptData(res.data);
      })
      .catch(() => setInitialLoading(false));
  };

  const setCalendarActiveTab = () => {
    setActiveTab(1);
    setIsBooking(false);
    get_appointments();
  };

  const get_advisor = () => {
    axios
      .post("/api/user_profile/get_user/", {}, config)
      .then((res) => {
        setIsSchedule(res.data.scheduling);
      })
      .catch((err) => console.log("Error:", err));
  };

  const handleSidebarClose = () => {
    setShowSidebarCard(false);
  };

  const get_access_token = () => {
    const url = "api/user/get_access_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        if (google || outlook || other) {
          setIsCalendarAdded(true);
        } else {
          setIsCalendarAdded(false);
        }
        if (!res.data.avaialability_added_first_time) {
          update_working_hours();
          create_slot_time();
        }
      })
      .catch((err) => setIsCalendarAdded(false));
  };

  const update_web = (schedule) => {
    const formData = new FormData();
    formData.append("scheduling", schedule);
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then((res) => {
        localStorage.setItem("nsg-scheduling", schedule);
      })
      .catch((err) => console.log("err", err));
  };

  const cancel_appointment = (appointment) => {
    let localDate = dayjs(appointment.date).format("YYYY-MM-DD");
    let localTime = moment(appointment.time, "HH:mm:ss").format("LT");
    setInitialLoading(true);
    const url = "api/user_appointment/cancel_appointment/";
    const payload = {
      appointment_id: appointment.appointment,
      timezone_name: localTime + " " + localDate + timeZone,
      timezone: momentTz.tz.guess(),
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setInitialLoading(false);
        get_appointments();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Appointment canceled successfully",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .catch((err) => {
        console.error("Error fetching timeline data", err);
        setInitialLoading(false);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const handleCopy = (data) => {
    const shareText = `
Name: ${data.contact_name}
Phone: ${data.contact_phone}
Email: ${data.contact_email}
Time: ${
      moment(data.time, "HH:mm:ss").format("LT") +
      " " +
      moment(data.date).format("Do MMM")
    }
duration: ${data.duration} Minutes
url: ${data.url}
`;
    copy(shareText);
    setToastText({
      ...ToastText,
      text: "Meeting details copied",
      show: true,
    });
  };

  const update_working_hours = () => {
    const payload = [
      {
        dayName: 0,
        timezone: momentTz.tz.guess(),
        working_hour: [
          {
            start_time: "09:00:00",
            end_time: "17:00:00",
          },
        ],
      },
      {
        dayName: 1,
        timezone: momentTz.tz.guess(),
        working_hour: [
          {
            start_time: "09:00:00",
            end_time: "17:00:00",
          },
        ],
      },
      {
        dayName: 2,
        timezone: momentTz.tz.guess(),
        working_hour: [
          {
            start_time: "09:00:00",
            end_time: "17:00:00",
          },
        ],
      },
      {
        dayName: 3,
        timezone: momentTz.tz.guess(),
        working_hour: [
          {
            start_time: "09:00:00",
            end_time: "17:00:00",
          },
        ],
      },
      {
        dayName: 4,
        timezone: momentTz.tz.guess(),
        working_hour: [
          {
            start_time: "09:00:00",
            end_time: "17:00:00",
          },
        ],
      },
    ];
    const url = "api/working_hour/update_working_hours/";
    axios
      .post(url, payload, config)
      .then(() => {})
      .catch((err) => console.log("err", err));
  };
  const create_slot_time = () => {
    const url = "api/working_hour/create_slot_time/";
    axios
      .post(url, { slot_time: [30] }, config)
      .then(() => {
        console.log("success");
      })
      .catch((err) => console.log("res", err));
  };

  return (
    <div className="calendar-con">
      {ToastText.show && <Toast text={ToastText.text} />}
      <div className="calendar-content">
        {showSidebarCard && (
          <CardProfileMenu handleSidebarClose={handleSidebarClose} />
        )}
        <h1>
          Schedule{" "}
          <label className="switch">
            <input
              checked={isSchedule}
              onChange={(e) => {
                setIsSchedule(e.target.checked);
                update_web(e.target.checked);
              }}
              type="checkbox"
            />
            <span className="slider round"></span>
          </label>{" "}
        </h1>
        <p className="calendar-content-desc">
          Set your availability & access all your upcoming & history of meetings
          here
        </p>
        <div
          className={
            "schedule_contant_wrapper " +
            (!isSchedule ? "schedule_contant_wrapper_disable" : "")
          }
        >
          <div className="calendar-nav">
            <div className="account_nav">
              <button
                className={activeTab === 2 ? "active_nav" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(2);
                  setIsBooking(false);
                }}
              >
                Sync & integration
              </button>
              <button
                className={
                  (activeTab === 3 ? "active_nav" : "") +
                  (!isCalendarAdded ? "disable_nav" : "")
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (isCalendarAdded) {
                    setActiveTab(3);
                    setIsBooking(false);
                  }
                }}
              >
                Availability
              </button>
              <button
                className={
                  (activeTab === 1 ? "active_nav" : "") +
                  (!isCalendarAdded ? "disable_nav" : "")
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (isCalendarAdded) {
                    setActiveTab(1);
                    setIsBooking(false);
                  }
                }}
              >
                All meetings
              </button>
            </div>
            <div className="add-appt-con">
              <div
                className={"add-app-text " + (showApptText ? "show_text" : "")}
              >
                <h5>Add Appointment</h5>
              </div>
              <button
                onClick={() => {
                  setIsBooking(true);
                  if (activeTab === 0) {
                    setActiveTab(1);
                    setIsBooking(false);
                    setShowApptText(false);
                  } else {
                    setActiveTab(0);
                    handleShowText();
                  }
                }}
                className={"add-appt " + (isBooking ? "appt-active" : "")}
              >
                <AddIcon fontSize="large" className="icon" />
              </button>
            </div>
          </div>
          {isBooking ? (
            <div className="booking-popup">
              <button
                onClick={() => {
                  setIsBooking(false);
                  setActiveTab(1);
                }}
                className="booking-close"
              >
                <CloseIcon fontSize="small" />
              </button>
              <Booking
                username={user_info.username}
                setCalendarActiveTab={setCalendarActiveTab}
              />
            </div>
          ) : (
            ""
          )}
          {activeTab === 1 ? (
            <div className="calendar-event">
              <h3>All meetings</h3>
              <h5>View all your meetings here.</h5>
              <div className="calendar-event-btn">
                <div className="calendar-event-btn-left">
                  <button
                    onClick={() => {
                      setNext_appt(true);
                      setApptData([]);
                      setShareMeet_link(false);
                    }}
                    className={next_appt ? "active" : ""}
                  >
                    Upcoming meetings
                  </button>
                  <button
                    onClick={() => {
                      setNext_appt(false);
                      setApptData([]);
                      setShareMeet_link(false);
                    }}
                    className={!next_appt ? "active" : ""}
                  >
                    History
                  </button>
                </div>

                <div className="share_meet_link_con">
                  <button
                    onClick={() => {
                      setIsBooking(true);
                      if (activeTab === 0) {
                        setActiveTab(1);
                        setIsBooking(false);
                        setShowApptText(false);
                      } else {
                        setActiveTab(0);
                        handleShowText();
                      }
                    }}
                  >
                    Book <span>a meeting</span>
                  </button>
                  <button onClick={() => setShareMeet_link(!share_meet_link)}>
                    <ArrowDropDownIcon />
                  </button>
                  {share_meet_link && (
                    <ClickAwayListener
                      onClickAway={() => setShareMeet_link(false)}
                    >
                      <div className="share_meet_link_popup shadow-sm">
                        <h5>Share link for others to book instead</h5>
                        <p>
                          With this link anyone can book a meeting with you, and
                          would reflect in the available slots of your calendar
                          associated to the NSG account.
                        </p>
                        <button
                          onClick={() => {
                            copy(
                              "/" +
                                user_info.username +
                                "/booking/"
                            );
                            setToastText({
                              ...ToastText,
                              text: "Meeting link copied",
                              show: true,
                            });
                            setShareMeet_link(false);
                          }}
                          className="btn-outline"
                        >
                          Share booking link
                        </button>
                      </div>
                    </ClickAwayListener>
                  )}
                </div>
              </div>
              <div className="event-wrapper">
                {initialLoading ? (
                  <Skeleton count={4} className="event-wrapper-skeleton" />
                ) : appData.length === 0 ? (
                  <div className="no_data_con">
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Isolation_Mode_png.webp"
                      alt="No Appointment"
                      loading="lazy"
                    />
                    <h5 className="no_data">
                      You have no meetings
                      <br /> scheduled with anyone.
                    </h5>
                    <button
                      onClick={() => {
                        setIsBooking(true);
                        if (activeTab === 0) {
                          setActiveTab(1);
                          setIsBooking(false);
                          setShowApptText(false);
                        } else {
                          setActiveTab(0);
                          handleShowText();
                        }
                      }}
                      className="btn-primary"
                    >
                      Book a meeting
                    </button>
                  </div>
                ) : (
                  appData.map((item, index) => {
                    return (
                      <div
                        className="calendar-event-items"
                        key={"events" + index}
                      >
                        <button
                          className="event_item_btn"
                          onClick={() => {
                            setShowPopup(true);
                            setEventsItems(item);
                          }}
                        >
                          <CalendarMonthOutlinedIcon className="event-icon" />
                          <div className="items-wrapper">
                            <h5>{item.contact_name}</h5>
                            <p>
                              {moment(item.date).format("Do MMM")}
                              {", "}
                              {moment(item.time, "HH:mm:ss").format("LT")}
                              {" to "}
                              {moment(item.time, "HH:mm:ss")
                                .add(item.duration, "minutes")
                                .format("LT")}
                            </p>
                          </div>
                        </button>
                        {
                          next_appt &&      <div className="event_nav_btn_con">
                          <button
                            onClick={() => {
                              handleCopy(item);
                            }}
                          >
                            <ContentCopyOutlinedIcon className="icon" />{" "}
                          </button>
                          <button
                            onClick={() => {
                              cancel_appointment(item);
                            }}
                            className="event_nav_btn"
                          >
                            {delete_icon}
                          </button>
                        </div>
                        }
                   
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            ""
          )}
          {activeTab === 2 ? (
            <SyncAndIntegration get_access_token={get_access_token} />
          ) : (
            ""
          )}
          {activeTab === 3 ? (
            <div className="availability-settings">
              <Availability />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <Dialog
        open={showPopup}
        onClose={() => setShowPopup(false)}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogContent className="calendar-events-popup">
          <button onClick={() => setShowPopup(false)} className="close-btn">
            <CloseIcon />
          </button>
          {EventsItems !== undefined ? (
            <div className="calender_event_item">
              <h2>Join meeting</h2>
              <div className="calender_event_item_text">
                <CalendarMonthOutlinedIcon className="icon" />
                <h5>Appointment with {EventsItems.contact_name}</h5>
                <p className="custom-hint-info-desc">
                  {moment(EventsItems.date).format("DD MMM YYYY,") +
                    moment(EventsItems.date).format(" dddd | ") +
                    moment(EventsItems.time, "HH:mm:ss").format("LT") +
                    " to " +
                    moment(EventsItems.time, "HH:mm:ss")
                      .add(EventsItems.duration, "minutes")
                      .format("LT")}
                </p>
              </div>
              <div className="calender_event_item_text">
                <GroupsOutlinedIcon className="icon" />
                <h5>{EventsItems?.guests?.length + 1} participants</h5>
                <p>{EventsItems.contact_email}</p>
                {EventsItems.guests.map((item, index) => {
                  return (
                    <div className="guests-item" index={"guest" + index}>
                      <p>{item}</p>
                    </div>
                  );
                })}
              </div>
              <div className="calender_event_item_text">
                <NotificationsActiveOutlinedIcon className="icon" />
                <h5>Notification</h5>
                <p>30 mins before</p>
              </div>
              <div className="calender_event_item_btn">
                <button
                  disabled={!EventsItems.url}
                  onClick={() => {
                    copy(EventsItems.url);
                    setToastText({
                      ...ToastText,
                      text: "Meeting link copied",
                      show: true,
                    });
                    setShowPopup(false);
                  }}
                  className="btn-outline"
                >
                  Copy link
                </button>
                <button
                  disabled={!EventsItems.url}
                  onClick={() => window.open(EventsItems.url)}
                  className="btn-primary"
                >
                  Join
                </button>
              </div>
            </div>
          ) : (
            "loading"
          )}
        </DialogContent>
      </Dialog>
      <CardBottomBar />
    </div>
  );
}

export default Calendar;
