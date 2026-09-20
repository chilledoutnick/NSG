import axios from "axios";
import Swal from "sweetalert2";
import { useState, useRef, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "../../Pages/ProfileEdit/UserProfileEdit/UserProfileEditRes.scss";
import "../../Pages/ProfileEdit/UserProfileEdit/UserProfileEdit.scss";

const facebook_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Fscebook_1_png.webp";
const linkedin_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Youtube_png.webp";
const youtube_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Youtube_1_png.webp";
const twitter_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Twitter_png.webp";
const tiktok_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Insta_png.webp";
const instagram_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Fscebook_png.webp";
const substack_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/substack-icon.webp";

function SocialLinks(props) {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [loading, setLoading] = useState(false);
  const [ShowPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [active_social, setActive_social] = useState("instagram");
  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${props_token}`,
    },
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    Data[name] = value;
    setData({
      ...Data,
    });
  };

  const [Data, setData] = useState({
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    substack: "",
  });

  useEffect(() => {
    get_social_media();
  }, []);

  const get_social_media = () => {
    const url = "api/user_profile/get_user_social_media/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setData({
          instagram: res.data.instagram,
          facebook: res.data.facebook,
          linkedin: res.data.linkedin,
          twitter: res.data.twitter,
          tiktok: res.data.tiktok,
          youtube: res.data.youtube,
          substack: res.data.substack||"",
        });
      })
      .catch((err) => console.log("err get_advisor_social_media", err));
  };

  const formData = new FormData();
  formData.append("instagram", Data.instagram);
  formData.append("facebook", Data.facebook);
  formData.append("linkedin", Data.linkedin);
  formData.append("twitter", Data.twitter);
  formData.append("tiktok", Data.tiktok);
  formData.append("youtube", Data.youtube);
  formData.append("substack", Data.substack);

  const update_web = () => {
    setLoading(true);
    const url = "api/user_profile/update_link/";
    axios
      .post(url, formData, config)
      .then(() => {
        get_social_media();
        setShowPopup(false);
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Social link added",
          showConfirmButton: false,
          timer: 3000,
        });
        setError("");
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  return (
    <div className="tm3-social">
      <h3>
        Social Handles
        <button onClick={() => setShowPopup(3)} className="tm_edit_btn">
          {Data.instagram !== "" ||
          Data.facebook !== "" ||
          Data.linkedin !== "" ||
          Data.twitter !== "" ||
          Data.tiktok !== "" ||
          Data.youtube !== "" ||
          Data.Substack !== ""
            ? "Edit"
            : "Add"}
        </button>
      </h3>
      <div className="social-con">
        {Data.instagram !== "" && (
          <button onClick={() => window.open(Data.instagram)}>
            <img src={instagram_icon} alt="social icon" loading="lazy" />
          </button>
        )}
        {Data.facebook !== "" && (
          <button onClick={() => window.open(Data.facebook)}>
            <img src={facebook_icon} alt="social icon" loading="lazy" />
          </button>
        )}
        {Data.linkedin !== "" && (
          <button onClick={() => window.open(Data.linkedin)}>
            <img src={linkedin_icon} alt="social icon" loading="lazy" />
          </button>
        )}
        {Data.twitter !== "" && (
          <button onClick={() => window.open(Data.twitter)}>
            <img src={twitter_icon} alt="social icon" loading="lazy" />
          </button>
        )}
        {Data.tiktok !== "" && (
          <button onClick={() => window.open(Data.tiktok)}>
            <img src={tiktok_icon} alt="social icon" loading="lazy" />
          </button>
        )}
        {Data.youtube !== "" && (
          <button onClick={() => window.open(Data.youtube)}>
            <img src={youtube_icon} alt="social icon" loading="lazy" />
          </button>
        )}
        {Data.substack !== "" && (
          <button onClick={() => window.open(Data.substack)}>
            <img src={substack_icon} alt="social icon" loading="lazy" />
          </button>
        )}
      </div>
      <Dialog
        open={ShowPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopup(0)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Social Handles</h4>
          </div>
          <div className="edit_info_form">
            <label htmlFor="About">Social Media Handle</label>
            <select
              value={active_social}
              onChange={(e) => setActive_social(e.target.value)}
            >
              <option value={"instagram"}>Instagram</option>
              <option value={"facebook"}>Facebook</option>
              <option value={"linkedin"}>LinkedIn</option>
              <option value={"twitter"}>X (Twitter)</option>
              <option value={"tiktok"}>Tiktok</option>
              <option value={"youtube"}>Youtube</option>
              <option value={"substack"}>Substack</option>
            </select>
            <label htmlFor="url">Insert URL here</label>
            <input
              type="text"
              placeholder="Enter the HTTPS link (e.g., https://example.com)."
              name={active_social}
              onChange={handleChange}
              value={Data[active_social] || ""}
              className="mb-0"
            />
            {error && <p className="error">{error}</p>}
          </div>
          <div className="edit_info_btn">
            <button onClick={update_web}>
              {!loading ? (
                "Save"
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

          <div className="social_icon">
            {Data.instagram !== "" && (
              <button onClick={() => window.open(Data.instagram)}>
                <img src={instagram_icon} alt="social icon" loading="lazy" />
              </button>
            )}
            {Data.facebook !== "" && (
              <button onClick={() => window.open(Data.facebook)}>
                <img src={facebook_icon} alt="social icon" loading="lazy" />
              </button>
            )}
            {Data.linkedin !== "" && (
              <button onClick={() => window.open(Data.linkedin)}>
                <img src={linkedin_icon} alt="social icon" loading="lazy" />
              </button>
            )}
            {Data.twitter !== "" && (
              <button onClick={() => window.open(Data.twitter)}>
                <img src={twitter_icon} alt="social icon" loading="lazy" />
              </button>
            )}
            {Data.tiktok !== "" && (
              <button onClick={() => window.open(Data.tiktok)}>
                <img src={tiktok_icon} alt="social icon" loading="lazy" />
              </button>
            )}
            {Data.youtube !== "" && (
              <button onClick={() => window.open(Data.youtube)}>
                <img src={youtube_icon} alt="social icon" loading="lazy" />
              </button>
            )}
            {Data.substack !== "" && (
              <button onClick={() => window.open(Data.substack)}>
                <img src={substack_icon} alt="social icon" loading="lazy" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SocialLinks;
