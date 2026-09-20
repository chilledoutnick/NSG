import { useState, useEffect } from "react";
import "./SocialLinks.scss";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import BlurPopup from "../../BlurPopup/BlurPopup";
import toast from "react-hot-toast";
import axios from "axios";

const icons = {
  discord:
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/dae869b8db3b4e90ac5b01dd32620bf3.webp",
  linkedin:
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/8d2e378549c9485dae284febb2bcf1a8.webp",
  x: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/5d3d64a5f5b140cf9b120ddcbdc10f2f.webp",
  instagram:
    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Screenshot_2025-03-22_at_1_14_47PM_2_png.webp",
  github:
    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  youtube:
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
  facebook:
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png",
  tiktok:
    "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png",
};

const SUPPORTED_PLATFORMS = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  linkedin: ["linkedin.com"],
  twitter: ["twitter.com", "x.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
};

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  linkUrl,
  isDeleting,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <BlurPopup
      className="delete-confirmation-overlay"
      onClose={handleBackdropClick}
    >
      <div className="delete-confirmation-dialog">
        <h3 className="dialog-title">Remove Link</h3>
        <p className="dialog-message">
          Are you sure you want to remove this social media link?
        </p>
        <p className="dialog-link">{linkUrl}</p>

        <div className="dialog-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                {/* Spinner icon */}
                <span className="icon-spin" style={{ marginRight: 6 }}></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </BlurPopup>
  );
};

const getIconForLink = (url) => {
  if (url.includes("linkedin.com")) return icons.linkedin;
  if (url.includes("discord.com")) return icons.discord;
  if (url.includes("x.com") || url.includes("twitter.com")) return icons.x;
  if (url.includes("instagram.com")) return icons.instagram;
  if (url.includes("github.com")) return icons.github;
  if (url.includes("youtube.com") || url.includes("youtu.be"))
    return icons.youtube;
  if (url.includes("facebook.com") || url.includes("fb.com"))
    return icons.facebook;
  if (url.includes("tiktok.com")) return icons.tiktok;
  return "default";
};

const getPlatformFromUrl = (url) => {
  const lowerUrl = url.toLowerCase();
  for (const [platform, domains] of Object.entries(SUPPORTED_PLATFORMS)) {
    if (domains.some((domain) => lowerUrl.includes(domain))) {
      return platform;
    }
  }
  return null;
};

const validateLink = (url) => {
  const pattern = /^(https?:\/\/)?([\w\-])+(\.[\w\-]+)+[/#?]?.*$/;
  return pattern.test(url);
};

function SocialLinks({ socialLinks, username, onUpdateSocialLinks }) {
  const [inputFocused, setInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [localSocialData, setLocalSocialData] = useState([]);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  useEffect(() => {
    if (socialLinks) {
      setLocalSocialData(socialLinks);
    }
  }, [socialLinks]);

  const updateSocialLinks = async (links) => {
    if (!username) {
      throw new Error("No username provided");
    }

    const payload = {
      username: username,
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
      tiktok: "",
      youtube: "",
    };

    links.forEach((link) => {
      if (link.platform && payload.hasOwnProperty(link.platform)) {
        payload[link.platform] = link.link;
      }
    });

    const url = "api/profile/update_profile/";
    const response = await axios.post(url, payload, config);
    return response;
  };

  const handleAdd = async () => {
    if (!validateLink(inputValue)) {
      setError("Invalid link! Please enter a valid URL.");
      return;
    }

    const platform = getPlatformFromUrl(inputValue);

    if (!platform) {
      setError(
        "In this Section,you can only add social links such as Instagram, Facebook, LinkedIn, Twitter (X), YouTube. For all other links, please use the 'Other Links' section."
      );
      return;
    }

    const existingPlatform = localSocialData.find(
      (item) => item.platform === platform
    );
    if (existingPlatform) {
      setError(
        `You've already added a ${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } link. Please remove it first to add a new one.`
      );
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const selectedIcon = getIconForLink(inputValue);
      const newLink = {
        icon: selectedIcon,
        link: inputValue,
        platform,
      };
      const updatedLinks = [...localSocialData, newLink];

      await updateSocialLinks(updatedLinks);

    
      if (onUpdateSocialLinks) {
        onUpdateSocialLinks(updatedLinks);
      }

      setInputValue("");
      toast.success("Social link added successfully!");
    } catch (error) {
      console.error("Error adding link:", error);
      toast.error("Failed to add social link. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Copied successfully!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) return;
    setIsDeleting(true);

    try {
      const updatedLinks = localSocialData.filter((_, i) => i !== deleteIndex);
      await updateSocialLinks(updatedLinks);

      if (onUpdateSocialLinks) onUpdateSocialLinks(updatedLinks);

      toast.success("Social link removed successfully!");
      setShowDeleteDialog(false);
      setDeleteIndex(null);
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to remove social link. Please try again.");
    } finally {
      setIsDeleting(false); 
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteIndex(null);
  };

  return (
    <div className="social_links_con">
      <h2>Social Media</h2>
      <p>
        Look sharp by incorporating links showcasing your social media presence.
      </p>

      <div className="social_link_input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          disabled={isSaving}
          style={{
            padding: "4px 8px",
            width: "100%",
            borderRadius: "8px",
            border: inputFocused ? "1px solid #66559B" : "1px solid #959595ff",
            outline: "none",
            boxShadow: inputFocused
              ? "0 1px 2px 0 rgba(18, 18, 23, 0.05)"
              : "none",
          }}
          placeholder="Paste your social media profile link here and click Add"
        />

        <button onClick={handleAdd} disabled={!inputValue.trim() || isSaving}>
          <ControlPointIcon fontSize="small" />
          {isSaving ? <span ></span> : "Add"}
        </button>
      </div>

      {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

      <div className="social_link_items">
        {localSocialData.map((item, id) => {
          return (
            <div key={id} className="social_link_item">
              <div className="social_link_content">
                {item.icon === "default" ? (
                  <InsertLinkOutlinedIcon
                    className="social_icon"
                    style={{ color: "#666" }}
                  />
                ) : (
                  <img
                    src={item.icon}
                    alt="Social_icon"
                    loading="lazy"
                    className="social_icon"
                  />
                )}
                <span>{item.link}</span>
              </div>
              <div className="social_link_item_btn">
                <button
                  onClick={() => window.open(item.link, "_blank")}
                  disabled={isSaving}
                >
                  <OpenInNewIcon fontSize="small" />
                </button>
                <button
                  onClick={() => handleCopy(item.link)}
                  disabled={isSaving}
                >
                  <ContentCopyIcon fontSize="small" />
                </button>
                <button
                  onClick={() => handleDeleteClick(id)}
                  disabled={isSaving}
                >
                  <RemoveCircleOutlineIcon
                    fontSize="small"
                    style={{ color: "red" }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        linkUrl={deleteIndex !== null ? localSocialData[deleteIndex]?.link : ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default SocialLinks;
