import { useState, useRef, useEffect } from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import tooltipClasses from "@mui/material/Tooltip/tooltipClasses";
import BlurPopup from "../../../Components/BlurPopup/BlurPopup";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import "./ProfileCard.scss";
import axios from "axios";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { LoaderIcon, toast } from "react-hot-toast";
import LoadingButton from "../../LoadingButton/LoadingButton";
import { QRCodeCanvas } from "qrcode.react";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const cards = [];

const ThreeDotDropdown = ({ onReplace, onDelete, hasImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleReplace = () => {
    onReplace();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  if (!hasImage) return null;

  return (
    <div
      className="three-dot-dropdown-container"
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 9999,
      }}
    >
      <button
        className="three-dot-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(0, 0, 0, 0.6)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: "0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
          ></div>
        </div>
      </button>

      {isOpen && (
        <div
          className="three-dot-dropdown"
          style={{
            padding: "20px",
            gap: 8,
            position: "absolute",
            top: "calc(100% + 7px)",
            right: "0px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "rgba(0, 0, 0, 0.12) 0px 4px 16px",
            border: "1px solid rgb(240, 240, 240)",
            minWidth: "180px",
            overflow: "hidden",
            zIndex: 10000,
            animation: "0.15s ease-out 0s 1 normal none running dropdownFadeIn",
          }}
        >
          <button
            onClick={handleReplace}
            type="button"
            style={{
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: "white",
              fontFamily: "var(--font-popins) !important",
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "auto",
              letterSpacing: "0.05em",
              color: "#333333",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#EEEEEE")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
          >
            <FileUploadOutlinedIcon sx={{ fontSize: 20, color: "#666666" }} />
            Replace
          </button>
          <button
            onClick={handleDelete}
            type="button"
            style={{
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: "white",
              fontFamily: "var(--font-popins) !important",
              fontSize: "16px",
              fontWeight: "400",
              lineHeight: "auto",
              letterSpacing: "0.05em",
              color: "#333333",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#EEEEEE")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
          >
            <DeleteForeverOutlinedIcon
              sx={{ fontSize: 20, color: "#666666" }}
            />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ThreeDotCardDropdown = ({
  onEdit,
  onDuplicate,
  onDelete,
  isMainProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{ position: "absolute", top: "12px", right: "12px", zIndex: 9999 }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", gap: "3px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "4px",
                height: "4px",
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            />
          ))}
        </div>
      </button>

      {isOpen && (
        <div
          className="service-dropdown"
          style={{
            position: "absolute",
            bottom: "calc(100% + 7px)", // top ki jagah bottom
            right: "0",
            left: "auto",
            width: "200px",
            height: "auto",
            zIndex: 99999,
          }}
        >
          <button
            className="dropdown-item"
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            type="button"
          >
            <div className="dropdown-icon">
              <EditOutlinedIcon style={{ fontSize: 20 }} />
            </div>
            Edit Card
          </button>
          <button
            className="dropdown-item"
            onClick={() => {
              onDuplicate();
              setIsOpen(false);
            }}
            type="button"
          >
            <div className="dropdown-icon">
              <ContentCopyIcon style={{ fontSize: 20 }} />
            </div>
            Duplicate Card
          </button>

          <button
            className="dropdown-item"
            onClick={() => {
              if (isMainProfile) return;
              onDelete();
              setIsOpen(false);
            }}
            type="button"
            style={{
              cursor: isMainProfile ? "not-allowed" : "pointer",
            }}
          >
            <div className="dropdown-icon">
              <DeleteForeverOutlinedIcon
                style={{
                  fontSize: 20,
                  color: isMainProfile ? "#9ca3af" : "#ef4444",
                }}
              />
            </div>

            <span
              style={{
                color: isMainProfile ? "#9ca3af" : "#ef4444",
              }}
            >
              Delete Card
            </span>
          </button>
          <button
            className="dropdown-item"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <div className="dropdown-icon">
              <CloseIcon style={{ fontSize: 20 }} />
            </div>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

function ProfileCard(props) {
  const [cardsData, setCardsData] = useState(cards);
  const [showAdd, setShowAdd] = useState();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayPic, setDisplayPic] = useState(null);
  const [displaypicFile, setDisplaypicFile] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoDelete, setLogoDelete] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Pro");
  const addButtonRef = useRef(null);
  const shareButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [deleteCardIndex, setDeleteCardIndex] = useState(null);
  const [deleteCardLoading, setDeleteCardLoading] = useState(false);

  const activeProfile = cardsData[activeIndex];
  let profile_url = "";
  let url = "";

  if (
    axios.defaults.baseURL?.includes("127.0.0.1") ||
    axios.defaults.baseURL?.includes("localhost")
  ) {
    url = "http://localhost:4000/";
  } else {
    url = axios.defaults.baseURL.endsWith("/")
      ? axios.defaults.baseURL
      : axios.defaults.baseURL + "/";
  }

  if (activeProfile?.username) {
    profile_url = `${url}${activeProfile.username}`;
  }

  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      Authorization: `Bearer ${props_token}`,
    },
  };

  const handleShareClick = () => {
    if (navigator.share && profile_url) {
      navigator
        .share({
          title: "Check out this link!",
          text: "Check out my digital business card",
          url: profile_url,
        })
        .catch((error) => {
          console.error("Error sharing via Web Share API:", error);
          alert("Sharing failed, copying link instead.");
          navigator.clipboard.writeText(profile_url);
          alert("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(profile_url);
      alert("Link copied to clipboard!");
    }
  };

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async () => {
    if (!emailFormData.name.trim() || !emailFormData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const url = "api/digital_card/email_business_card/";
    const payload = {
      receiver_name: emailFormData.name,
      message: emailFormData.message,
      receiver_email: emailFormData.email,
    };

    try {
      await axios.post(url, payload, config);
      setLoading(false);
      setShowEmailModal(false);
      toast.success("Email sent successfully!");
      setEmailFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Failed to send email");
    }
  };

  const handleAddToAppleWallet = async () => {
    setLoadingApple(true);
    try {
      const response = await axios.post(
        "/api/apple_pass/generate_pass/",
        { username: activeProfile.username },
        config,
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
          window.URL.createObjectURL(passBlob),
        );
        await pass.add();
        setIsShareModalOpen(false);
        toast.success("Pass added to Apple Wallet!");
      } else {
        const url = window.URL.createObjectURL(passBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "NSG.pkpass";
        document.body.appendChild(link);
        link.click();
        toast.success("Pass downloaded successfully!");
      }

      setIsShareModalOpen(false);
    } catch (error) {
      setIsShareModalOpen(false);
    } finally {
      setLoadingApple(false);
    }
  };

  const handleAddToGoogleWallet = async () => {
    setLoadingGoogle(true);
    try {
      const res = await axios.post(
        "/api/google_pass/google_pass/",
        { username: activeProfile.username },
        config,
      );

      const passUrl = res.data["Add to wallet"];
      if (passUrl) {
        window.location.href = passUrl;
        setIsShareModalOpen(false);
        toast.success("Redirecting to Google Wallet...");
      } else {
        toast.warning("Pass URL not found in the response.");
      }
    } catch (err) {
      toast.error("Failed to add Google Wallet pass.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  useEffect(() => {
    if (cardsData[activeIndex] && props.onSelectProfile) {
      props.onSelectProfile(cardsData[activeIndex]);
    }
  }, [activeIndex, cardsData]);

  props.onSelectProfile(cardsData[activeIndex]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    company: "",
    cardName: "",
    username: "",
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    designation: false,
    company: false,
    cardName: false,
    username: false,
  });
  const displayPicRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    getProfiles();
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 786);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 786);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showUpgradeModal || isShareModalOpen || showAdd) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showUpgradeModal, isShareModalOpen, showAdd]);

  const totalItems = isMobile ? cardsData.length + 1 : cardsData.length;

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      scrollRight();
    }
    if (isRightSwipe) {
      scrollLeft();
    }
  };

  const scrollLeft = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const getlogo = (url, username) => {
    let logo = null;
    axios
      .post(url, { username: username })
      .then((res) => {
        logo = res.data.logo || null;
        const updatedCards = cardsData.map((card) =>
          card.username === username ? { ...card, logo: logo } : card,
        );
        setCardsData(updatedCards);
      })
      .catch((err) => {
        console.error("Error fetching logo:", err);
      });
    return logo;
  };

  const getProfiles = async () => {
    try {
      const res = await axios.post("api/profile/get_all_profiles/", "", config);

      const profiles = res.data.map((profile) => {
        const [firstName, ...lastParts] = (profile.name || "").split(" ");
        const lastName = lastParts.join(" ");

        return {
          name: profile.name || "",
          firstName,
          lastName,
          designation: profile.designation || profile.Designation || "",
          company: profile.company || "",
          cardName: profile.card_name || "",
          username: profile.username || "",
          displayPic: profile.profile_picture || null,
          logo: profile.logo || null,
          is_review: profile.is_review,
          is_service: profile.is_service,
          is_video: profile.is_video,
          is_feature_images: profile.is_feature_images,
          is_links: profile.is_links,
          is_reviews: profile.is_review,
        };
      });

      setCardsData(profiles);
      return profiles;
    } catch (err) {
      console.error("Error fetching profiles:", err);
      return null;
    }
  };

  const scrollRight = () => {
    const maxIndex = isMobile ? cardsData.length : cardsData.length - 1;
    setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#ffffff",
      color: "#404040",
      fontSize: "12px",
      fontWeight: 400,
      borderRadius: "8px",
      lineHeight: "16px",
      padding: "12px",
      maxWidth: "172px",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: "#ffffff",
    },
  }));

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "display") setDisplayPic(reader.result);
        if (type === "logo") setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCard = (cardIndex) => {
    const cardData = cardsData[cardIndex];

    const nameParts = cardData.name ? cardData.name.trim().split(" ") : [];
    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      designation: cardData.designation || "",
      company: cardData.company || "",
      cardName: cardData.cardName || "",
      username: cardData.username || "",
    });
    setDisplayPic(cardData.displayPic || null);
    setLogo(cardData.logo || null);
    setIsEditMode(true);
    setEditingIndex(cardIndex);
    setShowAdd(true);
    setErrors({
      firstName: (cardData.firstName || "").length > 25,
      lastName: (cardData.lastName || "").length > 25,
      designation: (cardData.designation || "").length > 25,
      company: (cardData.company || "").length > 25,
      cardName: (cardData.cardName || "").length > 15,
    });
  };

  const isFormValid = () => {
    const requiredFields = [
      "firstName",
      "designation",
      "company",
      "cardName",
      "username",
    ];
    const hasRequiredFields = requiredFields.every(
      (field) => formData[field].trim() !== "",
    );
    const hasErrors = Object.values(errors).some((error) => error);
    return hasRequiredFields && !hasErrors;
  };

  const uploadLogo = (username, file, token) => {
    const fd = new FormData();
    fd.append("username", username);
    fd.append("logo", file);
    return axios.post("api/logo/upload_logo/", fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);

    let saveSuccess = false;
    let saveMessage = "";

    const fd = new FormData();
    fd.append(
      "name",
      `${formData.firstName}${formData.lastName ? " " + formData.lastName : ""}`,
    );
    fd.append("designation", formData.designation);
    fd.append("company", formData.company);
    fd.append("card_name", formData.cardName);

    if (displaypicFile) fd.append("profile_picture", displaypicFile);
    if (logoFile) fd.append("logo", logoFile);
    if (logoDelete) fd.append("delete_logo", "true");

    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${props_token}`,
    };

    try {
      if (isEditMode && editingIndex !== null) {
        const new_username = formData.username;
        fd.append("new_username", new_username);
        fd.append("username", cardsData[editingIndex].username);

        await axios.post("api/profile/update_profile/", fd, { headers });

        await getProfiles();
        saveSuccess = true;
        saveMessage = "Profile updated successfully!";
      } else {
        fd.append("username", formData.username);
        await axios.post("/api/profile/create_profile/", fd, { headers });

        await getProfiles();
        saveSuccess = true;
        saveMessage = "Profile created successfully!";
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      saveSuccess = false;
      saveMessage =
        err?.response?.data?.message ||
        "Failed to save profile. Please try again.";
    }

    setLoading(false);

    if (saveSuccess) {
      setShowAdd(false);
      setDisplayPic(null);
      setLogo(null);
      setLogoDelete(false);
      setFormData({
        firstName: "",
        lastName: "",
        designation: "",
        company: "",
        cardName: "",
        username: "",
      });
      setIsEditMode(false);
      setEditingIndex(null);

      toast.success(saveMessage);
    } else {
    }
  };

  const MAX_CARDS = 5;
  const handleAddCard = () => {
    if (cardsData.length >= MAX_CARDS) {
      return;
    }
    setFormData({
      firstName: "",
      lastName: "",
      designation: "",
      company: "",
      cardName: "",
      username: "",
    });
    setDisplayPic(null);
    setLogo(null);
    setLogoDelete(false);
    setIsEditMode(false);
    setShowAdd(true);
    setErrors({
      firstName: false,
      lastName: false,
      designation: false,
      company: false,
      cardName: false,
      username: false,
    });
  };

  const handleDuplicateCard = (cardIndex) => {
    const cardData = cardsData[cardIndex];
    if (cardsData.length >= MAX_CARDS) {
      toast.error("You can only have up to 5 Digital Business Cards.");
      return;
    }
    setFormData({
      firstName: cardData.firstName || "",
      lastName: cardData.lastName || "",
      designation: cardData.designation || "",
      company: cardData.company || "",
      cardName: "",
      username: "",
    });
    setDisplayPic(cardData.displayPic || null);
    setLogo(cardData.logo || null);
    setIsEditMode(false);
    setEditingIndex(null);
    setShowAdd(true);
    setErrors({
      firstName: false,
      lastName: false,
      designation: false,
      company: false,
      cardName: false,
      username: false,
    });
  };

  const handleDeleteCard = (cardIndex) => {
    setDeleteCardIndex(cardIndex);
    setShowDeleteCardModal(true);
  };

  const confirmDeleteCard = async () => {
    if (deleteCardIndex === null) return;
    const cardData = cardsData[deleteCardIndex];
    setDeleteCardLoading(true);

    try {
      await axios.delete("api/profile/delete_profile/", {
        data: { username: cardData.username },
        headers: { Authorization: `Bearer ${props_token}` },
      });
      toast.success("Card deleted successfully!");
      await getProfiles();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete card.");
    } finally {
      setDeleteCardLoading(false);
      setShowDeleteCardModal(false);
      setDeleteCardIndex(null);
    }
  };

  const cancelDeleteCard = () => {
    setShowDeleteCardModal(false);
    setDeleteCardIndex(null);
    setDeleteCardLoading(false);
  };
  const handleUsernameBlur = async () => {
    const username = formData.username.trim();
    if (!username) return;
    try {
      const payload = isEditMode
        ? { username, new_username: cardsData[editingIndex]?.username }
        : { username };

      const res = await axios.post("/api/user/check_username/", payload);
      const { is_user, suggested_username } = res.data;

      if (is_user === true) {
        setErrors((prev) => ({
          ...prev,
          username: `Username already taken. Try "${suggested_username}"`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, username: "" }));
      }
    } catch (err) {
      console.warn("⚠️ Username check failed:", err.message);
      setErrors((prev) => ({
        ...prev,
        username: "Could not verify username. Try again later.",
      }));
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
  };

  const handleInputChange = (e, field, limit) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: value.length > limit }));
  };

  return (
    <div className="Profile_edit_card">
      <div className="Profile_edit_text">
        <h1>
          Hello,
          <br />{" "}
          {cardsData[activeIndex] ? cardsData[activeIndex].firstName : "User"}
        </h1>
        <h5>Your Digital Business Cards are ready.</h5>
        <CustomTooltip
          title={
            cardsData.length >= 5
              ? "You can only add up to 5 Digital Business Cards."
              : "Add a maximum of 5 Digital Business Cards with custom profiles for each."
          }
          arrow
        >
          <button
            ref={addButtonRef}
            onClick={handleAddCard}
            disabled={cardsData.length >= 5}
            style={
              cardsData.length >= 5
                ? { cursor: "not-allowed", opacity: 0.5 }
                : {}
            }
          >
            + Add Card
          </button>
        </CustomTooltip>
      </div>

      <div
        className="profile_cards"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {cardsData.map((item, id) => {
          let positionClass = "hidden";
          if (id === activeIndex) positionClass = "active";
          else if (id === activeIndex - 1) positionClass = "left";
          else if (id === activeIndex + 1) positionClass = "right";

          return (
            <div className={`profile_card ${positionClass}`} key={id}>
              <button className="tm3-user-img-wrapper">
                <img
                  src={
                    item.displayPic ||
                    "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Left_grey_png.webp"
                  }
                  alt="profile_picture"
                  className="tm3-user-img"
                />
                <button>{item.cardName}</button>
              </button>
              <div className="tm3-name">
                {item.logo && (
                  <img
                    className="tm3_company_logo"
                    src={item.logo}
                    alt="Company"
                    loading="lazy"
                  />
                )}

                <h1>{item.name}</h1>
                <p>{item.designation}</p>
                <p>{item.company}</p>

                <img
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Mask_group_png.webp"
                  alt="bg"
                  loading="lazy"
                  className="bg_img"
                />
              </div>

              <ThreeDotCardDropdown
                onEdit={() => handleEditCard(id)}
                onDuplicate={() => handleDuplicateCard(id)}
                onDelete={() => handleDeleteCard(id)}
                isMainProfile={item.cardName === "Main Profile"}
              />
            </div>
          );
        })}
        <div
          className={`add_card_mobile ${
            activeIndex === cardsData.length
              ? "active"
              : activeIndex === cardsData.length - 1
                ? "right"
                : activeIndex === cardsData.length + 1
                  ? "left"
                  : "hidden"
          }`}
          onClick={cardsData.length >= 5 ? undefined : handleAddCard}
          style={
            cardsData.length >= 5 ? { cursor: "not-allowed", opacity: 0.5 } : {}
          }
        >
          <div className="add_card_content">
            <div className="plus_icon">
              <span> +</span>
              <span>Add Card</span>
            </div>
          </div>
        </div>
      </div>

      <button
        className="cta-btn"
        onClick={() => setIsShareModalOpen(true)}
        ref={shareButtonRef}
      >
        <SendIcon />
        Share Your Card
        <KeyboardArrowDownIcon className="icon_down" />
      </button>

      <div className="profile_nav">
        <span>
          {activeIndex + 1}/{totalItems}
        </span>
        <div>
          <button onClick={scrollLeft} disabled={activeIndex === 0}>
            <KeyboardArrowLeftIcon />
          </button>
          <button
            onClick={scrollRight}
            disabled={
              activeIndex >=
              (isMobile ? cardsData.length : cardsData.length - 1)
            }
          >
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>

      {showUpgradeModal && (
        <BlurPopup
          className="upgrade-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
          onClose={() => setShowUpgradeModal(false)}
        >
          <div
            className="upgrade-modal-container"
            style={{
              position: "absolute",
              width: "391px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h2 className="upgrade-modal-title">Upgrade Plan</h2>

            <div className="upgrade-plan-tabs">
              <button
                className={`upgrade-plan-tab ${
                  selectedPlan === "Pro" ? "active" : ""
                }`}
                onClick={() => setSelectedPlan("Pro")}
              >
                Pro
              </button>
              <button
                className={`upgrade-plan-tab ${
                  selectedPlan === "Teams" ? "active" : ""
                }`}
                onClick={() => setSelectedPlan("Teams")}
              >
                Teams
              </button>
            </div>
            <div className="upgrade-features-list">
              {[
                "Everything in Starter Plan, Plus",
                "5 Profiles in Total",
                "Built-in Email",
                "Schedule Meetings",
                "Unlimited Lead History",
              ].map((feature, index) => (
                <div key={index} className="upgrade-feature-item">
                  <div className="upgrade-feature-check">
                    <CheckIcon className="upgrade-check-icon" />
                  </div>
                  <span className="upgrade-feature-text">{feature}</span>
                </div>
              ))}
            </div>

            <div className="upgrade-modal-actions">
              <button
                className="upgrade-btn-cancel"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
              <button className="upgrade-btn-primary" onClick={handleUpgrade}>
                Upgrade
              </button>
            </div>
          </div>
        </BlurPopup>
      )}

      {isShareModalOpen && (
        <BlurPopup
          className="exact-share-modal-overlay"
          onClose={() => setIsShareModalOpen(false)}
          openState={isShareModalOpen}
        >
          <div
            className="exact-share-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 380,
              padding: 20,
              borderRadius: 20,
              background: "#fff",
              zIndex: 1201,
              boxShadow: "0 0 15px 2px #6F6F6F",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div className="qr-text-container">
              <div className="qr-code">
                <QRCodeCanvas
                  value={profile_url}
                  size={150}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                  includeMargin={true}
                  className="qr-img"
                />
              </div>
              <div className="qr-label">Scan to view profile</div>
            </div>

            <div className="share-modal-container">
              <button
                className="share-modal-action"
                onClick={() => {
                  navigator.clipboard.writeText(profile_url);
                  toast.success("Link copied to clipboard!");
                }}
              >
                <span style={{ fontSize: 13, color: "#404040" }}>
                  <InsertLinkIcon
                    style={{ width: 40, height: 40, margin: 10 }}
                  />
                  <br />
                  Copy Link
                </span>
              </button>
              {/* <button
                className="share-modal-action"
                onClick={() =>
                  (window.location.href = `mailto:?subject=Digital Business Card&body=Check out my digital business card: ${cardsData[activeIndex].username}`)
                }
              >
                <span style={{ fontSize: 13, color: "#404040" }}>
                  <EmailOutlinedIcon
                    style={{ width: 40, height: 40, margin: 10 }}
                  />
                  <br /> Email
                </span>
              </button> */}

              <button
                className="share-modal-action"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShowEmailModal(true);
                }}
              >
                <span style={{ fontSize: 13, color: "#404040" }}>
                  <EmailOutlinedIcon
                    style={{ width: 40, height: 40, margin: 10 }}
                  />
                  <br /> Email
                </span>
              </button>
              <button className="share-modal-action" onClick={handleShareClick}>
                <span style={{ fontSize: 13, color: "#404040" }}>
                  <ShareOutlinedIcon
                    style={{ width: 40, height: 40, margin: 10 }}
                  />
                  <br /> Share
                </span>
              </button>
            </div>

            <button
              style={{ marginTop: 10 }}
              className="share-wallet-btn share-wallet-apple"
              onClick={handleAddToAppleWallet}
              disabled={loading}
            >
              <span className="wallet-icon wallet-apple modal-icon"></span>
              {loadingApple ? "Adding..." : "Add to Apple Wallet"}
            </button>
            <button
              style={{ marginTop: 10 }}
              className="share-wallet-btn share-wallet-google"
              onClick={handleAddToGoogleWallet}
              disabled={loading}
            >
              <span className="wallet-icon wallet-google"></span>
              {loadingGoogle ? "Adding..." : "Add to Google Wallet"}
            </button>
          </div>
        </BlurPopup>
      )}

      {showAdd && (
        <BlurPopup
          onClose={() => {
            setShowAdd(false);
            setDisplayPic(null);
            setLogo(null);
            setLogoDelete(false);
            setFormData({
              firstName: "",
              lastName: "",
              designation: "",
              company: "",
              cardName: "",
              username: "",
            });
            setIsEditMode(false);
            setEditingIndex(null);
            setLoading(false);
          }}
          openState={showAdd}
        >
          <div className="blurpopup_con_wrapper profile_add_popup">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <h4 style={{ margin: 0 }}>Digital Business Card Details</h4>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setDisplayPic(null);
                  setLogo(null);
                  setLogoDelete(false);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    designation: "",
                    company: "",
                    cardName: "",
                    username: "",
                  });
                  setIsEditMode(false);
                  setEditingIndex(null);
                  setLoading(false);
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgb(73 66 66 / 16%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f5f5f5";
                }}
              >
                <CloseIcon style={{ fontSize: 20, color: "#666" }} />
              </button>
            </div>

            {/* <h4>Digital Business Card Details</h4> */}
            <h5>Add the details for your Digital Business Card.</h5>

            <div className="profile_add_img">
              <div
                className="profile_add_img_input"
                onClick={() =>
                  !displayPic &&
                  document.getElementById("displayPicInput").click()
                }
              >
                {displayPic ? (
                  <>
                    <img src={displayPic} alt="Display Preview" />
                    <ThreeDotDropdown
                      hasImage={!!displayPic}
                      onReplace={() =>
                        document.getElementById("displayPicInput").click()
                      }
                      onDelete={() => setDisplayPic(null)}
                    />
                  </>
                ) : (
                  <>
                    <div className="add_btn">
                      <AddIcon className="icon" />
                    </div>
                    <span>Add a Display Picture</span>
                  </>
                )}

                <input
                  id="displayPicInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setDisplaypicFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setDisplayPic(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div
                className="profile_add_img_input"
                onClick={() =>
                  !logo && document.getElementById("logoPicInput").click()
                }
              >
                {logo ? (
                  <>
                    <img src={logo} alt="Logo Preview" />
                    <ThreeDotDropdown
                      hasImage={!!logo}
                      onReplace={() =>
                        document.getElementById("logoPicInput").click()
                      }
                      onDelete={() => {
                        setLogo(null);
                        setLogoDelete(true);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="add_btn">
                      <AddIcon className="icon" />
                    </div>
                    <span>Add a Logo</span>
                  </>
                )}
                <input
                  id="logoPicInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setLogoFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setLogo(ev.target.result);
                      reader.readAsDataURL(file);
                      setLogoDelete(false);
                    }
                  }}
                />
              </div>
            </div>

            {/* <div className="profile_add_name"> */}
            <div>
              <label>First Name (Max. characters 15)*</label>
              <input
                type="text"
                value={formData.firstName}
                maxLength={16}
                onChange={(e) => handleInputChange(e, "firstName", 15)}
                style={{ borderColor: errors.firstName ? "red" : "" }}
              />
              {errors.firstName && (
                <span className="error-message" style={{ color: "red" }}>
                  Limit exceeded: 15 characters
                </span>
              )}
            </div>

            <div>
              <label>Last Name (Max. characters 10)*</label>
              <input
                type="text"
                value={formData.lastName}
                maxLength={11}
                onChange={(e) => handleInputChange(e, "lastName", 10)}
                style={{ borderColor: errors.lastName ? "red" : "" }}
              />
              {errors.lastName && (
                <span className="error-message" style={{ color: "red" }}>
                  Limit exceeded: 10 characters
                </span>
              )}
            </div>

            <label>Title (Max. characters 25)*</label>
            <input
              type="text"
              value={formData.designation}
              maxLength={26}
              onChange={(e) => handleInputChange(e, "designation", 25)}
              style={{ borderColor: errors.designation ? "red" : "" }}
            />
            {errors.designation && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 25 characters
              </span>
            )}

            <label> Company Name (Max. characters 25)*</label>
            <input
              type="text"
              value={formData.company}
              maxLength={26}
              onChange={(e) => handleInputChange(e, "company", 25)}
              style={{ borderColor: errors.company ? "red" : "" }}
            />
            {errors.company && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 25 characters
              </span>
            )}

            <label>Tag your Card (Max. 15 characters)*</label>
            <input
              type="text"
              value={formData.cardName}
              disabled={formData.cardName === "Main Profile"}
              maxLength={16}
              onChange={(e) => handleInputChange(e, "cardName", 15)}
              style={{ borderColor: errors.cardName ? "red" : "" }}
            />
            {errors.cardName && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 15 characters
              </span>
            )}

            <label>Username (Max. 20 characters)*</label>

            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  background: "#f7f7f7",
                  border: "1px solid #ccc",
                  borderRadius: "8px 0 0 8px",
                  padding: "8px 12px",
                  fontWeight: "bold",
                  color: "#555",
                  borderRight: "none",
                  marginBottom: "20px",
                }}
              >
                NSG.me/
              </span>

              <input
                type="text"
                value={formData.username}
                maxLength={20}
                onChange={(e) => handleInputChange(e, "username", 20)}
                onBlur={handleUsernameBlur}
                disabled={isEditMode}
                style={{
                  border: `1px solid ${errors.username ? "red" : "#ccc"}`,
                  borderRadius: "0 8px 8px 0",
                  padding: "8px 12px",
                  cursor: isEditMode ? "not-allowed" : "text",
                }}
                placeholder="Enter username"
              />
            </div>

            {!isEditMode && (
              <p
                className="username-note"
                style={{ marginTop: -20, marginBottom: 20 }}
              >
                Once created, the username cannot be edited.
              </p>
            )}

            {isEditMode && (
              <p
                className="username-note"
                style={{ marginTop: -20, marginBottom: 20 }}
              >
                This username was selected during setup.
              </p>
            )}
            {errors.username && (
              <span className="error-message" style={{ color: "red" }}>
                {errors.username}
              </span>
            )}

            <div className="profile_btn">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setDisplayPic(null);
                  setLogo(null);
                  setLogoDelete(false);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    designation: "",
                    company: "",
                    cardName: "",
                    username: "",
                  });
                  setIsEditMode(false);
                  setEditingIndex(null);
                  setLoading(false);
                }}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-save"
                disabled={!isFormValid() || loading}
              >
                {loading ? (isEditMode ? "Updating..." : "Saving...") : "Save"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}

      {showEmailModal && (
        <BlurPopup
          className="email-modal-overlay"
          onClose={() => {
            setShowEmailModal(false);
            setEmailFormData({ name: "", email: "", message: "" });
            setLoading(false);
          }}
          openState={showEmailModal}
        >
          <div
            className="email-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0px 20px 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                Email Your Card
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Name <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={emailFormData.name}
                  onChange={handleEmailInputChange}
                  placeholder="Enter recipient's name"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Email <span style={{ color: "#e74c3c" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={emailFormData.email}
                  onChange={handleEmailInputChange}
                  placeholder="Enter recipient's email"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Message{" "}
                  <span style={{ color: "#999", fontWeight: "400" }}>
                    (Optional)
                  </span>
                </label>
                <textarea
                  name="message"
                  value={emailFormData.message}
                  onChange={handleEmailInputChange}
                  placeholder="Add a personal message..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    outline: "none",
                    resize: "vertical",
                    minHeight: "100px",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "28px",
              }}
            >
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailFormData({ name: "", email: "", message: "" });
                  setLoading(false);
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "500",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  color: "#333",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={
                  !emailFormData.name.trim() ||
                  !emailFormData.email.trim() ||
                  loading
                }
                style={{
                  flex: 1,
                  padding: "14px 24px",

                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "500",
                  border: "none",
                  borderRadius: "12px",
                  backgroundColor:
                    !emailFormData.name.trim() ||
                    !emailFormData.email.trim() ||
                    loading
                      ? "#ccc"
                      : "#000000ff",
                  color: "#ffffffff",
                  cursor:
                    !emailFormData.name.trim() ||
                    !emailFormData.email.trim() ||
                    loading
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading ? <LoaderIcon /> : "Send"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}

      {showDeleteCardModal && (
        <BlurPopup onClose={cancelDeleteCard} openState={showDeleteCardModal}>
          <div
            className="delete-confirmation-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="dialog-title">Delete Card</h3>
            <p className="dialog-message">
              Are you sure you want to delete{" "}
              <strong>
                {deleteCardIndex !== null
                  ? cardsData[deleteCardIndex]?.cardName ||
                    cardsData[deleteCardIndex]?.name
                  : ""}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="dialog-actions">
              <button
                className="cancel-btn"
                onClick={cancelDeleteCard}
                disabled={deleteCardLoading}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={confirmDeleteCard}
                disabled={deleteCardLoading}
              >
                {deleteCardLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default ProfileCard;
