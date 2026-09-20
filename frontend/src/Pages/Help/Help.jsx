import axios from "axios";
import  { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import "./Help.scss";

const search =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/magnifying-glass--glass-search-magnifying_png.webp";
const send =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/arrow-cursor-2--mouse-select-cursor_png.webp";

function Help() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const user_info = JSON.parse(localStorage.getItem("user_info"));

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/contact_sales/create_sales_contact/";
    const payload = {
      email: user_info.email,
      message: message,
      first_name: user_info.name,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setErrorMsg("");
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setLoading(false);
        setMessage("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
        setLoading(false);
      });
  };

  return (
      <div className="help_con">
        <h2>
          Enter your message here, or if you’d prefer
          <br /> email us at <span>nikhil@nsgcrm.com</span>
        </h2>
        <div className="help_input_con">
          <h3>Welcome to NSG Support</h3>
          <div className="help_input">
            <input
              type="text"
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSubmit} disabled={message === ""}>
              {!loading ? (
                <img src={send} loading="lazy" alt="Send" />
              ) : (
                <ThreeDots
                  height="25"
                  width="100%"
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
        <p className="res_text">We’ll response to “{user_info.email}”</p>
      </div>
  );
}

export default Help;
