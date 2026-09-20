import axios from "axios";
import  { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import copy from "copy-to-clipboard";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ShareIcon from "@mui/icons-material/Share";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { useStore } from "../../store/advisorStore";
import Toast from "../../Components/Toast/Toast";
import ShareYourCard from "../../Components/ShareYourCard/ShareYourCard";
import CardBottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./Dashboard.scss";

const SummaryBtn = [
  {
    id: "all",
    name: "Since beginning",
  },
  {
    id: "last_7_days",
    name: "Last 7d",
  },
  {
    id: "last_30_days",
    name: "Last 30d",
  },
  {
    id: "last_6_months",
    name: "Last 6m",
  },
  {
    id: "last_1_year",
    name: "Last 1y",
  },
];

const outlook_step = [
  "Copy your email signature",
  "Log in to your Outlook  account",
  "Press the gear icon on the top right and search for Email Signature",
  "Paste your  generated email signature",
  "Save your new signature by clicking the Save button at the bottom right.",
];

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#5B5574",
    color: "#FFF",
    fontSize: "12px",
    padding: "8px",
    borderRadius: "4px",
    fontFamily: "'Open Sans', sans-serif",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#5B5574",
  },
}));

function Dashboard() {
  const { advisor_data, get_advisor_data } = useStore();
  let hasAdvisor_data = Object.keys(advisor_data).length !== 0;
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 576;
  const signatureRef = useRef(null);
  const [openTooltip, setOpenTooltip] = useState(null);
  const [activePlatform, setactivePlatform] = useState(0);
  const [bodyContent, setBodyContent] = useState("");
  const [sortingData, setSortingData] = useState("all");
  const [SignatureData, setSignatureData] = useState("");
  const [showText, setshowText] = useState();
  const [Signature, setSignature] = useState();
  const [showGuide, setShowGuide] = useState(false);
  const [Dashboard_data, setDashboard_data] = useState([]);
  const [showShareCard, setShowShareCard] = useState(false);
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const REDIRECT_URL = axios.defaults.baseURL + "/dashboard";
  const CALENDAR_REDIRECT_URL = process.env.REACT_APP_CALENDAR_REDIRECT_URL;
  const SCOPES = process.env.REACT_APP_CALENDAR_SCOPES;
  const GOOGLE_URL =
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=" +
    SCOPES +
    "&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=" +
    REDIRECT_URL +
    CALENDAR_REDIRECT_URL+"&prompt=consent";

  const send_email_signature = (access_token) => {
    const url = "api/feature/send_email_signature/";
    const payload = {
      access_token: access_token,
    };
    axios
      .post(url, payload, config)
      .then((res) => setSignature(res.data))
      .catch((err) => setSignature(undefined));
  };

  const mobileTooltipProps = isMobile
    ? {
        disableFocusListener: true,
        disableHoverListener: true,
        disableTouchListener: true,
        onClose: () => setOpenTooltip(null),
      }
    : {};

  const send_email_signature_outlook = () => {
    const url = "api/feature/send_email_signature/";
    axios
      .post(url, {}, config)
      .then((res) => setSignatureData(res.data))
      .catch((err) => setSignatureData(undefined));
  };

  const get_dashboard_data = () => {
    const url = "api/dashboard/get_dashboard_data/";
    const payload = {
      time_period: sortingData,
    };
    axios
      .post(url, payload, config)
      .then((res) => setDashboard_data(res.data))
      .catch((err) => console.log("res", err));
  };

  useEffect(() => {
    get_dashboard_data();
  }, [sortingData]);

  useEffect(() => {
    get_access_token();
    send_email_signature_outlook();
    // const url_google = window.location.href.split("&");
    // if (url_google[1] !== undefined) {
    //   let code = url_google[1].replace("code=", "");
    //   save_access_token(code);
    // }
    const params = new URLSearchParams(window.location.search);

  const code = params.get("code");
  const state = params.get("state");
  console.log("code state", code, state, window.location.search);
  
   if (code) {
  save_access_token(code);
}
  
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
  }, []);

  useEffect(() => {
    if (hasAdvisor_data && SignatureData) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(SignatureData, "text/html");
      setBodyContent(doc.body.innerHTML);
    }
  }, [hasAdvisor_data, SignatureData]);

  useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({
          ...ToastText,
          show: false,
        });
      }, 3000);
    }
  }, [ToastText]);

  const save_access_token = (code) => {
    const url = "api/user/save_access_token/";
    const payload = {
      code: code,
      redirect_uri: REDIRECT_URL,
    };
    axios
      .post(url, payload, config)
      .then(() => {
        setToastText({
          ...ToastText,
          text: "Signature added successfully",
          show: true,
        });
        setShowGuide(true);
        get_access_token();
        window.history.pushState({}, "", "/dashboard");
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
        window.history.pushState({}, "", "/dashboard");
      });
  };

  const get_access_token = () => {
    const url = "api/user/get_access_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        send_email_signature(res.data.google_access_token);
      })
      .catch((err) => {
        console.log("res");
      });
  };

  const Card = [
    {
      title: "Share digital business card",
      desc: "Make a stellar impression and let contacts connect with you instantly.",
      cta: "Share your card",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/illustration01_png.webp",
      color: "#0415CF",
      text_bg_color: "#E7E9FF",
      bg_color: "linear-gradient(180deg, #AC92FC 0%, #6F3DFF 100%)",
      text: (
        <>
          Digital business cards streamline networking with instant profile
          access, boosting credibility and connection rates. Studies show 93% of
          people retain digital cards versus printed ones, significantly
          improving prospect long-term retention.{" "}
          <Link
            target="_blank"
            to="/blog/how-sharing-digital-business-cards-actively-can-boost-growth-leads"
          >
            Read more
          </Link>
        </>
      ),
      text_hedaer: "93%",
      text_desc: "retention rate",
    },
    {
      title: "Share your booking link",
      desc: "Send your booking link to your contacts to book a meeting with you.",
      cta: advisor_data.username ? "Copy booking link" : "Set up booking link",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/illustration15_png.webp",
      color: "#700569",
      text_bg_color: "#FFEFFE",
      bg_color: "linear-gradient(180deg, #88C5C1 0%, #2F9F92 100%)",
      text: (
        <>
          Research and studies show 94% of customers would switch to a business
          offering easier online booking and scheduling compared to alternatives
          lacking digital capabilities.{" "}
          <Link
            target="_blank"
            to="/blog/7-reasons-to-automate-meeting-scheduling-for-happier-clients-more-revenue"
          >
            Read more
          </Link>
        </>
      ),
      text_hedaer: "94%",
      text_desc: "Increased Client Satisfaction",
    },
    
    {
      title: "Get your email signature",
      desc: "Add a professional signature to your email tool (Gmail, Outlook, etc.).",
      cta: !Signature ? "Add signature" : "Copy signature",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/illustration06_png.webp",
      color: "#00AD85",
      text_bg_color: "#EBFFFA",
      bg_color: "linear-gradient(180deg, #b1d593 0%, #79bc36 100%)",
      text: (
        <>
          Over 76% of consumers report increased trust in senders with branded
          email signatures, making your digital business card an essential
          element of professional communication{" "}
          <Link
            target="_blank"
            to="/blog/more-than-contact-info-how-email-signature-marketing-drives-business-success"
          >
            Read more
          </Link>
        </>
      ),
      text_hedaer: "76%",
      text_desc: "boost in trust rate in emails",
    },
  ];

  const google_step = [
    SignatureData ? "Copy your email signature" : "Add your email signature",
    "Log in to your Gmail account",
    "Click the gear icon on the top right and select See all settings",
    "Scroll down to the Signature section and create a new signature",
    "Set your new signature as the default under Signature Defaults below the preview box if you have multiple signatures.",
  ];

  const handleCopy = async () => {
    if (signatureRef.current) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([signatureRef.current.innerHTML], {
              type: "text/html",
            }),
          }),
        ]);
        setToastText({
          ...ToastText,
          text: "Signature added successfully",
          show: true,
        });
      } catch (err) {
        console.error("Clipboard error:", err);
        alert("Copy failed or unsupported in this browser.");
      }
    }
  };
  const isTooltipOpen = (id) => (isMobile ? openTooltip === id : undefined);

  let activeStep = activePlatform === 0 ? google_step : outlook_step;

  const TooltipFeature = ({ id, tooltipContent, featureText, noclass }) => (
    <CustomTooltip
      arrow
      open={isTooltipOpen(id)}
      {...mobileTooltipProps}
      title={tooltipContent}
    >
      <span
        onClick={() => handleTooltipTrigger(id)}
        className={!noclass ? "text_under_pricing" : ""}
      >
        {featureText}
      </span>
    </CustomTooltip>
  );
  const handleTooltipTrigger = (id) => {
    if (openTooltip !== id) {
      setOpenTooltip(id);
    } else {
      setOpenTooltip(null);
    }
  };

  const Summary = [
    {
      title: Dashboard_data.profile_visit_count,
      desc: (
        <TooltipFeature
          id={1}
          tooltipContent="Share your card using your personalized QR code via your profile or your apple or google wallet. You can simple copy the link or email your card to your connections."
          featureText={
            <>
              Profile views <InfoOutlinedIcon fontSize="small" />
            </>
          }
        />
      ),
      cta: (
        <>
          <ShareIcon fontSize="small" /> Share your card
        </>
      ),
    },
    {
      title: Dashboard_data.contact_count,
      desc: (
        <TooltipFeature
          id={1}
          tooltipContent="Share your business cards with your prospects, so that they can share their contacts with you which shall automatically reflect in your People List. You may also add contacts manually by clicking the button below."
          featureText={
            <>
              Contacts added <InfoOutlinedIcon fontSize="small" />
            </>
          }
        />
      ),
      cta: (
        <>
          <AddCircleOutlineIcon fontSize="small" />
          Add new contact
        </>
      ),
    },
    {
      title: Dashboard_data.meeting_count,
      desc: (
        <TooltipFeature
          id={1}
          tooltipContent="Either you schedule a meeting by selecting the contact/contacts of interest, or share the booking link allowing them to schedule based on the availability you have set-up in your account."
          featureText={
            <>
              Meetings scheduled <InfoOutlinedIcon fontSize="small" />
            </>
          }
        />
      ),
      cta: (
        <>
          <EmailOutlinedIcon fontSize="small" />
          Share booking link
        </>
      ),
    },
    {
      title: Dashboard_data.email_count,
      desc: (
        <TooltipFeature
          id={1}
          tooltipContent="Send individual OR bulk emails to your contacts directly from NSG and get notified to your email ID you integrated."
          featureText={
            <>
              Follow-ups sent <InfoOutlinedIcon fontSize="small" />
            </>
          }
        />
      ),
      cta: (
        <>
          <ChatBubbleOutlineOutlinedIcon fontSize="small" />
          Send a follow-up
        </>
      ),
    },
  ];

  const handleShareClick = () => {
    const customShareUrl =
      "/" + advisor_data.username + "/booking";
    copy(customShareUrl);
    if (navigator.share && customShareUrl) {
      try {
        navigator.share({
          title: "Check out this link!",
          text: "Shared from NSG",
          url: customShareUrl,
        });
      } catch (error) {
        console.error("Error sharing via Web Share API:", error);
      }
    } else {
      alert(`Share this link: ${customShareUrl}`);
    }
  };

  return (
    <div className="dashboard_con">
      <div className="dashboard_header">
        <span>Dashboard</span>
      </div>
      {ToastText.show && <Toast text={ToastText.text} />}
      <h1>Make the most with 4 quick actions</h1>
      <p className="dashboard_desc">
        Help your contacts trust you faster by sharing your digital business
        card,
        <br /> scheduling meetings, and nurturing them into clients and
        customers.
      </p>
      <div className="dashboard_card">
        {Card.map((item, index) => {
          return (
            <div
              className={
                "dashboard_card_item " + (index === showText ? "shadow" : "")
              }
              key={index + "card"}
              style={{
                background:
                  index === showText ? item.text_bg_color : item.bg_color,
              }}
            >
              {index === showText ? (
                <>
                  <h2 style={{ color: item.color }}>{item.text_hedaer}</h2>
                  <h4 style={{ color: item.color }}>{item.text_desc}</h4>
                  <p>{item.text}</p>
                  <CancelOutlinedIcon
                    onClick={() => {
                      setshowText(undefined);
                    }}
                    style={{ color: item.color }}
                    className="dashboard_card_item_add"
                  />
                </>
              ) : (
                <>
                  <img src={item.img} alt="Card" />
                  <h3>{item.title}</h3>
                  <span>{item.desc}</span>
                  <button
                    onClick={() => {
                      if (index === 0) {
                        setShowShareCard(true);
                      } else if (index === 1) {
                        if (advisor_data.username) {
                          setToastText({
                            ...ToastText,
                            text: "Booking link copied successfully",
                            show: true,
                          });
                          copy(
                            "/" +
                              advisor_data.username +
                              "/booking"
                          );
                        } else {
                          navigate("/calendar");
                        }
                      } else if (index === 3) {
                        setToastText({
                          ...ToastText,
                          text: "Copied successfully",
                          show: true,
                        });
                        copy("/" + advisor_data.username);
                      } else if (index === 2) {
                        setShowGuide(true);
                      }
                    }}
                  >
                    {item.cta}
                  </button>
                  <AddCircleOutlineIcon
                    onClick={() => {
                      setshowText(index);
                    }}
                    className="dashboard_card_item_add"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      <h2>Your NSG Summary</h2>
      <p className="dashboard_desc">
        Track your key activities to see how far you’ve come and what you can do
        next with NSG.
      </p>
      <div className="summary_btn">
        {SummaryBtn.map((item, index) => {
          return (
            <button
              onClick={() => {
                setSortingData(item.id);
              }}
              className={item.id === sortingData ? "active" : ""}
              key={index}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      <div className="summary_con">
        {Summary.map((item, index) => {
          return (
            <div className="summary_item" key={index}>
              <h5>{item.title}</h5>
              <p>{item.desc}</p>
              <button
                onClick={() => {
                  if (index === 0) {
                    setShowShareCard(true);
                  } else if (index === 1) {
                    navigate("/people#add_contact");
                  } else if (index === 2) {
                    handleShareClick();
                  } else {
                    navigate("/people");
                  }
                }}
              >
                {item.cta}
              </button>
            </div>
          );
        })}
      </div>
      <Dialog
        open={showGuide}
        onClose={() => setShowGuide(false)}
        PaperProps={{
          sx: {
            margin: isMobile ? "32px 16px" : "",
          },
        }}
      >
        <DialogContent className="dashboard_popup">
          <div className="dashboard_popup_wrapper">
            <h2>How to add your email signature to your emails</h2>
            <div className="dashboard_popup_nav">
              <button
                className={activePlatform === 0 ? "acitve" : ""}
                onClick={() => setactivePlatform(0)}
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
                onClick={() => setactivePlatform(1)}
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
              {activeStep.map((item, index) => {
                return (
                  <li key={index}>
                    {item}
                    {index === 0 && activePlatform === 0 && (
                      <>
                        {!Signature && !SignatureData && (
                          <button
                            onClick={() => window.location.assign(GOOGLE_URL)}
                          >
                            Add Signature
                          </button>
                        )}
                        {SignatureData && (
                          <>
                            <div
                              style={{ display: "none" }}
                              ref={signatureRef}
                              dangerouslySetInnerHTML={{ __html: bodyContent }}
                            />
                            <button onClick={handleCopy}>Copy Signature</button>
                          </>
                        )}
                      </>
                    )}

                    {index === 0 &&
                      activePlatform === 1 &&
                      hasAdvisor_data &&
                      SignatureData && (
                        <>
                          <div
                            style={{ display: "none" }}
                            ref={signatureRef}
                            dangerouslySetInnerHTML={{ __html: bodyContent }}
                          />
                          <button onClick={handleCopy}>Copy Signature</button>
                        </>
                      )}
                  </li>
                );
              })}
            </ol>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showShareCard}
        onClose={() => {
          setShowShareCard(0);
        }}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup qr_info_popup">
          <ShareYourCard
            advisor_data={advisor_data}
            handleClose={() => {
              setShowShareCard(0);
            }}
          />
        </DialogContent>
      </Dialog>
      <CardBottomBar />
    </div>
  );
}

export default Dashboard;
