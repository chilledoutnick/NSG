import axios from "axios";
import  { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import SnoozeIcon from "@mui/icons-material/Snooze";
import CameraAltIcon from "@mui/icons-material/CameraAltOutlined";
import EventIcon from "@mui/icons-material/Event";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import BlurPopup from "../BlurPopup/BlurPopup";
import "./NoteAndReminder.scss";

function NoteAndReminder(props) {
  const [Loading, setLoading] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [NoteText, setNoteText] = useState("");
  const [seletedDate, setSelectedDate] = useState(null);
  const [seletedItem, setSeletedItem] = useState("");
  const [contact_ids, setContact_ids] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (props.selectedPeople) {
      props.selectedPeople.forEach((item) => {
        setContact_ids((prev) => {
          if (!prev.includes(item.contact_id)) {
            return [...prev, item.contact_id];
          }
          return prev; // Return the state unchanged if it's a duplicate
        });
      });
    }
  }, []);

  useEffect(() => {
    if (props.note_id) {
      get_note_reminder(props.note_id);
    }
  }, []);


  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...selectedFiles]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const times = [
    {
      time: "1 hour",
      value: 1,
      type: 1,
    },
    {
      time: "3 days",
      value: 3,
      type: 2,
    },
    {
      time: "8 hours",
      value: 8,
      type: 1,
    },
    {
      time: "1 week",
      value: 7,
      type: 2,
    },
    {
      time: "24 hours",
      value: 24,
      type: 1,
    },
    {
      time: "1 month",
      value: 1,
      type: 3,
    },
  ];

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const givenTime = moment(seletedDate, "YYYY-MM-DD HH:mm"); 
  const currentTime = moment();
  const diffInMinutes = Math.abs(currentTime.diff(givenTime, 'minutes'))+1; 

  const formData = new FormData();
  formData.append("contact_ids", JSON.stringify(contact_ids));
  formData.append("note_text", NoteText);
  if (seletedDate) {
    formData.append("reminder_datetime", seletedDate + ":10");
    formData.append("countdown", diffInMinutes);
  }
  if (props.note_id) {
    formData.append("note_reminder_id", props.note_id);
  }
  images.forEach((image) => {
    formData.append("images", image);
  });

  const add_note_reminder = () => {
    setLoading(true);
    const url = props.note_id
      ? "api/note_reminder/update_note_reminder/"
      : "api/note_reminder/add_note_reminder/";
    axios
      .post(url, formData, config)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: props.note_id
            ? "Note updated successfully"
            : "Note added successfully",
          showConfirmButton: false,
          timer: 3000,
        });
        props.handleCLose();
        if (props.handleTimelineRefresh) {
          props.handleTimelineRefresh();
        }
        if (props.get_timeline) {
          props.get_timeline();
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.data) {
          Swal.fire({
            icon: "warning",
            title: "something went wrong.",
            text: err.response?.data?.message,
            showConfirmButton: true,
          });
        }
      });
  };

  const get_note_reminder = (id) => {
    const url = "api/note_reminder/get_note_reminder/";
    const payload = {
      note_reminder_id: id,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setNoteText(res.data.note_text);
        setImages(res.data.images);
        if (res.data.reminder_datetime) {
          setSelectedDate(
            moment(res.data.reminder_datetime).format("YYYY-MM-DD HH:mm")
          );
        }
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <>
      <div className="note_and_reminder_con">
        <button onClick={props.handleCLose} className="close_btn">
          <CloseIcon />
        </button>
        <div className="note_and_reminder_contant">
          <h5>
            <EditNoteIcon />
            Note{" "}
            {props.selectedPeople.length === 1 &&
              " for " + props.selectedPeople[0].name}
          </h5>
          <div className="note_textarea">
            <textarea
              value={NoteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type a note here"
            ></textarea>
            <div className="note_textarea_input">
              <button className="CameraAltIcon">
                <CameraAltIcon className="icon" />
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </button>
            </div>
            <div className="note_image_preview">
              {images.map((img, index) => (
                <div key={index} className="note_image_preview_wrapper">
                  <img
                    src={img.name ? URL.createObjectURL(img) : img}
                    alt={`Preview ${index + 1}`}
                  />
                  <button onClick={() => removeImage(index)}>
                    <RemoveCircleOutlineIcon className="icon" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="note_btns">
          {seletedDate ? (
            <button
              onClick={() => setShowReminder(true)}
              className="add_reminder_btn"
            >
              <SnoozeIcon /> Reminder at
              {" " + moment(seletedDate).format("h:mm a | DD MMM YYYY, ")}
            </button>
          ) : (
            <button
              onClick={() => setShowReminder(true)}
              className="add_reminder_btn"
            >
              <SnoozeIcon /> Add a reminder
            </button>
          )}

          <div className="note_btns_wrapper">
            <button onClick={props.handleCLose} className="btn-outline">
              Cancel
            </button>
            <button
              disabled={!NoteText && !seletedDate}
              onClick={add_note_reminder}
              className="btn-primary"
            >
              {!Loading ? (
                props.note_id ? (
                  "Update"
                ) : (
                  "Add to list"
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
        </div>
      </div>
      {showReminder && (
        <BlurPopup
          onClose={() => setShowReminder(false)}
          openState={showReminder}
          ComponentClass="remider_popup_wrapper"
        >
          <div className="blurpopup_con_wrapper remider_popup">
            <h3>
              <SnoozeIcon className="icon" /> Add a reminder
            </h3>
            <p>Set a reminder for:</p>
            <div className="reminder_popup_times">
              {times.map((item, index) => {
                return (
                  <div
                    className="reminder_popup_time_item"
                    key={index + "time"}
                  >
                    <input
                      type="radio"
                      checked={item.time === seletedItem}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeletedItem(item.time);
                          if (item.type === 1) {
                            setSelectedDate(
                              moment()
                                .add("hour", item.value)
                                .format("YYYY-MM-DD HH:mm")
                            );
                          } else if (item.type === 2) {
                            setSelectedDate(
                              moment()
                                .add("day", item.value)
                                .format("YYYY-MM-DD HH:mm")
                            );
                          } else {
                            setSelectedDate(
                              moment()
                                .add("month", item.value)
                                .format("YYYY-MM-DD HH:mm")
                            );
                          }
                        } else {
                          setSelectedDate("");
                        }
                      }}
                    />
                    <span>{item.time}</span>
                  </div>
                );
              })}
            </div>
            <p className="show_time_text">
              {seletedDate &&
                moment(seletedDate).format("MMMM Do YYYY, h:mm a")}
            </p>

            <button className="particular_date_btn">
              OR, Select a particular date
              <div className="particular_date_btn_wrapper">
                <input
                  type="datetime-local"
                  onChange={(e) =>
                    setSelectedDate(
                      moment(e.target.value).format("YYYY-MM-DD HH:mm")
                    )
                  }
                />
                <EventIcon />
              </div>
            </button>
            <div className="remider_popup_btns">
              <button
                onClick={() => {
                  setSelectedDate("");
                  setShowReminder(false);
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReminder(false)}
                className="btn-primary"
                disabled={!seletedDate}
              >
                Set
              </button>
            </div>
          </div>
        </BlurPopup>
      )}
    </>
  );
}

export default NoteAndReminder;
