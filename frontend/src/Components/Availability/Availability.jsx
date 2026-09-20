import axios from "axios";
import { useState, useEffect } from "react";
import swal from "sweetalert";
import moment from "moment";
import momentTz from "moment-timezone";
import { ThreeDots } from "react-loader-spinner";
import deleteIcon from "./img/delete.svg";

import "./Responsive.scss";
import "./Availability.scss";

function Availability(props) {
  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      Authorization: `Bearer ${props_token}`,
    },
  };
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState([]);
  const [selectedDayName, setSelectedDayName] = useState({
    dayName: "Monday",
    dayNumber: 0,
  });
  const [timeZone, setTimeZone] = useState("");
  const [selectedTime, setSelectedTime] = useState({});
  const [duration, setDuration] = useState([30]);
  const [AllTime, setAllTime] = useState([
    {
      name: "12:00am",
      value: "00:00:00",
    },
    {
      name: "12:30am",
      value: "00:30:00",
    },
    {
      name: "1:00am",
      value: "01:00:00",
    },
    {
      name: "1:30am",
      value: "01:30:00",
    },
    {
      name: "2:00am",
      value: "02:00:00",
    },
    {
      name: "2:30am",
      value: "02:30:00",
    },
    {
      name: "3:00am",
      value: "03:00:00",
    },
    {
      name: "3:30am",
      value: "03:30:00",
    },
    {
      name: "4:00am",
      value: "04:00:00",
    },
    {
      name: "4:30am",
      value: "04:30:00",
    },
    {
      name: "5:00am",
      value: "05:00:00",
    },
    {
      name: "5:30am",
      value: "05:30:00",
    },
    {
      name: "6:00am",
      value: "06:00:00",
    },
    {
      name: "6:30am",
      value: "06:30:00",
    },
    {
      name: "7:00am",
      value: "07:00:00",
    },
    {
      name: "7:30am",
      value: "07:30:00",
    },
    {
      name: "8:00am",
      value: "08:00:00",
    },
    {
      name: "8:30am",
      value: "08:30:00",
    },
    {
      name: "9:00am",
      value: "09:00:00",
    },
    {
      name: "9:30am",
      value: "09:30:00",
    },
    {
      name: "10:00am",
      value: "10:00:00",
    },
    {
      name: "10:30am",
      value: "10:30:00",
    },
    {
      name: "11:00am",
      value: "11:00:00",
    },
    {
      name: "11:30am",
      value: "11:30:00",
    },
    {
      name: "12:00pm",
      value: "12:00:00",
    },
    {
      name: "12:30pm",
      value: "12:30:00",
    },
    {
      name: "1:00pm",
      value: "13:00:00",
    },
    {
      name: "1:30pm",
      value: "13:30:00",
    },
    {
      name: "2:00pm",
      value: "14:00:00",
    },
    {
      name: "2:30pm",
      value: "14:30:00",
    },
    {
      name: "3:00pm",
      value: "15:00:00",
    },
    {
      name: "3:30pm",
      value: "15:30:00",
    },
    {
      name: "4:00pm",
      value: "16:00:00",
    },
    {
      name: "4:30pm",
      value: "16:30:00",
    },
    {
      name: "5:00pm",
      value: "17:00:00",
    },
    {
      name: "5:30pm",
      value: "17:30:00",
    },
    {
      name: "6:00pm",
      value: "18:00:00",
    },
    {
      name: "6:30pm",
      value: "18:30:00",
    },
    {
      name: "7:00pm",
      value: "19:00:00",
    },
    {
      name: "7:30pm",
      value: "19:30:00",
    },
    {
      name: "8:00pm",
      value: "20:00:00",
    },
    {
      name: "8:30pm",
      value: "20:30:00",
    },
    {
      name: "9:00pm",
      value: "21:00:00",
    },
    {
      name: "9:30pm",
      value: "21:30:00",
    },
    {
      name: "10:00pm",
      value: "22:00:00",
    },
    {
      name: "10:30pm",
      value: "22:30:00",
    },
    {
      name: "11:00pm",
      value: "23:00:00",
    },
    {
      name: "11:30pm",
      value: "23:30:00",
    },
  ]);
  const isSelectedDay = selectedDay.indexOf(selectedDayName.dayNumber);
  const DurationsData = [15, 30, 45, 60];
  const dayNumber = [
    {
      dayName: "Monday",
      dayNumber: 0,
    },
    {
      dayName: "Tuesday",
      dayNumber: 1,
    },
    {
      dayName: "Wednesday",
      dayNumber: 2,
    },
    {
      dayName: "Thursday",
      dayNumber: 3,
    },
    {
      dayName: "Friday",
      dayNumber: 4,
    },
    {
      dayName: "Saturday",
      dayNumber: 5,
    },
    {
      dayName: "Sunday",
      dayNumber: 6,
    },
  ];

  useEffect(() => {
    timeZoneGenerate();
    get_working_hours();
    get_slot_times();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const get_slot_times = () => {
    const url = "api/working_hour/get_slot_times/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setDuration(res.data[0].slot_time);
      })
      .catch((err) => console.log("err", err));
  };

  const timeZoneGenerate = () => {
    const options2 = { timeZoneName: "long" };
    const userTimeZoneName2 = Intl.DateTimeFormat(undefined, options2).format(
      new Date()
    );
    const timeZoneAbbreviation2 = userTimeZoneName2.split(",")[1];
    setTimeZone(timeZoneAbbreviation2);
  };

  const get_working_hours = () => {
    const url = "api/working_hour/get_working_hours/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let day = [];
        res.data.map((item) => {
          day.push(item.dayName);
          selectedTime[item.dayName] = [];
          item.working_hour.map((hour) => {
            return selectedTime[item.dayName].push({
              start_time: hour.start_time,
              end_time: hour.end_time,
              last_time: hour.start_time,
            });
          });
        });
        setSelectedDay(day);
      })
      .catch((err) => console.log("err", err));
  };

  const handleSubmit = () => {
    setLoading(true);
    create_slot_time();
    let payload = [];
    selectedDay.map((item) => {
      let working_hour = [];
      selectedTime[item].map((tm) => {
        return working_hour.push({
          start_time: tm.start_time,
          end_time: tm.end_time,
        });
      });
      let data = {
        dayName: item,
        timezone: momentTz.tz.guess(),
        // slot_time: duration,
        working_hour: working_hour,
      };
      payload.push(data);
    });

    const url = "api/working_hour/update_working_hours/";
    axios
      .post(url, payload, config)
      .then(() => {
        setLoading(false);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
      })
      .catch((err) => setLoading(false));
  };

  const create_slot_time = () => {
    duration.sort();
    const url = "api/working_hour/create_slot_time/";
    axios
      .post(url, { slot_time: duration }, config)
      .then(() => {
        console.log("success");
      })
      .catch((err) => console.log("res", err));
  };

  const getHourDifference = (start, end) => {
    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);

    return (endDate - startDate) / (1000 * 60 * 60); // Convert milliseconds to hours
  };

  selectedDay.sort();
  return (
    <div className="availability-con">
      <div className="Durations_con">
        <h3>Meeting duration</h3>
        <h5>
          Select to give your contacts options to choose from your preferred
          durations while scheduling a meeting.
        </h5>
        <div className="minutes_select">
          {DurationsData.map((item, index) => {
            return (
              <button
                onClick={() => {
                  let id = duration.indexOf(item);
                  if (duration.includes(item)) {
                    if (duration.length > 1) {
                      duration.splice(id, 1);
                      setDuration(JSON.parse(JSON.stringify(duration)));
                    }
                  } else {
                    setDuration((prev) => [...prev, item]);
                  }
                }}
                className={duration.includes(item) ? "active_btn" : ""}
                key={index}
              >
                <input
                  checked={duration.includes(item)}
                  type="checkbox"
                  readOnly
                />
                <span>{item} mins</span>
              </button>
            );
          })}
        </div>
      </div>
      <h3>Preferred days</h3>
      <h5>Choose the preferred days you want to connect your contacts.</h5>
      <div className="availability_bottom_wrapper">
        <div className="availability-select-day">
          {dayNumber.map((item, index) => {
            return (
              <button
                key={"day" + index}
                className={
                  selectedDayName.dayName === item.dayName ? "active" : ""
                }
                onClick={() => {
                  setSelectedDayName(item);
                }}
              >
                {item.dayName}
              </button>
            );
          })}
        </div>
        <div className="availability_selectedDayName">
          {isSelectedDay !== -1 ? (
            <h3>Available slots for {selectedDayName.dayName}</h3>
          ) : (
            <h3>No slots on {selectedDayName.dayName}</h3>
          )}
          <h5>
            Add a window OR multiple windows of available slots for your
            <br />
            contacts, just so they can schedule meeting accordingly.
          </h5>
          <div className="availability-selected-day">
            <div className="availability-selected-day-item">
              <div className="availability-selected-day-item-in">
                <div className="availability-selected-day-item-top">
                  <div className="availability-time-wrapper">
                    {selectedTime[selectedDayName.dayNumber]?.map(
                      (time, index) => {
                        return (
                          <>
                            <div
                              key={
                                "time" + selectedDayName.dayNumber + "-" + index
                              }
                              className="availability-selected-time"
                            >
                              <p
                                style={{ marginLeft: 0, marginRight: 24 }}
                                className="availability-time-to"
                              >
                                Slot {index + 1}
                              </p>
                              <div className="availability-time-picker">
                                <select
                                  value={time["start_time"]}
                                  onChange={(e) => {
                                    if (time === undefined) {
                                      time = {};
                                    }
                                    time["start_time"] = e.target.value;
                                    time["last_time"] = e.target.value;
                                    setSelectedTime(selectedTime);
                                    setAllTime(
                                      JSON.parse(JSON.stringify(AllTime))
                                    );
                                  }}
                                >
                                  {selectedTime[selectedDayName.dayNumber][
                                    index - 1
                                  ] !== undefined
                                    ? selectedTime[selectedDayName.dayNumber][
                                        index - 1
                                      ].last_time !== ""
                                      ? AllTime.map((item, index) => {
                                          if (time["last_time"] <= item.value) {
                                            return (
                                              <option
                                                key={"time" + index}
                                                value={item.value}
                                              >
                                                {item.name}
                                              </option>
                                            );
                                          }
                                        })
                                      : ""
                                    : AllTime.map((item, index) => {
                                        return (
                                          <option
                                            key={"time" + index}
                                            value={item.value}
                                          >
                                            {item.name}
                                          </option>
                                        );
                                      })}
                                </select>
                              </div>
                              <p className="availability-time-to">to</p>
                              <div className="availability-time-picker">
                                <select
                                  value={time["end_time"]}
                                  onChange={(e) => {
                                    if (time === undefined) {
                                      time = {};
                                    }
                                    time["end_time"] = e.target.value;
                                    setSelectedTime(selectedTime);
                                    setAllTime(
                                      JSON.parse(JSON.stringify(AllTime))
                                    );
                                  }}
                                >
                                  {AllTime.map((item, index) => {
                                    if (time["last_time"] < item.value) {
                                      return (
                                        <option
                                          key={"time" + index}
                                          value={item.value}
                                        >
                                          {item.name}
                                        </option>
                                      );
                                    }
                                  })}
                                </select>
                              </div>
                              <p
                                style={{ width: 52 }}
                                className="availability-time-to availability-time-to2"
                              >
                                {getHourDifference(
                                  time["start_time"],
                                  time["end_time"]
                                ) + " "}
                                hour
                              </p>
                              <button
                                className="remove-time"
                                onClick={() => {
                                  let id =
                                    selectedTime[
                                      selectedDayName.dayNumber
                                    ].indexOf(time);
                                  if (index !== 0) {
                                    if (id !== -1) {
                                      selectedTime[
                                        selectedDayName.dayNumber
                                      ].splice(id, 1);
                                      setSelectedTime(
                                        JSON.parse(JSON.stringify(selectedTime))
                                      );
                                    }
                                  } else {
                                    selectedDay.splice(index, 1);
                                    setSelectedDay(
                                      JSON.parse(JSON.stringify(selectedDay))
                                    );
                                    if (id !== -1) {
                                      selectedTime[
                                        selectedDayName.dayNumber
                                      ].splice(id, 1);
                                      setSelectedTime(
                                        JSON.parse(JSON.stringify(selectedTime))
                                      );
                                    }
                                  }
                                }}
                              >
                                <img src={deleteIcon} alt="deleteIcon" />
                              </button>
                            </div>
                            <hr />
                          </>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn-outline"
            onClick={() => {
              if (isSelectedDay === -1) {
                setSelectedDay((current) => [
                  ...current,
                  selectedDayName.dayNumber,
                ]);
                selectedTime[selectedDayName.dayNumber] = [
                  {
                    start_time: "08:00:00",
                    end_time: "18:00:00",
                    last_time: "08:00:00",
                  },
                ];
              } else {
                const end_time =
                  selectedTime[selectedDayName.dayNumber][
                    selectedTime[selectedDayName.dayNumber].length - 1
                  ]?.end_time;
                selectedTime[selectedDayName.dayNumber].push({
                  start_time: end_time
                    ? moment(end_time, "HH:mm:ss")
                        .add(1, "hour")
                        .format("HH:mm:ss")
                    : "08:00:00",
                  end_time: end_time
                    ? moment(end_time, "HH:mm:ss")
                        .add(2, "hour")
                        .format("HH:mm:ss")
                    : "18:00:00",
                  last_time: end_time
                    ? moment(end_time, "HH:mm:ss").format("HH:mm:ss")
                    : "08:00:00",
                });
                setSelectedTime(JSON.parse(JSON.stringify(selectedTime)));
                setAllTime(JSON.parse(JSON.stringify(AllTime)));
              }
            }}
          >
            Add a slot
          </button>
          <p className="time-zone-text">Timezone: {timeZone}</p>
        </div>
      </div>

      <div>
        <button
          disabled={loading ? true : false}
          className={"mt-5 btn-primary"}
          onClick={handleSubmit}
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
    </div>
  );
}

export default Availability;
