import axios from "axios";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import "./UserInfo.scss";

function URLLinkUp(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState(props.User.custom_username);
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const update_custom_username = () => {
    setLoading(true);
    const url = "api/super_admin/update_custom_username/";
    console.log("USER OBJECT =>", props.User);
    const payload = {
      username: username,
      user_id: props.User.user_id,
    };
    axios
      .post(url, payload, config)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Username updated successfully",
          showConfirmButton: false,
          timer: 3000,
        });
        props.handleClose();
        setError("");
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  return (
    <div className="url_setup_con">
      <h2>Set Custom URL</h2>
      <h3>Username: {props.User.username}</h3>
      <input
        type="text"
        value={username}
        placeholder="Custom URL (e.g., ra23)."
        onChange={(e) => setUsername(e.target.value)}
      />
      <p className="error">{error}</p>
      <button
        onClick={update_custom_username}
        className="btn-primary mt-3"
        disabled={username === ""}
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
  );
}

export default URLLinkUp;
