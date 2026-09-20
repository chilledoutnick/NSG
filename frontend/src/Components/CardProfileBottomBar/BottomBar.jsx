import { useNavigate } from "react-router-dom";
import { isIOS } from "react-device-detect";
import { useState, lazy, useEffect } from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SendIcon from "@mui/icons-material/Send";
import PermContactCalendarIcon from "@mui/icons-material/ContactPageOutlined";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useStore } from "../../store/advisorStore";
import "./BottomBar.scss";
import BlurPopup from "../BlurPopup/BlurPopup";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { LoaderIcon, toast } from "react-hot-toast";

const CardProfileMenu = lazy(() =>
  import("../../Components/CardProfileMenu/CardProfileMenu")
);

function BottomBar() {
  const { advisor_data, get_advisor_data } = useStore();
  const navigate = useNavigate();
  const pathname = window.location.pathname;

  const [showSidebarCard, setShowSidebarCard] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [cardsData, setCardsData] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const isAdmin =
    pathname === "/analytics" ||
    pathname === "/admin-dashboard" ||
    pathname === "/admin-client-logs" ||
    pathname === "/integrations";
  const profileNavigation = isAdmin ? "/admin-dashboard" : "/card";

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

  const activeCard = cardsData[activeCardIndex];
  const profile_url = activeCard?.username
    ? `${url}${activeCard.username}`
    : "";

  let props_token = localStorage.getItem("jwt");
  const config = {
    headers: {
      Authorization: `Bearer ${props_token}`,
    },
  };

  useEffect(() => {
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data();
    }
    fetchAllProfiles();
  }, []);

  const fetchAllProfiles = async () => {
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
        };
      });
      setCardsData(profiles);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  useEffect(() => {
    if (isShareModalOpen || showEmailModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isShareModalOpen, showEmailModal]);

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
          navigator.clipboard.writeText(profile_url);
          toast.success("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(profile_url);
      toast.success("Link copied to clipboard!");
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
    if (!activeCard?.username) {
      toast.error("No profile selected");
      return;
    }

    setLoadingApple(true);
    try {
      const response = await axios.post(
        "/api/apple_pass/generate_pass/",
        { username: activeCard.username },
        config
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
          window.URL.createObjectURL(passBlob)
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
      console.error("❌ Error adding pass to Apple Wallet:", error);
      toast.error("Failed to add Apple Wallet pass.");
    } finally {
      setLoadingApple(false);
    }
  };

  const handleAddToGoogleWallet = async () => {
    if (!activeCard?.username) {
      toast.error("No profile selected");
      return;
    }

    setLoadingGoogle(true);
    try {
      const res = await axios.post(
        "/api/google_pass/google_pass/",
        { username: activeCard.username },
        config
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
      console.error("❌ Error adding Google Wallet pass:", err);
      toast.error("Failed to add Google Wallet pass.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const scrollLeft = () => {
    setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const scrollRight = () => {
    setActiveCardIndex((prev) =>
      prev < cardsData.length - 1 ? prev + 1 : prev
    );
  };

  return (
    <>
      {showSidebarCard && (
        <CardProfileMenu handleClose={() => setShowSidebarCard(false)} />
      )}
      <div
        className={"bottom_bar_con " + (isIOS ? "bottom_bar_con_ios" : "")}
        style={showSidebarCard ? { opacity: 0 } : {}}
      >
        {/* Home/Dashboard Button */}
        <button
          className={
            "bottom_bar_btn " +
            (!showSidebarCard && pathname === "/home" ? "active" : "")
          }
          onClick={() => navigate("/home")}
        >
          <div className="icon_container">
            <HomeOutlinedIcon />
          </div>
          <span className="label">Home</span>
        </button>

        {/* Profile Button */}
        <button
          onClick={() => navigate(profileNavigation)}
          className={
            "bottom_bar_btn " +
            (!showSidebarCard && pathname === profileNavigation ? "active" : "")
          }
        >
          <div className="icon_container">
            <PersonOutlineOutlinedIcon />
          </div>
          <span className="label">{isAdmin ? "Profiles" : "Profile"}</span>
        </button>

        {/* Share Button */}
        <button
          className="bottom_bar_btn share_btn"
          onClick={() => setIsShareModalOpen(true)}
        >
          <div className="icon_container share_icon_container">
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="#9e9e9e"
            >
              <path
                d="M22.1525 3.55321L11.1772 21.0044L9.50686 12.4078L2.00002 7.89795L22.1525 3.55321Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M9.45557 12.4436L22.1524 3.55321"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <span className="share_label_inside">Share</span>
          </div>
          <span className="label share_label">Share</span>
        </button>

        {/* Contacts Button */}
        <button
          className={
            "bottom_bar_btn " +
            (!showSidebarCard && pathname === "/people" ? "active" : "")
          }
          onClick={() => navigate("/people")}
        >
          <div className="icon_container">
            <PermContactCalendarIcon />
          </div>
          <span className="label">Contact</span>
        </button>

        {/* Menu/More Button */}
        <button
          className={"bottom_bar_btn " + (showSidebarCard ? "active" : "")}
          onClick={() => {
            setShowSidebarCard(!showSidebarCard);
          }}
        >
          <div className="icon_container">
            <MenuIcon />
          </div>
          <span className="label">More</span>
        </button>
      </div>

      {/* Share Modal with Slider */}
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
              padding: 24,
              borderRadius: 20,
              background: "#fff",
              zIndex: 1201,
              boxShadow: "0 0 15px 2px #6F6F6F",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {cardsData.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  overflowX: "auto",
                  width: "calc(100% - -20px)",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "10px",
                  scrollBehavior: "smooth",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                className="profile-tabs-scroll"
              >
                {cardsData.map((card, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCardIndex(index)}
                    style={{
                      padding: "8px 16px",
                      border: "none",
                      backgroundColor: "#fff",
                      fontSize: "14px",
                      fontWeight: activeCardIndex === index ? "600" : "400",
                      color: activeCardIndex === index ? "black" : "#666",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                      borderBottom:
                        activeCardIndex === index
                          ? "2px solid black"
                          : "2px solid transparent",
                    }}
                  >
                    {card.cardName || card.firstName}
                  </button>
                ))}
              </div>
            )}

            {/* QR Code */}
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

            {/* Share Actions */}
            <div className="share-modal-container">
              <button
                className="share-modal-action"
                onClick={() => {
                  navigator.clipboard.writeText(profile_url);
                  setIsShareModalOpen(false);
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

            {/* Wallet Buttons */}
            <button
              style={{ marginTop: 10 }}
              className="share-wallet-btn share-wallet-apple"
              onClick={handleAddToAppleWallet}
              disabled={loadingApple}
            >
              <span className="wallet-icon wallet-apple modal-icon"></span>
              {loadingApple ? "Adding..." : "Add to Apple Wallet"}
            </button>
            <button
              style={{ marginTop: 10 }}
              className="share-wallet-btn share-wallet-google"
              onClick={handleAddToGoogleWallet}
              disabled={loadingGoogle}
            >
              <span className="wallet-icon wallet-google"></span>
              {loadingGoogle ? "Adding..." : "Add to Google Wallet"}
            </button>
          </div>
        </BlurPopup>
      )}

      {/* Email Modal (same as before) */}
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
    </>
  );
}

export default BottomBar;
