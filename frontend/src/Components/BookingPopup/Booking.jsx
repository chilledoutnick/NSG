import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CloseIcon from "@mui/icons-material/Close";
import BookingComp from "../../Pages/Booking/Booking";
import "./Booking.scss";

function Booking(props) {
  const windowWidth = useRef(window.innerWidth);
  const isMobile = windowWidth.current < 576 ? true : false;
  const [showPopup, setShowPopup] = useState(false);
  const [showinfo, setShowinfo] = useState(false);

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      {props.advisor.scheduling && props.showAppointmentSection && (
        <div className="booking_con">
          <Dialog
            open={showPopup}
            onClose={() => setShowPopup(false)}
            fullScreen
          >
            <DialogContent className="booking_popup">
              {isMobile && (
                <div className="booking_popup_header">
                  <button
                    onClick={() => {
                      if (showinfo) {
                        setShowinfo(false);
                      } else {
                        setShowPopup(false);
                      }
                    }}
                  >
                    <KeyboardArrowLeftIcon className="icon" /> Back
                  </button>
                  <button onClick={() => setShowPopup(false)}>
                    <CloseIcon className="icon" />
                  </button>
                </div>
              )}

              <BookingComp
                isPopup={true}
                username={props.advisor.username}
                advisor={props.advisor}
                setCalendarActiveTab={handleClose}
              />
            </DialogContent>
          </Dialog>
          <h3>Appointment</h3>
          <button
            onClick={() => {
              setShowPopup(true);
              setShowinfo(false);
              props.handleHidePopup();
            }}
            className="schedule_content"
          >
            <img src={props.advisor.profile_picture} alt="profile" />
            <p>Book an appointment</p>
            <span></span>
          </button>
        </div>
      )}
    </>
  );
}

export default Booking;
