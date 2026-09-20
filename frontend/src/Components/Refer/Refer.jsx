import axios from "axios";
import  { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import copy from "copy-to-clipboard";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import CloseIcon from "@mui/icons-material/Close";
import "../../Pages/Refer/Refer.scss";
import "./Refer.scss";

const gift =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gift_1_png.webp";
const gift_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gift_png.webp";
const gift_icon2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/vip-gift_png.webp";

function Refer(props) {
  const [InviteLink, setInviteLink] = useState("");
  const [copyClicked, setCopyClicked] = useState("");
  const [loading, setLoading] = useState(false);
  const [EmailID, setEmailID] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const refer_friend = () => {
    setLoading(true);
    const url = "api/user/refer_friend/";
    const payload = {
      referral_email: EmailID,
      refer_code: "NSG22",
    };
    axios
      .post(url, payload, config)
      .then(() => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setEmailID("");
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        swal({
          text: err.response.data.message,
          icon: "warning",
        });
      });
  };

  useEffect(() => {
    generate_referral_code_api();
  }, []);

  const generate_referral_code_api = () => {
    const url = "api/refer/generate_referral_code_api/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setInviteLink("/signup/" + res.data.referral_code);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="refer_content">
      {props.isPopup ? (
        <button
          className="close_btn"
          onClick={() => {
            props.handlePopupRefCLose();
          }}
        >
          <CloseIcon />
        </button>
      ) : (
        <button
          className="back_btn"
          onClick={() => {
            props.handlePopupRefCLose();
          }}
        >
          <KeyboardBackspaceIcon />
        </button>
      )}

      <div className={"refer_img " + (props.isPopup ? "refer_img_popup" : "")}>
        <img src={gift} alt="gift" />
      </div>
      <h3>Make it a win-win</h3>
      {props.isPopup ? (
        <p>Support your friend by inviting them; both receive a promo.</p>
      ) : (
        <p>You both get a promo when friend make their account</p>
      )}

      <div className="refer_discount">
        <img src={gift_icon} alt="gift_icon" />
        <div>
          <h5>You get 18% off</h5>
          <p>Use it for tech and marketing services</p>
        </div>
      </div>
      <div className="refer_discount refer_discount_last">
        <img src={gift_icon2} alt="gift_icon" />
        <div>
          <h5>They get 22% off</h5>
          <p>For Digital Business card and software</p>
        </div>
      </div>
      <div className="refer_send_mail">
        <div
          className={"refer_link " + (copyClicked ? "refer_link_active" : "")}
        >
          <input value={InviteLink} readOnly />
          <button
            onClick={() => {
              copy(InviteLink);
              swal({
                text: "Link copied to clipboard",
                icon: "success",
                timer: 2000,
                buttons: false,
              });
              setCopyClicked(true);
            }}
          >
            {copyClicked ? "Copied" : "Copy"}
          </button>
        </div>
        <h4>Send them via email</h4>
        <input
          placeholder="Enter email id"
          value={EmailID}
          onChange={(e) => setEmailID(e.target.value)}
        />
        <div className="edit_info_btn">
          <button className="invite_btn" onClick={refer_friend}>
            {!loading ? (
              "Invite friends"
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
      </div>
    </div>
  );
}

export default Refer;
