import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import copy from "copy-to-clipboard";
import Swal from "sweetalert2";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Toast from "../../Components/Toast/Toast";
import CardBottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import AddContact from "../../Components/AddContact/AddContact";
import BusinessCardScanner from "../../Components/BusinessCardScanner/BusinessCardScanner";
import { useStore } from "../../store/advisorStore";
import { QRCodeCanvas } from "qrcode.react";
import "./Home.scss";
import "../Dashboard/Dashboard.scss";
import "../../Components/CardProfileBottomBar/BottomBar.scss";

const timePeriodOptions = [
  { id: "all", name: "Since Beginning", badge: "All time" },
  { id: "last_7_days", name: "Last 7 Days", badge: "Last 7 days" },
  { id: "last_30_days", name: "Last 30 Days", badge: "Last 30 days" },
  { id: "last_6_months", name: "Last 6 Months", badge: "Last 6 months" },
  { id: "last_1_year", name: "Last 1 Year", badge: "Last 1 year" },
];

const outlookStep = [
  "Copy your email signature",
  "Log in to your Outlook account",
  "Press the gear icon on the top right and search for Email Signature",
  "Paste your generated email signature",
  "Save your signature from the bottom-right Save button.",
];

const defaultUserInfo = {
  name: "NSG",
  email: "",
};

