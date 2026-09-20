import axios from "axios";
import { useState, useEffect } from "react";
import swal from "sweetalert";
import copy from "copy-to-clipboard";
import Avatar from "@mui/material/Avatar";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import "./BookingCard.scss";

function BookingCard() {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const user_info = JSON.parse(localStorage.getItem("user_info"));
  const [Durations, setDurations] = useState([]);

  useEffect(() => {
    get_slot_times();
  }, []);

  const handleShare = async (minutes) => {
    try {
      await navigator.share({
        url: "/" + user_info.username + "/booking/" + minutes,
      });
    } catch (error) {
      console.error("Error sharing link:", error);
    }
  };

  const get_slot_times = () => {
    const url = "api/working_hour/get_slot_times/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setDurations(res.data[0].slot_time);
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <div className="share_link_wrapper">
      <div className="share_link_details">
        <Avatar
          src="Avatar"
          alt={user_info.name}
          className="profile-review-img"
        />
        <div>
          <h4>{user_info.name}</h4>
          <button
            onClick={() =>
              window.open(
                "/" + user_info.username + "/booking"
              )
            }
          >
            /{user_info.username}/booking
          </button>
        </div>
      </div>
      <div className="share_link_card_wrapper">
        {Durations.length > 0 &&
          Durations.map((item, index) => {
            return (
              <div className="share_link_card" key={index + "card"}>
                <h5>{item} Minute Meeting</h5>
                <button
                  className="view_btn"
                  onClick={() =>
                    window.open(
                      "/" +
                        user_info.username +
                        "/booking/" +
                        item
                    )
                  }
                >
                  View booking page
                </button>
                <div className="share_btn_con">
                  <button
                    onClick={() => {
                      copy(
                        "/" +
                          user_info.username +
                          "/booking/" +
                          item
                      );
                      swal({
                        text: "Link copied",
                        icon: "success",
                        timer: 2000,
                        buttons: false,
                      });
                    }}
                    className="copy_btn"
                  >
                    <ContentCopyIcon fontSize="small" /> Copy link
                  </button>
                  <button
                    onClick={() => handleShare(item)}
                    className="share_btn"
                  >
                    Share
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default BookingCard;
