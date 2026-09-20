import { useState, useEffect, useRef } from "react";
import "./ProfileVideo.scss";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import BlurPopup from "../../BlurPopup/BlurPopup";
import toast from "react-hot-toast";
import axios from "axios";

const deleteMUi =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/368d01e67faf4c96a52831ba7956a3d5.webp";

function ProfileVideo({
  hasData,
  videos,
  onUpdateVideos,
  onSaveVideo,
  onDeleteVideo,
  username,
  isModalOpen,
  onCloseModal,
  onOpenModal,
  onMoveUp,
  onMoveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
  showInPreview: showInPreviewProp,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [videoError, setVideoError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showInPreview, setShowInPreview] = useState(false);

  useEffect(() => {
    // console.log(videos);
    
    if (typeof showInPreviewProp === "boolean") {
      setShowInPreview(showInPreviewProp);
    }
  }, [showInPreviewProp]);
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };
  const updatePreviewSetting = async () => {
    try {
      const newValue = !showInPreview;
      const payload = {
        is_video: newValue,
        username: username,
      };

      await axios.post(
        "/api/profile/update_profile_settings/",
        payload,
        config
      );

      setShowInPreview(newValue);

      toast.success(
        `Profile Video ${newValue ? "visible" : "hidden"} in preview`
      );
    } catch (err) {
      console.error("Error updating preview setting:", err);
      toast.error("Failed to update preview setting.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  if (!hasData && !isModalOpen) return null;

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleMenuAction = (action) => {
    if (action === "Add a Video" || action === "Replace Video") {
      if (onOpenModal) onOpenModal();
    } else if (action === "Delete Video") {
      handleDeleteVideo();
    } else if (action === "Toggle Preview") {
      updatePreviewSetting();
    }
  };

  const handleMoveUp = () => {
    if (!isMoveUpDisabled && onMoveUp) onMoveUp();
    setShowDropdown(false);
  };

  const handleMoveDown = () => {
    if (!isMoveDownDisabled && onMoveDown) onMoveDown();
    setShowDropdown(false);
  };

  const MAX_SIZE_MB = 50;

  const validateMediaLink = (link) => {
    if (!link) return false;

    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{11}(\S*)?$/;

    const vimeoRegex = /^https?:\/\/(www\.)?vimeo\.com\/\d+$/;
    const directVideoRegex = /\.(mp4|mov|webm|mkv)$/i;

    return (
      youtubeRegex.test(link) ||
      vimeoRegex.test(link) ||
      directVideoRegex.test(link)
    );
  };

  const handleFileUpload = (file) => {
    setVideoError("");
    setLinkError("");

    if (file && file.type.startsWith("video/")) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setVideoError(`File size exceeds ${MAX_SIZE_MB}MB limit`);
        toast.error(
          "This video is larger than 50MB. Please choose a lighter clip under 50MB.",
          { autoClose: 4000 }
        );
        return;
      }

      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo({
        file: file,
        url: videoUrl,
        name: file.name,
        size: `${Math.round(file.size / 1024)}KB`,
      });
      setVideoLink("");
     
    
    } else {
      setVideoError("Please upload a valid video file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0])
      handleFileUpload(e.target.files[0]);
  };

  const handleVideoLinkChange = (e) => {
    setVideoLink(e.target.value);
    setUploadedVideo(null);
    setVideoError("");
    setLinkError("");
  };

  const handleRemoveVideo = () => {
    if (uploadedVideo) URL.revokeObjectURL(uploadedVideo.url);
    setUploadedVideo(null);
  };

  const handleModalClose = () => {
    if (onCloseModal) onCloseModal();
    setVideoLink("");
    setVideoError("");
    setLinkError("");
    setUploadedVideo(null);
    setDragActive(false);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|shorts\/|embed\/)?([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`;

    }

    console.warn("⚠️ Invalid YouTube URL:", url);
    return null;
  };

  const getVimeoEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("player.vimeo.com/video/")) {
      return url;
    }

    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }

    console.warn("⚠️ Invalid Vimeo URL:", url);
    return null;
  };

  const getEmbedUrl = (link) => {
    if (!link) return null;

    if (link.includes("youtu")) {
      return getYouTubeEmbedUrl(link);
    } else if (link.includes("vimeo")) {
      return getVimeoEmbedUrl(link);
    } else if (/\.(mp4|mov|webm|mkv)$/i.test(link)) {
      return link;
    }

    console.warn("⚠️ Unsupported media URL:", link);
    return null;
  };

  const handleSaveVideo = async () => {
    setVideoError("");
    setLinkError("");

    if (!uploadedVideo && !videoLink.trim()) {
      setVideoError("Please upload a video or enter a video link");
      return;
    }

    if (videoLink.trim() && !validateMediaLink(videoLink.trim())) {
      setLinkError("Please enter a valid YouTube, Vimeo, or direct video link");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("title", uploadedVideo ? uploadedVideo.name : "Video");
      formData.append("video_link", videoLink.trim());
      if (uploadedVideo?.file) {
        formData.append("video", uploadedVideo.file);
      }

      if (onSaveVideo) {
        await onSaveVideo(formData);
      }

      handleModalClose();

      setTimeout(() => {
        toast.success(
          hasData ? "Video replaced successfully!" : "Video added successfully!"
        );
      }, 300);
    } catch (error) {
      console.error("Error saving video:", error);
      handleModalClose();
        setTimeout(() => {
          const errorMessage = error.response?.data?.message || "Failed to save video. Please try again.";
          toast.error(errorMessage);
        }, 300);
        throw error; // Re-throw the error to propagate it
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setShowDropdown(false);

    try {
      if (onDeleteVideo) {
        await onDeleteVideo(videos[0]?.id);
      } else {
        onUpdateVideos([]);
      }

    } catch (error) {
      console.error("Error deleting video:", error);
      setTimeout(
        () => toast.error("Failed to delete video. Please try again."),
        300
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isSaveDisabled = (!uploadedVideo && !videoLink.trim()) || isLoading;

  return (
    <div className="profile_video_con">
      {isModalOpen && (
        <BlurPopup className="video-modal-overlay" onClose={handleModalClose}>
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{hasData ? "Replace Video" : "Add a Video"}</h2>
            <p>Add a video from your device OR insert a link to add a video.</p>

            {/* Upload Section */}
            <div
              className={`video-upload-area ${dragActive ? "drag-active" : ""
                } ${uploadedVideo ? "has-video" : ""} ${isLoading ? "upload-loading" : ""
                } ${videoError ? "error-border" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => !videoLink && !isLoading && handleDrop(e)}
              onClick={() =>
                !uploadedVideo &&
                !isLoading &&
                !videoLink &&
                fileInputRef.current?.click()
              }
              style={{
                pointerEvents: videoLink ? "none" : "auto",
                opacity: videoLink ? 0.6 : 1,
              }}
            >
              {uploadedVideo ? (
                <div className="video-preview">
                  <video src={uploadedVideo.url} className="uploaded-video" />
                  <div className="video-overlay">
                    <PlayArrowIcon className="play-icon" />
                  </div>
                  <button
                    className="remove-video-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveVideo();
                    }}
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </button>
                  <div className="video-info">
                    <span className="video-size">{uploadedVideo.size}</span>
                  </div>
                  {isLoading && <div className="loader-circle" />}
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">
                    <div className="upload-circle">
                      <AddIcon />
                    </div>
                  </div>
                  <p>Upload a video (Max File Size is 50MB)</p>
                  {isLoading && <div className="loader-circle" />}
                </div>
              )}
            </div>
            {videoError && <span className="error-text">{videoError}</span>}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="video/*"
              style={{ display: "none" }}
              disabled={!!videoLink || isLoading}
            />

            <div className="or-separator">
              <span>OR</span>
            </div>

            {/* Link Section */}
            <div className="video-link-section">
              <label>Enter a media link</label>
              <input
                type="text"
                value={videoLink}
                onChange={handleVideoLinkChange}
                placeholder="e.g. YouTube link, Vimeo link, etc."
                className={linkError ? "error" : ""}
                disabled={!!uploadedVideo || isLoading}
              />
              {linkError && <span className="error-text">{linkError}</span>}
            </div>

            <div className="video-modal-buttons">
              <button
                className="cancel-btn"
                onClick={handleModalClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSaveVideo}
                disabled={isSaveDisabled}
                style={{
                  backgroundColor: isSaveDisabled ? "#ccc" : undefined,
                  cursor: isSaveDisabled ? "not-allowed" : "pointer",
                }}
              >
                {isLoading
                  ? hasData
                    ? "Replacing..."
                    : "Saving..."
                  : hasData
                    ? "Replace"
                    : "Save"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}

      {hasData && (
        <>
          <div className="video-header-container">
            <h2>Featured Video</h2>
            {!showInPreview && (
              <div className="hidden-tag">
                <VisibilityOffIcon style={{ fontSize: 20 }} />
                <span>Hidden in Preview</span>
              </div>
            )}
          </div>
          <h5>
            Add a video to strengthen your impression onto your customers...
          </h5>

          <button
            className="profile_edit_menu_btn"
            onClick={toggleDropdown}
            style={{ background: showDropdown ? "#afafaf" : "#e7e7e7" }}
            disabled={isDeleting}
          >
            <MoreHorizOutlinedIcon />
          </button>

          {isDeleting ? (
            <div
              style={{
                width: "100%",
                height: "324px",
                borderRadius: "10px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                color: "#666",
              }}
            >
              Deleting video...
            </div>
          ) : videos[0]?.type === "file" && videos[0]?.url ? (
            <video
              width="100%"
              height="324"
              src={videos[0].url}
              controls
              crossOrigin="anonymous"
              style={{ borderRadius: 10, display: "block", width: "100%" }}
            >
              Your browser does not support the video tag.
            </video>
          ) : videos[0]?.url ? (
            <iframe
              style={{ borderRadius: 10, display: "block" }}
              width="100%"
              height="324"
              src={getEmbedUrl(videos[0].url)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="tm3-video-iframe"
            />

          ) : null}

          {showDropdown && !isDeleting && (
            <div className="service-dropdown" ref={dropdownRef}>
              {/* your dropdown buttons remain same */}

              <button
                className={`dropdown-item ${isMoveUpDisabled ? "disabled" : ""
                  }`}
                onClick={!isMoveUpDisabled ? handleMoveUp : undefined}
              >
                <div className="dropdown-icon">
                  <ArrowUpwardOutlinedIcon style={{ fontSize: 20 }} />
                </div>
                Move up
              </button>

              <button
                className={`dropdown-item ${isMoveDownDisabled ? "disabled" : ""
                  }`}
                onClick={!isMoveDownDisabled ? handleMoveDown : undefined}
              >
                <div className="dropdown-icon">
                  <ArrowDownwardOutlinedIcon style={{ fontSize: 20 }} />
                </div>
                Move down
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuAction("Replace Video")}
              >
                <div className="dropdown-icon">
                  <FileUploadOutlinedIcon style={{ fontSize: 20 }} />
                </div>
                Replace Video
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuAction("Delete Video")}
              >
                <div className="dropdown-icon">
                  <img
                    src={deleteMUi}
                    style={{
                      width: "20px",
                      height: "20px",
                      filter:
                        "brightness(0) saturate(100%) invert(25%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(98%) contrast(95%)",
                    }}
                    alt="delete icon"
                  />
                </div>
                Delete Video
              </button>

              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuAction("Toggle Preview");
                }}
              >
                <div className="dropdown-icon">
                  {showInPreview ? (
                    <VisibilityOffIcon style={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon style={{ fontSize: 20 }} />
                  )}
                </div>
                {showInPreview ? "Hide in Preview" : "Show in Preview"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfileVideo;
