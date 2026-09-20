import axios from "axios";
import  { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import copy from "copy-to-clipboard";
import swal from "sweetalert";
import Layout from "../../Components/Layout/Layout";
import "./Refer.scss";
const gift =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gift_1_png.webp";
const gift_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gift_png.webp";
const gift_icon2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/vip-gift_png.webp";

function Refer() {
  const [EmailID, setEmailID] = useState("");
  const [InviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyClicked, setCopyClicked] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    generate_referral_code_api();
  }, []);

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
    <Layout>
      <div className="refer_content_dash">
        <div className="refer_img">
          <img src={gift} alt="gift" />
        </div>
        <h3>Make it a win-win</h3>
        <p>
          You will get credits in your account when your friend <br /> places an
          order using a promo code.
        </p>
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
            <h5>They get 22% off promo code</h5>
            <p>Use for digital business card</p>
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
              {!copyClicked ? "Copy" : "Copied"}
            </button>
          </div>
          <h4>Send them via email</h4>
          <input
            placeholder="Enter email id"
            value={EmailID}
            onChange={(e) => setEmailID(e.target.value)}
          />
          <div className="edit_info_btn">
            <button onClick={refer_friend}>
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
    </Layout>
  );
}

export default Refer;
