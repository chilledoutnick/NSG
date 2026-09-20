import axios from "axios";
import  { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { BottomSheet } from "react-spring-bottom-sheet";
import { ThreeDots } from "react-loader-spinner";
import copy from "copy-to-clipboard";
import "react-spring-bottom-sheet/dist/style.css";
import swal from "sweetalert";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useStore } from "../../store/advisorStore";
import "./SwipePopup.scss";

const grapics =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Graphics_png.webp";

const SwipePopup = () => {
  const { advisor_data } = useStore();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [Logo, setLogo] = useState("");
  const [sendMail, setSendMail] = useState(false);
  const [EmailCardData, setEmailCardData] = useState({
    name: "",
    email: "",
    message: "",
  });
  useEffect(() => {
    get_logo();
  }, []);

  const handleEmailCardDataChange = (e) => {
    e.preventDefault();
    let name = e.target.name;
    let value = e.target.value;

    EmailCardData[name] = value;
    setEmailCardData({
      ...EmailCardData,
    });
  };

  const handleReceiveCard = () => {
    setLoading(true);
    const url = "api/digital_card/email_business_card/";
    const payaload = {
      receiver_name: EmailCardData.name,
      message: EmailCardData.message,
      receiver_email: EmailCardData.email,
    };
    axios
      .post(url, payaload, config)
      .then(() => {
        setLoading(false);
        setSendMail(false);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setEmailCardData({
          ...EmailCardData,
          name: "",
          email: "",
          message: "",
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.message,
          icon: "warning",
          buttons: true,
        });
        setLoading(false);
      });
  };

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };
  
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const newY = e.touches[0].clientY;
      const diffY = newY - startY;
      setCurrentY(diffY);
    }
  };

  const handleTouchEnd = () => {
    const threshold = 50; 
    if (currentY < -threshold) {
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      setOpen(true);
    } else if (currentY > threshold) {
      setOpen(false); 
    }
    setCurrentY(0);
    setIsDragging(false);
  };


  const get_logo = () => {
    const url = "api/logo/get_logo/";
    axios
      .post(url, {}, config)
      .then((res) => setLogo(res.data.logo))
      .catch((err) => console.log("err", err));
  };

  return (
    <>
      {open && <div className="popup-overlay" />}
      <div className="swipe_popup ">
        {!open && (
          <button
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              setOpen(true);
              if (navigator.vibrate) {
                navigator.vibrate(100);
              }
            }}
            className="popup-triger-btn"
          >
            <KeyboardDoubleArrowUpIcon className="up_icon" /> Swipe up to share
            card
          </button>
        )}
        <BottomSheet
          open={open}
          onDismiss={() => {
            setOpen(false);
          }}
          defaultSnap={({ snapPoints }) => Math.max(...snapPoints)}
          blocking={false}
          expandOnContentDrag={true}
          className="share-popup-content-wrapper"
        >
          <div className="share-popup-content">
            <button onClick={() => setOpen(false)} className="down_btn">
              <KeyboardDoubleArrowDownIcon className="down_icon" /> Swipe down
              to close
            </button>
            <div className="user_card">
              <div>
                <img
                  className="profile"
                  src={advisor_data.profile_picture}
                  alt="dummyImage"
                  loading="lazy"
                />
                {Logo && (
                  <img
                    className="logo"
                    src={Logo}
                    alt="dummyImage"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="user_card_btm">
                <img
                  className="bg"
                  src={grapics}
                  alt="dummyImage"
                  loading="lazy"
                />
              
                <h3>{advisor_data.name}</h3>
                <h5>{advisor_data.company}</h5>
                <div className="qr_con">
                  <QRCode
                    size={148}
                    value={"/" + advisor_data.username}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              </div>
            </div>
            <p className="popup_text">
              Share your profile instantly via QR code, email, or by sending a
              direct link.
            </p>
            <div className="popup_btns">
              <button onClick={() => setSendMail(true)} className="btn-primary">
                <MailOutlineIcon fontSize="small" /> Email your card
              </button>
              <button
                onClick={() => {
                  swal({
                    text: "Success",
                    icon: "success",
                    timer: 2000,
                    buttons: false,
                  });
                  copy("/" + advisor_data.username);
                }}
                className="btn-outline"
              >
                <ContentCopyIcon fontSize="small" /> Copy link
              </button>
            </div>
          </div>
        </BottomSheet>
        <Dialog
          open={sendMail}
          onClose={() => {
            setSendMail(false);
          }}
          fullScreen={sendMail}
        >
          <DialogContent className="edit_info_popup qr_info_popup">
            <div className="edit_info_popup_header">
              <button onClick={() => setSendMail(false)}>
                <KeyboardBackspaceIcon />
              </button>
              <h4>Email Your Card</h4>
            </div>
            <div className="edit_info_form">
              <label htmlFor="Name">Name*</label>
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={EmailCardData.name}
                onChange={handleEmailCardDataChange}
              />
              <label htmlFor="Email">Email*</label>
              <input
                type="text"
                placeholder="Email"
                name="email"
                value={EmailCardData.email}
                onChange={handleEmailCardDataChange}
              />
              <label htmlFor="Message">Message</label>
              <input
                type="text"
                name="message"
                placeholder="Message"
                value={EmailCardData.message}
                onChange={handleEmailCardDataChange}
              />
            </div>
            <div className="edit_info_btn">
              <button
                disabled={
                  EmailCardData.name === "" || EmailCardData.email === ""
                }
                onClick={handleReceiveCard}
              >
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
      </div>
    </>
  );
};

export default SwipePopup;
