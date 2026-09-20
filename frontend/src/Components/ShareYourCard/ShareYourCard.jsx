import axios from "axios";
import  { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import QRCode from "react-qr-code";
import $ from "jquery";
import swal from "sweetalert";
import Swal from "sweetalert2";
import copy from "copy-to-clipboard";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DialogContent from "@mui/material/DialogContent";
import "./ShareYourCard.scss";

function ShareYourCard(props) {
  const [sendMail, setSendMail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [EmailCardData, setEmailCardData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  const handleEmailCardDataChange = (e) => {
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
    const payload = {
      receiver_name: EmailCardData.name,
      message: EmailCardData.message,
      receiver_email: EmailCardData.email,
    };
    axios
      .post(url, payload, config)
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

  const apple_pass = async () => {
    $("#preloader").css("display", "block");
    props.handleClose();
    try {
        const payload = {
            username: props.advisor_data.username
            };
      const response = await axios.post(
        "/api/apple_pass/generate_pass/",
        payload,
        config
      );

      const downloadUrl = response.data.download_url;
      const downloadResponse = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      const passBlob = new Blob([downloadResponse.data], {
        type: "application/vnd.apple.pkpass",
      });

      if ("wallet" in navigator) {
        const pass = await navigator.wallet.loadPass(
          window.URL.createObjectURL(passBlob)
        );
        await pass.add();
        console.log("Pass added to Apple Wallet");
      } else {
        const url = window.URL.createObjectURL(passBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "NSG.pkpass";

        document.body.appendChild(link);
        link.click();
        console.log("Pass downloaded");
      }
      $("#preloader").css("display", "none");
    } catch (error) {
      console.error("Error adding pass to Apple Wallet:", error);
      $("#preloader").css("display", "none");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error,
      });
      $("#preloader").css("display", "none");
    }
  };

  const addcard = async () => {
    $("#preloader").css("display", "block");
    props.handleClose();
    const payload = {
            username: props.advisor_data.username
            };
    const url = "api/google_pass/google_pass/";
    axios
      .post(url, payload, config)
      .then((res) => {
        const passUrl = res.data["Add to wallet"];
        if (passUrl) {
          window.location.href = passUrl;
        } else {
          swal({
            text: "Pass URL not found in the response",
            icon: "warning",
            buttons: true,
          });
        }
        $("#preloader").css("display", "none");
      })
      .catch((err) => {
        swal({
          text: err.response.data.message,
          icon: "warning",
          buttons: true,
        });
        $("#preloader").css("display", "none");
      });
  };

  return (
    <DialogContent className="edit_info_popup qr_info_popup">
      {sendMail ? (
        <>
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
              disabled={EmailCardData.name === "" || EmailCardData.email === ""}
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
        </>
      ) : (
        <>
          <div className="edit_info_popup_header">
            <button onClick={() => props.handleClose()}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Share Your Card</h4>
          </div>
          <div className="qr_info_popup_content">
            <div className="qr_wrapper">
              <QRCode
                size={197}
                value={"/" + props.advisor_data.username}
                viewBox={`0 0 256 256`}
              />
              <p>
                Scan the QR card to
                <br />
                receive the card
              </p>
            </div>
            <div className="qr_btns">
              <button
                onClick={() => {
                  swal({
                    text: "Success",
                    icon: "success",
                    timer: 2000,
                    buttons: false,
                  });
                  copy("/" + props.advisor_data.username);
                }}
              >
                <div>
                  Copy link
                  <span>Copy link and share with your friends</span>
                </div>
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/copy-01_png.webp"
                  alt="icon"
                  loading="lazy"
                />
              </button>
              <button onClick={() => setSendMail(true)}>
                <div>
                  Email
                  <span>Email your digital card to anyone</span>
                </div>
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/arrow-up_png.webp"
                  alt="icon"
                  loading="lazy"
                />
              </button>
              <button onClick={apple_pass}>
                <div>
                  Add to Apple Wallet
                  <span>Add card to your apple wallet</span>
                </div>
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/pngwing_com_png.webp"
                  alt="icon"
                  loading="lazy"
                />
              </button>
              <button onClick={addcard}>
                <div>
                  Add to Google Wallet
                  <span>Add card to your google wallet</span>
                </div>
                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/google-wallet-icon_png.webp"
                  alt="icon"
                  loading="lazy"
                />
              </button>
            </div>
          </div>
        </>
      )}
    </DialogContent>
  );
}

export default ShareYourCard;