function Home() {
  const navigate = useNavigate();
  const signatureRef = useRef(null);
  const isMobile = window.innerWidth <= 786;
  const { advisor_data, get_advisor_data } = useStore();
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "null") || defaultUserInfo;
  const [activePlatform, setActivePlatform] = useState(0);
  const [bodyContent, setBodyContent] = useState("");
  const [sortingData, setSortingData] = useState("last_7_days");
  const [signatureData, setSignatureData] = useState("");
  const [signature, setSignature] = useState();
  const [showGuide, setShowGuide] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBusinessCardScanner, setShowBusinessCardScanner] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [scannerInitialData, setScannerInitialData] = useState(null);
  const [cardsData, setCardsData] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [toastText, setToastText] = useState({
    text: "",
    show: false,
  });

  const config = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    }),
    [],
  );

  const REDIRECT_URL = `${axios.defaults.baseURL}/home`;
  const CALENDAR_REDIRECT_URL = process.env.REACT_APP_CALENDAR_REDIRECT_URL;
  const SCOPES = process.env.REACT_APP_CALENDAR_SCOPES;
  const GOOGLE_URL =
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=" +
    SCOPES +
    "&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=" +
    REDIRECT_URL +
    CALENDAR_REDIRECT_URL +
    "&prompt=consent";

  const displayName = advisor_data?.name || userInfo?.name || "NSG";
  const avatarText = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const currentPeriod =
    timePeriodOptions.find((option) => option.id === sortingData) ||
    timePeriodOptions[1];
  const shareBaseUrl =
    axios.defaults.baseURL?.includes("127.0.0.1") ||
    axios.defaults.baseURL?.includes("localhost")
      ? "http://localhost:4000/"
      : axios.defaults.baseURL?.endsWith("/")
        ? axios.defaults.baseURL
        : `${axios.defaults.baseURL}/`;
  const activeCard = cardsData[activeCardIndex];
  const profileUrl = activeCard?.username
    ? `${shareBaseUrl}${activeCard.username}`
    : advisor_data?.username
      ? `${shareBaseUrl}${advisor_data.username}`
      : "";

  const googleStep = [
    signatureData ? "Copy your email signature" : "Add your email signature",
    "Log in to your Gmail account",
    "Click the gear icon on the top right and select See all settings",
    "Scroll down to the Signature section and create a new signature",
    "Set your new signature as the default under Signature Defaults below the preview box if you have multiple signatures.",
  ];

  const quickActions = [
    {
      key: "share-profile",
      label: "Share Profile",
      icon: <ShareOutlinedIcon />,
      bubble: null,
      onClick: () => setShowShareCard(true),
    },
    {
      key: "share-booking",
      label: "Share Booking Link",
      icon: <CalendarMonthOutlinedIcon />,
      bubble: "Share link for your prospects to book a meeting with you.",
      onClick: () => {
        if (advisor_data?.username) {
          copy(`/${advisor_data.username}/booking`);
          setToastText({
            text: "Booking link copied successfully",
            show: true,
          });
        } else {
          navigate("/calendar");
        }
      },
    },
    {
      key: "email-signature",
      label: "Get Email Signature",
      icon: <DrawOutlinedIcon />,
      bubble: "Email signature in your Gmail or Outlook mailbox.",
      onClick: () => setShowGuide(true),
    },
  ];

  const insightCards = [
    {
      key: "profile-views",
      label: "Profile Views",
      value: dashboardData.profile_visit_count || 0,
    },
    {
      key: "contacts-added",
      label: "Contacts Added",
      value: dashboardData.contact_count || 0,
    },
    {
      key: "follow-ups",
      label: "Follow-Ups",
      value: dashboardData.email_count || 0,
    },
    {
      key: "meetings-scheduled",
      label: "Meetings Scheduled",
      value: dashboardData.meeting_count || 0,
    },
  ];

  const sendEmailSignature = (accessToken) => {
    axios
      .post(
        "api/feature/send_email_signature/",
        { access_token: accessToken },
        config,
      )
      .then((res) => setSignature(res.data))
      .catch(() => setSignature(undefined));
  };

  const sendEmailSignatureOutlook = () => {
    axios
      .post("api/feature/send_email_signature/", {}, config)
      .then((res) => setSignatureData(res.data))
      .catch(() => setSignatureData(undefined));
  };

  const getDashboardData = () => {
    axios
      .post(
        "api/dashboard/get_dashboard_data/",
        { time_period: sortingData },
        config,
      )
      .then((res) => setDashboardData(res.data || {}))
      .catch((err) => console.log("dashboard error", err));
  };

  const getAccessToken = () => {
    axios
      .post("api/user/get_access_token/", {}, config)
      .then((res) => {
        sendEmailSignature(res.data.google_access_token);
      })
      .catch(() => console.log("access token not found"));
  };

  const saveAccessToken = (code) => {
    axios
      .post(
        "api/user/save_access_token/",
        { code, redirect_uri: REDIRECT_URL },
        config,
      )
      .then(() => {
        setToastText({
          text: "Signature added successfully",
          show: true,
        });
        setShowGuide(true);
        getAccessToken();
        window.history.pushState({}, "", "/home");
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong.",
          text: err.response?.data?.message || "Please try again.",
          showConfirmButton: false,
          timer: 3000,
        });
        window.history.pushState({}, "", "/home");
      });
  };

  const handleCopySignature = async () => {
    if (!signatureRef.current) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([signatureRef.current.innerHTML], {
            type: "text/html",
          }),
        }),
      ]);
      setToastText({
        text: "Signature copied successfully",
        show: true,
      });
    } catch (error) {
      console.error("Clipboard error:", error);
      setToastText({
        text: "Copy failed in this browser",
        show: true,
      });
    }
  };

  const handleBusinessCardScanSuccess = (scannedData) => {
    setScannerInitialData(scannedData);
    setShowBusinessCardScanner(false);
    setShowAddContact(true);
  };

  const fetchAllProfiles = async () => {
    try {
      const res = await axios.post("api/profile/get_all_profiles/", "", config);
      const profiles = res.data.map((profile) => {
        const [firstName] = (profile.name || "").split(" ");

        return {
          name: profile.name || "",
          firstName,
          cardName: profile.card_name || "",
          username: profile.username || "",
        };
      });
      setCardsData(profiles);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const handleShareClick = () => {
    if (navigator.share && profileUrl) {
      navigator
        .share({
          title: "Check out this link!",
          text: "Check out my digital business card",
          url: profileUrl,
        })
        .catch((error) => {
          console.error("Error sharing via Web Share API:", error);
          navigator.clipboard.writeText(profileUrl);
          setToastText({
            text: "Link copied to clipboard!",
            show: true,
          });
        });
    } else if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      setToastText({
        text: "Link copied to clipboard!",
        show: true,
      });
    }
  };

  const handleEmailInputChange = (event) => {
    const { name, value } = event.target;
    setEmailFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async () => {
    if (!emailFormData.name.trim() || !emailFormData.email.trim()) {
      setToastText({
        text: "Please fill in all required fields",
        show: true,
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "api/digital_card/email_business_card/",
        {
          receiver_name: emailFormData.name,
          message: emailFormData.message,
          receiver_email: emailFormData.email,
        },
        config,
      );
      setShowEmailModal(false);
      setEmailFormData({ name: "", email: "", message: "" });
      setToastText({
        text: "Email sent successfully!",
        show: true,
      });
    } catch (err) {
      setToastText({
        text: err.response?.data?.message || "Failed to send email",
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToAppleWallet = async () => {
    if (!activeCard?.username && !advisor_data?.username) return;

    setLoadingApple(true);
    try {
      const response = await axios.post(
        "/api/apple_pass/generate_pass/",
        { username: activeCard?.username || advisor_data?.username },
        config,
      );
      const downloadResponse = await axios.get(response.data.download_url, {
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
      } else {
        const url = window.URL.createObjectURL(passBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "NSG.pkpass";
        document.body.appendChild(link);
        link.click();
      }

      setShowShareCard(false);
      setToastText({
        text: "Apple Wallet pass ready",
        show: true,
      });
    } catch (error) {
      console.error("Error adding pass to Apple Wallet:", error);
      setToastText({
        text: "Failed to add Apple Wallet pass",
        show: true,
      });
    } finally {
      setLoadingApple(false);
    }
  };

  const handleAddToGoogleWallet = async () => {
    if (!activeCard?.username && !advisor_data?.username) return;

    setLoadingGoogle(true);
    try {
      const res = await axios.post(
        "api/google_pass/google_pass/",
        { username: activeCard?.username || advisor_data?.username },
        config,
      );
      const passUrl = res.data["Add to wallet"];
      if (passUrl) {
        window.location.href = passUrl;
      }
      setShowShareCard(false);
    } catch (err) {
      setToastText({
        text: err.response?.data?.message || "Failed to add Google Wallet pass",
        show: true,
      });
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleCloseAddContact = () => {
    setShowAddContact(false);
    setScannerInitialData(null);
  };

  useEffect(() => {
    getDashboardData();
  }, [sortingData]);

  useEffect(() => {
    getAccessToken();
    sendEmailSignatureOutlook();
    fetchAllProfiles();

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      saveAccessToken(code);
    }

    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
  }, []);

  useEffect(() => {
    if (!signatureData) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(signatureData, "text/html");
    setBodyContent(doc.body.innerHTML);
  }, [signatureData]);

  useEffect(() => {
    if (!toastText.show) return undefined;

    const timeout = setTimeout(() => {
      setToastText((current) => ({
        ...current,
        show: false,
      }));
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toastText]);

  useEffect(() => {
    if (showShareCard || showEmailModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showShareCard, showEmailModal]);

  const formatMetric = (value) =>
    new Intl.NumberFormat("en-US").format(Number(value || 0));

  const activeStep = activePlatform === 0 ? googleStep : outlookStep;

  return (
    <div className="home_dashboard">
      {toastText.show && <Toast text={toastText.text} />}

      <div className="home_dashboard__mobile_header">
        <div className="home_dashboard__mobile_avatar">
          {advisor_data?.profile_picture ? (
            <img src={advisor_data.profile_picture} alt={displayName} />
          ) : (
            <span>{avatarText}</span>
          )}
        </div>
        <div className="home_dashboard__mobile_user">
          <strong>{displayName}</strong>
          <span>Home</span>
        </div>
      </div>

      <div className="home_dashboard__content">
        <section className="home_dashboard__section">
          <span className="home_dashboard__eyebrow">Quick Actions</span>
          <h1>Quick Actions</h1>
          <p className="home_dashboard__intro">
            Start by scanning to capture new leads
          </p>

          <button
            className="home_dashboard__scan_button"
            onClick={() => setShowBusinessCardScanner(true)}
          >
            <QrCodeScannerRoundedIcon />
            <span>Scan Paper Card</span>
          </button>

          <p className="home_dashboard__microcopy">
            Capture leads instantly • scan to add contacts in seconds
          </p>

          <div className="home_dashboard__actions">
            {quickActions.map((action) => (
              <button
                key={action.key}
                className="home_dashboard__action_card"
                onClick={action.onClick}
              >
                {action.bubble && (
                  <div className="home_dashboard__action_bubble">
                    {action.bubble}
                  </div>
                )}
                <div className="home_dashboard__action_icon">{action.icon}</div>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="home_dashboard__section home_dashboard__insights">
          <div className="home_dashboard__section_header">
            <span className="home_dashboard__label">Performance Insights</span>
            <label className="home_dashboard__period_select">
              <select
                value={sortingData}
                onChange={(event) => setSortingData(event.target.value)}
              >
                {timePeriodOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <KeyboardArrowDownRoundedIcon />
            </label>
          </div>

          <div className="home_dashboard__stats_grid">
            {insightCards.map((item) => (
              <article key={item.key} className="home_dashboard__stat_card">
                <span className="home_dashboard__stat_label">{item.label}</span>
                <div className="home_dashboard__stat_footer">
                  <strong>{formatMetric(item.value)}</strong>
                  <span className="home_dashboard__stat_badge">
                    {currentPeriod.badge}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {showGuide && (
        <BlurPopup
          onClose={() => setShowGuide(false)}
          ComponentClass="home_dashboard__signature_overlay"
        >
          <div
            className="blurpopup_con_wrapper home_dashboard__signature_modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dashboard_popup home_dashboard__signature_dialog">
              <div className="dashboard_popup_wrapper">
                <h2>How to add your email signature to your emails</h2>
                <div className="dashboard_popup_nav">
                  <button
                    className={activePlatform === 0 ? "acitve" : ""}
                    onClick={() => setActivePlatform(0)}
                  >
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gmail_png.webp"
                      alt="Gmail"
                      loading="lazy"
                    />{" "}
                    Gmail
                  </button>
                  <button
                    className={activePlatform === 1 ? "acitve" : ""}
                    onClick={() => setActivePlatform(1)}
                  >
                    <img
                      src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_4_png.webp"
                      alt="Outlook"
                      loading="lazy"
                    />{" "}
                    Outlook
                  </button>
                </div>
                <ol>
                  {activeStep.map((item, index) => (
                    <li key={`${item}-${index}`}>
                      {item}
                      {index === 0 && activePlatform === 0 && (
                        <>
                          {!signature && !signatureData && (
                            <button
                              onClick={() => window.location.assign(GOOGLE_URL)}
                            >
                              Add Signature
                            </button>
                          )}
                          {signatureData && (
                            <>
                              <div
                                style={{ display: "none" }}
                                ref={signatureRef}
                                dangerouslySetInnerHTML={{ __html: bodyContent }}
                              />
                              <button onClick={handleCopySignature}>
                                Copy Signature
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {index === 0 && activePlatform === 1 && signatureData && (
                        <>
                          <div
                            style={{ display: "none" }}
                            ref={signatureRef}
                            dangerouslySetInnerHTML={{ __html: bodyContent }}
                          />
                          <button onClick={handleCopySignature}>
                            Copy Signature
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </BlurPopup>
      )}

      {showShareCard && (
        <BlurPopup
          className="exact-share-modal-overlay"
          onClose={() => setShowShareCard(false)}
          openState={showShareCard}
        >
          <div
            className="exact-share-modal"
            onClick={(event) => event.stopPropagation()}
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

            <div className="qr-text-container">
              <div className="qr-code">
                <QRCodeCanvas
                  value={profileUrl}
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
                  navigator.clipboard.writeText(profileUrl);
                  setShowShareCard(false);
                  setToastText({
                    text: "Link copied to clipboard!",
                    show: true,
                  });
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
                  setShowShareCard(false);
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
            onClick={(event) => event.stopPropagation()}
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
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}

      {showBusinessCardScanner && (
        <BusinessCardScanner
          openState={showBusinessCardScanner}
          onClose={() => setShowBusinessCardScanner(false)}
          onScanSuccess={handleBusinessCardScanSuccess}
          isMobile={isMobile}
        />
      )}

      {showAddContact && (
        <BlurPopup onClose={handleCloseAddContact} openState={showAddContact}>
          <div className="blurpopup_con_wrapper people_add_contact_popup">
            <AddContact
              handleAddContact={() => {
                handleCloseAddContact();
                setToastText({
                  text: "Contact added successfully",
                  show: true,
                });
                navigate("/people");
              }}
              handleUpdateContact={() => {}}
              handleCLose={handleCloseAddContact}
              selectedPeople={null}
              isEdit={false}
              people_count={0}
              initialData={scannerInitialData}
            />
          </div>
        </BlurPopup>
      )}

      <CardBottomBar />
    </div>
  );
}

export default Home;
