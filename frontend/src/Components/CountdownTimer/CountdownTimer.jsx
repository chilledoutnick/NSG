import axios from "axios";
import { useState, useEffect } from "react";

const calculateTimeLeft = (targetDate) => {
  const difference = new Date(targetDate) - new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return timeLeft;
};

const CountdownTimer = ({ targetDate }) => {
  // Set to end of day (23:59:59.999) in local time
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endOfDay));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endOfDay));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);


  return (
    <div className="count_down_timer">
      <p>
        <span>DAYS</span>
        <span>{String(timeLeft.days).padStart(2, "0")} :</span>
      </p>
      <p>
        <span>HOURS</span>
        <span>{String(timeLeft.hours).padStart(2, "0")} :</span>
      </p>
      <p>
        <span>MINS</span>
        <span>{String(timeLeft.minutes).padStart(2, "0")} :</span>
      </p>
      <p>
        <span>SECS</span>
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
      </p>
    </div>
  );
};

export default function App() {
  // Set default date to next day from current day
  const getNextDay = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    return tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const [targetDate, setTargetDate] = useState(getNextDay());
  
  // If you need to fetch the date from an API
  useEffect(() => {
    const get_date = () => {
      const url = "/api/dynamic_date/get_date/";
      axios
        .get(url)
        .then((res) => {
          setTargetDate(res.data.date);
        })
        .catch((err) => console.log("err", err));
    };
    
    get_date();
  }, []);

  return <CountdownTimer targetDate={targetDate} />
}