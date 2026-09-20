import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

function ProfileVideo(props) {
  const [loading, setLoading] = useState(false);
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [ShowPopup, setShowPopup] = useState(false);
  const [video, setVideo] = useState({
    title: "",
    video_link: "",
  });

  const handleInputChange = (e) => {
    const url = e.target.value;
    const videoID = extractVideoID(url);
    if (videoID) {
      setVideo({
        ...video,
        video_link: `https://www.youtube.com/embed/${videoID}`,
      });
    } else {
      setVideo({
        ...video,
        video_link: "",
      });
    }
  };

  useEffect(() => {
    getVideo();
  }, []);

  const handleVideo = () => {
    setLoading(true);
    const url = "api/user/add_video/";
    axios
      .post(url, video, config)
      .then((res) => {
        setShowPopup(false);
        getVideo();
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Video Uploaded",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .catch((err) => setLoading(false));
  };

  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${props_token}`,
    },
  };

  const extractVideoID = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"'\&?\/\s]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  };

  const getVideo = () => {
    const url = "api/user/get_video_link/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let videoID = ""
        if (res.data.links[0]?.video_link) {
          videoID = extractVideoID(res.data.links[0]?.video_link);
        }
        setVideo({
          ...video,
          video_link: videoID ? `https://www.youtube.com/embed/${videoID}` : "",
          title: res.data.links[0]?.Video_title,
        });
      })
      .catch((err) => console.log("err", err));
  };  

  return (
    <div className="tm3-video">
      <h3>
        {video.title ? video.title : "Featured Video"}
        <button onClick={() => setShowPopup(true)} className="tm_edit_btn">
          {video.video_link !== "" ? "Edit" : "Add"}
        </button>
      </h3>
      {video.video_link !== "" && (
        <iframe
          style={{ borderRadius: 10 }}
          width="100%"
          height="244"
          src={video.video_link}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="tm3-video-iframe"
        ></iframe>
      )}

      <Dialog
        open={ShowPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopup(false)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Featured Video</h4>
          </div>
          <div className="edit_info_form">
            <label htmlFor="About">Title</label>
            <input
              type="text"
              placeholder="Add title"
              value={video.title}
              onChange={(e) => {
                setVideo({
                  ...video,
                  title: e.target.value,
                });
              }}
            />
            <label htmlFor="About">Insert Youtube URL here</label>
            <input
              type="text"
              placeholder="Insert Youtube URL here"
              value={video.video_link}
              onChange={handleInputChange}
              className="mb-0"
            />
            <p className="card_gallery_note card_gallery_note2">
              Note: Only YouTube videos are allowed for upload..
            </p>
          </div>
          <div className="edit_info_btn">
            <button
              onClick={() => {
                handleVideo();
              }}
            >
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfileVideo;
