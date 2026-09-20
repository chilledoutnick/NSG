import { useEffect, useState } from "react";
import "./UserInfo.scss"; // Import the CSS file
import swal from "sweetalert";
import axios from "axios";
import moment from "moment";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";

function CountDownTimer() {
  const [date, setTargetDate] = useState("");

  useEffect(() => {
    get_date();
  }, []);

  const get_date = () => {
    const url = "/api/dynamic_date/get_date/";
    axios
      .get(url)
      .then((res) => {
        setTargetDate(res.data.date);
      })
      .catch((err) => console.log("err", err));
  };

  const post_date = () => {
    const url = "/api/dynamic_date/post_date/";
    const payload = {
      date: date,
    };
    axios
      .post(url, payload)
      .then(() => {
        swal({
          text: "Uploaded",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        get_date()
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <div className="countdown-container">
      <h1 className="countdown-title">Countdown Timer</h1>

      <div className="countdown-input-container">
        <label htmlFor="target-date" className="countdown-label">
          Select Target Date:
        </label>
        <input
          type="date"
          id="target-date"
          value={date}
          onChange={(e) => setTargetDate(e.target.value)}
          min={moment().format("YYYY-MM-DD")}
          className={`countdown-input`}
        />
      </div>
      {date && (
        <div className="countdown-date-display">
          <p>Selected Date: {moment(date).format("MMM Do YYYY")} </p>
        </div>
      )}
      <button
        onClick={post_date}
        disabled={!date}
        className="btn-primary mx-auto mt-3"
      >
        Save
      </button>
      <BottomBar />
    </div>
  );
}

export default CountDownTimer;
