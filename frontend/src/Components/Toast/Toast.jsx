import "./Toast.scss";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const Toast = ({ text }) => {
  return (
    <div className="toast_con">
      <span>
        <CheckCircleOutlineIcon className="icon" /> {text}
      </span>
    </div>
  );
};

export default Toast;
