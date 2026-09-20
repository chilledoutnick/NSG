import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CustomDatePicker.scss";

function CustomDatePicker({ selectedDate, onDateChange }) {
  const dateObject = selectedDate
    ? moment(selectedDate, "YYYY-MM-DD").toDate()
    : null;

  const handleDateChange = (date) => {
    onDateChange(moment(date).format("YYYY-MM-DD"));
  };

  return (
    <DatePicker
      inline
      minDate={new Date()}
      selected={dateObject}
      onChange={handleDateChange}
      className="custom-datepicker"
    />
  );
}

export default CustomDatePicker;
