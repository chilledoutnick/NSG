import axios from "axios";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Dialog, DialogContent, Slide } from "@mui/material";
import Refer from "../Refer/Refer";
import Feedback from "../../Pages/Feedback/Feedback";
import "./PopupTrigger.scss";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PopupTrigger() {
  const [showReferComponent, setShowReferComponent] = useState(false);
  const [showFeedbackComponent, setShowFeedbackComponent] = useState(false);
  const NSG_week_number = JSON.parse(
    localStorage.getItem("NSG_week_number")
  );
  const handlePopupRefCLose = () => {
    setShowReferComponent(false);
  };
  const handlePopupFeedCLose = () => {
    setShowFeedbackComponent(false);
  };

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    let weedNumber = moment().week();
    if (NSG_week_number === null) {
      count_referrals();
      localStorage.setItem("NSG_week_number", weedNumber);
    } else {
      if (NSG_week_number === weedNumber) {
        localStorage.setItem("NSG_week_number", weedNumber);
      } else {
        count_referrals();
        localStorage.setItem("NSG_week_number", weedNumber);
      }
    }
  }, []);

  const ReferComponent = (
    <Refer isPopup={true} handlePopupRefCLose={handlePopupRefCLose} />
  );

  const FeedbackComponent = (
    <Feedback isPopup={true} handlePopupRefCLose={handlePopupFeedCLose} />
  );

  const count_referrals = () => {
    const url = "api/refer/count_referrals/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let contact_count = res.data.contact_count;
        let is_reviewed = res.data.is_reviewed;
        if (contact_count > 4 && !is_reviewed) {
          setTimeout(() => {
            setShowFeedbackComponent(true);
          }, 5000);
        }
        if (contact_count > 9 && is_reviewed) {
        }
      })
      .catch((err) => console.log("err", err));
  };

  return showFeedbackComponent ? (
    <Dialog
      open={showFeedbackComponent}
      onClose={() => setShowFeedbackComponent(false)}
      maxWidth={false}
      TransitionComponent={Transition}
      transitionDuration={500}
    >
      <DialogContent className="PopupTrigger">
        {FeedbackComponent}
      </DialogContent>
    </Dialog>
  ) : (
    <Dialog
      open={showReferComponent}
      onClose={() => setShowReferComponent(false)}
      maxWidth={false}
      TransitionComponent={Transition}
      transitionDuration={500}
    >
      <DialogContent className="PopupTrigger">{ReferComponent}</DialogContent>
    </Dialog>
  );
}

export default PopupTrigger;
