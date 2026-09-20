import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import moment from "moment/moment";
import swal from "sweetalert";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import Dialog from "@mui/material/Dialog";
import "./Review.scss";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import StarIcon from "@mui/icons-material/Star"; // optional for solution #3

function Review(props) {
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rating, setRating] = useState(5);
  const reviewContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comments: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "+1",
    How_can_we_help_you: "",
  });

  const totalReviews = reviews ? reviews.length : 0;
  const getStepWidth = () => {
    const container = reviewContainerRef.current;
    if (container && container.children.length > 1) {
      const firstCard = container.children[0];
      const secondCard = container.children[1];
      return secondCard.offsetLeft - firstCard.offsetLeft;
    }
    return 300 + 12;
  };

  const scrollRight = () => {
    if (currentPage < totalReviews) {
      const newPage = currentPage + 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      reviewContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      reviewContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleClickOpen = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });
  };

  useEffect(() => {
    if (props.advisor.user_id !== undefined) {
      getReview();
    }
  }, [props.advisor.user_id]);

  const getReview = () => {
    const url = "api/profile_review/get_review_by_user/";
    axios
      .post(url, { username: props.advisor.username })
      .then((res) => {
        setReviews(res.data.data);
        setAverageRating(res.data.avg_rating);
      })
      .catch((err) => console.log("err", err));
  };

  const makeReview = () => {
    setLoading(true);
    const url = "api/profile_review/post_review_user/";
    const payload = {
      name: formData.name,
      rating: rating,
      comment: formData.comments,
      email: formData.email,
      username: props.advisor.username,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setLoading(false);
        getReview();
        handleClose();
        setFormData({
          ...formData,
          name: "",
          email: "",
          comments: "",
        });
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setErrorMsg("");
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.response.data.message);
      });
  };

  return (
    <div className="review-con">
      <Dialog open={showPopup} onClose={handleClose} maxWidth={"md"}>
        <DialogContent className="review-popup">
          <h2>Share your review </h2>
          <p>Overall Rating</p>
          <Rating
            name="rating"
            className="mb-3 text-dark"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
          />
          <p className="write-review">Write your review</p>
          <textarea
            onChange={handleChange}
            name="comments"
            className="review-popup-input-area"
            value={formData.comments}
          />
          <TextField
            onChange={handleChange}
            name="name"
            label="name*"
            value={formData.name}
            className="review-popup-input"
          />
          <TextField
            onChange={handleChange}
            name="email"
            label="Email ID*"
            value={formData.email}
            className="review-popup-input"
          />
          {errorMsg && <p className="error">{errorMsg}</p>}
          <button
            onClick={makeReview}
            disabled={
              loading === true ||
              formData.comments === "" ||
              formData.name === "" ||
              formData.email === "" ||
              rating === 0
                ? true
                : false
            }
            className={
              "mt-3 " +
              (formData.comments !== "" &&
              formData.name !== "" &&
              formData.email !== "" &&
              rating !== 0
                ? "btn-primary"
                : "btn-disabled")
            }
          >
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
        </DialogContent>
      </Dialog>
      
      {props.is_review && reviews.length > 0 && (
        <>
          <h2 className="profile-review-header">Reviews</h2>
          <div className="profile-review-rating-wrapper">
            <div className="profile-review-rating">
              <h3>{averageRating}</h3>
              <span>{reviews.length} reviews</span>
            </div>
          </div>

          <div className="rating-wrapper">
            <img
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003321_png.webp"
              alt="rating"
            />
          </div>

          <button
            onClick={handleClickOpen}
            className="profile-review-rating-btn"
          >
            Write a Review
          </button>

          <div
            className="profile-review"
            id="profile-review"
            ref={reviewContainerRef}
          >
            {reviews.map((item, index) => (
              <div key={index} className="profile-review-item">
                <div className="profile-review-top">
                  <div className="profile-review-name-con">
                    <h2 className="profile-review-name">{item.name}</h2>

                    <Rating
                      name="read-only"
                      className="mb-3 review_ratings"
                      value={item.ratings}
                      readOnly
                      sx={{
                        // target the rating icon wrapper
                        "& .MuiRating-icon": {
                          // fallback in case svg uses color
                          color: "#faaf00 !important",
                        },
                        // specifically target the MUI SvgIcon element
                        "& .MuiSvgIcon-root": {
                          color: "#faaf00 !important",
                        },
                        // target actual path fill (covers inline fill cases)
                        "& .MuiSvgIcon-root path": {
                          fill: "#faaf00 !important",
                        },
                      }}
                    />
                  </div>
                </div>
                <p className="profile-review-desc">{item.comments}</p>
              </div>
            ))}
          </div>
          <div className="profile_nav">
            <span>
              {reviews?.length ? `${currentPage}/${reviews.length}` : ""}
            </span>

            <div>
              <button onClick={scrollLeft} disabled={currentPage === 1}>
                <KeyboardArrowLeftIcon />
              </button>
              <button
                onClick={scrollRight}
                disabled={currentPage === totalReviews}
              >
                <KeyboardArrowRightIcon />
              </button>
            </div>
          </div>
       

        </>
      )}
       {(!props.is_review || reviews?.length === 0) && (
  <div className="profile-review-rating-wrapper justify-center">
    <button
      onClick={handleClickOpen}
      className="profile-review-rating-btn"
    >
      Write a Review
    </button>
  </div>
)}
    </div>
  );
}

export default Review;
