import axios from "axios";
import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import swal from "sweetalert";
import moment from "moment/moment";
import { ThreeDots } from "react-loader-spinner";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

import "./Review.scss";

function Review(props) {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${props_token}`,
    },
  };

  const [loading, setLoading] = useState(false);
  const [isReview, setIsReview] = useState(false);
  const [averageRating, setAverageRating] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupReview, setShowPopupReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewData, setReviewData] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (props.advisor.is_review !== undefined) {
      setIsReview(props.advisor.is_review);
    }
  }, [props.advisor]);

  useEffect(() => {
    getReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    reviewData[name] = value;
    setReviewData({
      ...reviewData,
    });
  };

  const handleClickOpen = () => {
    setShowPopup(true);
  };

  const getReview = () => {
    // const url = "api/review/get_review_by_advisor/";
    const url = "api/review/get_review_by_user/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setAverageRating(res.data.avg_rating);
        setReviews(res.data.data);
      })
      .catch((err) => console.log("err", err));
  };

  const askForReview = () => {
    setLoading(true);
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    };
    const url = "api/review/ask_for_review/";
    const payload = {
      name: reviewData.name,
      email: reviewData.email,
      comments: reviewData.message,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setLoading(false);
        setReviewError("");
        setReviewData({
          name: "",
          email: "",
          message: "",
        });
      })
      .catch((err) => {
        setReviewError(err.response.data.message);
        setLoading(false);
      });
  };

  const update_web = (is_review) => {
    const formData = new FormData();
    formData.append("is_review", is_review);
    // const url = "api/advisor/update_web/";
    const url = "api/user_profile/update_user/";
    axios
      .post(url, formData, config)
      .then()
      .catch((err) => console.log("err", err));
  };

  return (
    <div className="review-con">
      <Dialog
        open={showPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopup(false)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Ask for review</h4>
          </div>
          <p className="ask_review_text">
            Send an email to invite your clients to write a review
          </p>
          <div className="edit_info_form">
            <label htmlFor="Name">Name</label>
            <input
              type="text"
              placeholder="Add Name"
              name="name"
              value={reviewData.name}
              onChange={handleChange}
            />
            <label htmlFor="Email ID">Email ID</label>
            <input
              type="text"
              placeholder="Email ID"
              name="email"
              value={reviewData.email}
              onChange={handleChange}
            />
            <label htmlFor="message">Include a personalized message</label>
            <textarea
              type="text"
              placeholder="Hi, would you write me a review please?"
              name="message"
              value={reviewData.message}
              onChange={handleChange}
            />
          </div>

          <div className="edit_info_btn">
            {reviewError && <p className="error">{reviewError}</p>}
            <button onClick={askForReview}>
              {!loading ? (
                "Send"
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
        </DialogContent>
      </Dialog>
      <Dialog
        open={showPopupReview}
        onClose={() => setShowPopupReview(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopupReview(false)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Reviews Section</h4>
          </div>
          <div className="review_content">
            <div className="review_content_btn">
              <p>
                Enable NSG review section to collect review and build trust
                on your profile.
              </p>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  size={"xl"}
                  id="flexSwitchCheckDefault"
                  checked={isReview}
                  onChange={(e) => {
                    setIsReview(e.target.checked);
                    update_web(e.target.checked);
                  }}
                />
              </div>
            </div>
            <hr />
            {isReview && (
              <div className="review_content_ask">
                <p>
                  Send an email to your happy customers to ask for a review.{" "}
                  {/* <img src={smile} alt="smile" /> */}
                </p>
                <button
                  onClick={() => setShowPopup(true)}
                  className="btn-primary"
                >
                  Ask for review
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <h2 className="profile-review-header">
        Reviews{" "}
        <button
          onClick={() => setShowPopupReview(true)}
          className="tm_edit_btn"
        >
          {isReview ? "Edit" : "Add"}
        </button>
      </h2>

      {isReview && reviews.length > 0 && (
        <>
          <div className="profile-review-rating-wrapper">
            <div className="profile-review-rating">
              <h3>{averageRating}</h3>
              <div className="rating-wrapper">
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003321_png.webp"
                  alt="rating"
                />
                <span> {reviews.length} reviews</span>
              </div>
            </div>
            <button
              onClick={handleClickOpen}
              className="profile-review-rating-btn"
            >
              Ask for a review
            </button>
          </div>

          {reviews.length > 0 ? (
            <div className="profile-review-navigate">
              <button
                className="shadow"
                onClick={() => {
                  $(document).ready(function () {
                    $("#profile-review").animate(
                      {
                        scrollLeft: "-=" + 480 + "px",
                      },
                      "slow"
                    );
                  });
                }}
              >
                <WestRoundedIcon className="navigate-icon" />
              </button>
              <button
                className="shadow"
                onClick={() => {
                  $(document).ready(function () {
                    $("#profile-review").animate(
                      {
                        scrollLeft: "+=" + 480 + "px",
                      },
                      "slow"
                    );
                  });
                }}
              >
                <EastRoundedIcon className="navigate-icon" />
              </button>
            </div>
          ) : (
            ""
          )}
          <div className="profile-review" id="profile-review">
            {reviews.map((item, index) => {
              return (
                <div key={index} className="profile-review-item">
                  <div className="profile-review-top">
                    <Avatar
                      src="Avatar"
                      alt={item.name}
                      className="profile-review-img"
                    />
                    <div className="profile-review-name-con">
                      <h2 className="profile-review-name">{item.name}</h2>
                      <h3 className="profile-review-date">
                        {moment(item.create_date).format("DD MMMM YYYY")}
                      </h3>
                      <Rating
                        name="read-only"
                        className="mb-3 review_ratings"
                        value={item.ratings}
                        color="#fffff"
                        readOnly
                      />
                    </div>
                  </div>
                  <p className="profile-review-desc">{item.comments}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Review;
