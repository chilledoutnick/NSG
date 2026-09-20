import axios from "axios";
import  { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import moment from "moment";
import swal from "sweetalert";
import CloseIcon from "@mui/icons-material/Close";
import "./Feedback.scss";

const star =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Star-Struck_png.webp";

const rating1 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Pensive_Face_png.webp";
const rating2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Expressionless_Face_png.webp";
const rating3 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Slightly_Smiling_Face_png.webp";
const rating4 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Smiling_Face_png.webp";
const rating5 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Star-Struck_png_en2kqrL.webp";

function Feedback(props) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [isRecommend, setIsRecommend] = useState(true);
  const [loading, setLoading] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_info"));

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/public_review/post_review/";
    const payload = {
      ratings: rating,
      comments: message,
      name: user_info.name,
      email: user_info.email,
      create_date: moment().format("YYYY-MM-DD"),
      update_date: moment().format("YYYY-MM-DD"),
    };

    axios
      .post(url, payload)
      .then((res) => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setLoading(false);
        setMessage("");
        props.handlePopupRefCLose();
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const Content = (
    <div
      className={"feedback_con " + (props.isPopup ? "feedback_con_popup" : "")}
    >
      {!props.isPopup && (
        <h1>
          <img loading="lazy" alt="STAR" src={star} /> Join Us in Improving
          NSG
        </h1>
      )}
      {props.isPopup && (
        <button
          className="close_btn"
          onClick={() => {
            props.handlePopupRefCLose();
          }}
        >
          <CloseIcon />
        </button>
      )}

      <div className="feedback_contant">
        <h3>Share Your Review</h3>
        <h4>
          How satisfied are you after using the <br /> product for that long?{" "}
          <span>*</span>
        </h4>
        <div className="rating_con">
          <button
            className={rating === 1 ? "active" : ""}
            onClick={() => setRating(1)}
          >
            <img src={rating1} alt="Rating" loading="lazy" />
          </button>
          <button
            className={rating === 2 ? "active" : ""}
            onClick={() => setRating(2)}
          >
            <img src={rating2} alt="Rating" loading="lazy" />
          </button>
          <button
            className={rating === 3 ? "active" : ""}
            onClick={() => setRating(3)}
          >
            <img src={rating3} alt="Rating" loading="lazy" />
          </button>
          <button
            className={rating === 4 ? "active" : ""}
            onClick={() => setRating(4)}
          >
            <img src={rating4} alt="Rating" loading="lazy" />
          </button>
          <button
            className={rating === 5 ? "active" : ""}
            onClick={() => setRating(5)}
          >
            <img src={rating5} alt="Rating" loading="lazy" />
          </button>
        </div>
        <h5>Your review</h5>
        <textarea
          value={message}
          placeholder="Example: | bought this product a month ago and I am very happy with it's quality."
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <h5>
          Would you recommend this <br />
          product to a friend?
        </h5>
        <div className="checkbox_con">
          <input
            checked={isRecommend}
            type="checkbox"
            onChange={(e) => setIsRecommend(true)}
          />
          <label htmlFor="Yes">Yes</label>
          <input
            checked={!isRecommend}
            type="checkbox"
            onChange={(e) => setIsRecommend(false)}
          />
          <label htmlFor="Yes">No</label>
        </div>
        <button onClick={handleSubmit} disabled={message === ""} className="btn-primary">
          {!loading ? (
            "Submit"
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
        <p className="res_text">We’ll response to “{user_info.email}”</p>
      </div>
    </div>
  );

  return <>{Content}</>;
}

export default Feedback;
