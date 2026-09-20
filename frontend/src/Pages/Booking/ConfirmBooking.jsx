import  { useState } from "react";
import { useLocation } from "react-router-dom";
import moment from "moment";
import "./Responsive.scss";
import "./Booking.scss";
import NSG from "./img/NSG.png";
import check from "./img/check.png";

function ConfirmBooking() {
  const location = useLocation();
  const [data] = useState(location.state ? location.state : "");

  return (
    <div className="confirm-booking-con">
      <h2 className="confirm-booking-thank-you">Thank you</h2>
      <p className="confirm-booking-trust">for trusting us with your goals!</p>
      <img
        src={check}
        alt="check"
        className="confirm-booking-logo-check"
        loading="lazy"
      />
      <h1 className="confirm-booking-confirm-text">Booking Confirmed</h1>
      <p className="confirm-booking-confirm-text2">
        Confirmation email has been sent to your mail id
      </p>
      <h3 className="confirm-booking-details-text">Booking Details</h3>
      <p className="confirm-booking-name">{data.name}</p>
      <p className="confirm-booking-date">
        {data.appointment
          ? moment(data.appointment.appointment_date).format("LL")
          : ""}
      </p>
      <p className="confirm-booking-time">
        {data.appointment
          ? moment(data.appointment.appointment_time, "HH:mm:ss").format("LT") +
            " - " +
            moment(data.appointment.appointment_time, "HH:mm:ss")
              .add(data.appointment.duration, "minute")
              .format("LT")
          : ""}
      </p>
      <p className="confirm-booking-calendar"></p>
      <button
        onClick={() => window.location.replace("/" + data.user_name)}
        className="btn-primary confirm-booking-go-home-btn"
      >
        Go to Home
      </button>
      <img
        src={NSG}
        alt="NSG"
        className="confirm-booking-nsg-logo"
        loading="lazy"
      />
    </div>
  );
}
export default ConfirmBooking;
