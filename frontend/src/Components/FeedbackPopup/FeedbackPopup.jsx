import axios from "axios";
import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import { Dialog, DialogContent, Slide } from "@mui/material";
import "./FeedbackPopup.scss";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

function FeedbackPopup(props) {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const isMobile = window.innerWidth <= 576;

  const [ratings, setRatings] = useState();
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/review/user_feedback/";
    const payload = {
      emoji: ratings,
      comment: message,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setLoading(false);
        setMessage("");
        props.handleClose();
        props.onSuccess();
      })
      .catch((err) => {
        setLoading(false);
        swal({
          text: err?.response?.data?.message,
          icon: "warning",
        });
      });
  };

  return (
    <Dialog
      open={props.showFeedbackPopup}
      onClose={props.handleClose}
      maxWidth={false}
      TransitionComponent={Transition}
      transitionDuration={500}
      TransitionProps={{
        sx: { justifyContent: isMobile ? "center" : "flex-start" },
      }}
      PaperProps={{
        sx: {
          margin: isMobile ? "0" : "0 0 0 240px",
          borderRadius: 4,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)!important",
        },
      }}
    >
      <DialogContent className="feedback_popup_con">
        <h2>Feedback</h2>
        <p>Our team is working hard to help you with our best intensions...</p>
        {!ratings ? (
          <div className="feedback_emoji">
            <button onClick={() => setRatings("Satisfied")}>
              <span>😍</span>
              <span>Satisfied</span>
            </button>
            <button onClick={() => setRatings("Moderately satisfied")}>
              <span>☺️</span>
              <span></span>
            </button>
            <button onClick={() => setRatings("Not satisfied")}>
              <span>😡</span>
              <span>Not satisfied</span>
            </button>
          </div>
        ) : (
          <div className="feedback_input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your feedback means a lot to us!"
            ></textarea>
            <button
              disabled={!message || loading}
              onClick={handleSubmit}
              className="btn-primary"
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackPopup;
