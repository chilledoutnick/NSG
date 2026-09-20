import React, { useState, useEffect, useRef } from "react";
import "./UserProfile.scss";
import "./UserProfileRes.scss";
import moment from "moment/moment";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { ThreeDots } from "react-loader-spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSkeleton from "../ProfileSkeleton";
import { ProfileText } from "../../../utils/TextData/ProfileText.tsx";
import { LazyLoadImage } from "react-lazy-load-image-component";

//icons
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Service from "../../../Components/Service/ServiceList";
import Booking from "../../../Components/BookingPopup/Booking";
import Review from "../../../Components/Reviews/Review";
import "./UserProfile.scss";
import "./UserProfileRes.scss";
import swal from "sweetalert";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function TemplateThree() {
  const username = window.location.pathname.split("/")[1];
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get("preview") === "true";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [InitialLoading, setInitialLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [error, setError] = useState("");
  const [vCardData, setVCardData] = useState(null);
  const [advisor, setAdvisor] = useState({});
  const [showExchangeContact, setShowExchangeContact] = useState(false);
  const [showSaveContact, setShowSaveContact] = useState(false);
  const [showReceiveCard, setShowReceiveCard] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [AllLinks, setAllLinks] = useState([]);
  const [LayoutOrder, setLayoutOrder] = useState([]);
  const [SocialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    substack: "",
  });
  const [EmailId, setEmailId] = useState("");
  const [Name, setName] = useState("");
  const [Logo, setLogo] = useState("");
  const [showFull, setShowFull] = useState("");
  const isLong = advisor.about?.length > 300;
  const [showAppointmentSection, setShowAppointmentSection] = useState("");
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const toggleReadMore = () => setShowFull(!showFull);
  const imageContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [contactDetails, setContactDetails] = useState({
    email: "",
    name: "",
    phone: "",
    timestamp: moment().format("YYYY-MM-DD"),
    username: username,
  });

  const [video, setVideo] = useState({
    title: "",
    video_link: "",
  });

  const [Gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    get_advisor_by_user_name();
    get_advisor();
    getGallery();
    get_logo();
    get_advisor_social_media();
    getLayoutOrder();
  }, []);
  const getLayoutOrder = async () => {
    try {
      const res = await axios.post("/api/profile_layout/get_layout/", {
        username,
      });
      if (Array.isArray(res.data)) {
        setLayoutOrder(res.data);
      } else {
        setLayoutOrder([]);
      }
    } catch (err) {
      console.error("Failed to load layout order:", err);
      setLayoutOrder([]);
    }
  };

  const save_profile_visit = () => {
    const url = "/api/dashboard/save_profile_visit/";
    axios
      .post(url, { username: username })
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    if (isMobile) {
      handleTriggerExchangeContact();
    }
  }, [isMobile]);

  useEffect(() => {
    if (username) {
      get_card();
      getVideo();
      getLinks();
    }
  }, [username]);

  const get_advisor_by_user_name = () => {
    const get_advisorUrl = "/api/user_profile/get_user_by_user_name/";
    const get_advisorPayload = {
      username: username,
    };
    axios
      .post(get_advisorUrl, get_advisorPayload)
      .then((res) => {
        save_profile_visit(res.data.username);
        get_refresh_token(res.data.username);
        if (res.data.message === "user not found!") {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const get_refresh_token = (id) => {
    const url = "api/user/get_access_token/";
    const payload = {
      username: username,
    };
    axios
      .post(url, payload)
      .then((res) => {
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        setShowAppointmentSection(google || outlook || other);
      })
      .catch((err) => console.log("err", err));
  };

  const get_advisor_social_media = () => {
    const url = "api/user_profile/get_user_social_media/";
    const payload = {
      username: username,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setSocialLinks({
          instagram: res.data.instagram || "",
          facebook: res.data.facebook || "",
          linkedin: res.data.linkedin || "",
          twitter: res.data.twitter || "",
          tiktok: res.data.tiktok || "",
          youtube: res.data.youtube || "",
          substack: res.data.substack || "",
        });
      })
      .catch(() => {
        setSocialLinks({
          instagram: "",
          facebook: "",
          linkedin: "",
          twitter: "",
          tiktok: "",
          youtube: "",
          substack: "",
        });
        setLoading(false);
      });
  };

  const getLinks = () => {
    const url = "api/profile/get_links/";
    axios
      .post(url, { username: username })
      .then((res) => {
        setAllLinks(res.data.links);
      })
      .catch((err) => console.log("err"));
  };

  const getGallery = () => {
    const url = "api/profile_gallery/get_gallery/";
    axios
      .post(url, { username })
      .then((res) => {
        const images = res.data || [];
        setGallery(images.map((img) => img.profile_picture).filter(Boolean));
      })
      .catch((err) => console.log("err", err));
  };

  const getVideo = async () => {
    try {
      const { data } = await axios.post("api/user/get_video_link/", {
        username,
      });
      const linkData = data.links?.[0];
      if (!linkData) return;

      let videoSrc = "";
      let isYouTube = false;

      if (linkData.video_link) {
        const videoID = extractVideoID(linkData.video_link);
        if (videoID) {
          videoSrc = `https://www.youtube.com/embed/${videoID}`;
          isYouTube = true;
        }
      }

      if (!videoSrc && linkData.video) videoSrc = linkData.video;

      setVideo({
        video_link: videoSrc,
        title: linkData.Video_title || "",
        isYouTube,
      });
    } catch (err) {
      console.error("Error fetching video:", err);
    }
  };

  const extractVideoID = (url) => {
    try {
      const regExp =
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/;
      const match = url.match(regExp);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };
  const getEmbedUrl = (url) => {
    if (!url) return "";
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const get_advisor = () => {
    axios
      .post("/api/user_profile/get_user/", { username: username })
      .then((res) => {
        setAdvisor(res.data);

        if (res.data?.name) {

         const name = res.data.name || "";
const designation = res.data.Designation || "";
const company = res.data.company || "";

const dynamicTitle = `${name}${designation ? " - " + designation : ""}${
  company ? " at " + company : ""
} | NSG`;

document.title = dynamicTitle;

          const metaDescription = document.querySelector(
            'meta[name="description"]',
          );

          const descriptionContent = `${res.data.name}'s official digital profile on NSG. View contact details, social media links, company information and connect instantly.`;

          let keywordsTag = document.querySelector('meta[name="keywords"]');

          const keywordsContent = `
  ${res.data.name},
  ${res.data.name} profile,
  ${res.data.name} digital business card,
  ${res.data.name} contact details,
  ${res.data.name} professional profile,
  NSG profile ${res.data.name}
  `;

          if (keywordsTag) {
            keywordsTag.setAttribute("content", keywordsContent);
          } else {
            const meta = document.createElement("meta");
            meta.name = "keywords";
            meta.content = keywordsContent;
            document.head.appendChild(meta);
          }

          if (metaDescription) {
            metaDescription.setAttribute("content", descriptionContent);
          } else {
            const meta = document.createElement("meta");
            meta.name = "description";
            meta.content = descriptionContent;
            document.head.appendChild(meta);
          }

          const ogTitle = document.querySelector('meta[property="og:title"]');
          const ogUrl = document.querySelector('meta[property="og:url"]');
          const ogType = document.querySelector('meta[property="og:type"]');

          const profileUrl = `/${username}`;

          if (ogTitle) {
         ogTitle.setAttribute("content", dynamicTitle);
          } else {
            const meta = document.createElement("meta");
            meta.setAttribute("property", "og:title");
            meta.setAttribute(
              "content",
              `${res.data.name} – Digital Business Card | NSG`,
            );
            document.head.appendChild(meta);
          }

          if (ogUrl) {
            ogUrl.setAttribute("content", profileUrl);
          } else {
            const meta = document.createElement("meta");
            meta.setAttribute("property", "og:url");
            meta.setAttribute("content", profileUrl);
            document.head.appendChild(meta);
          }

          if (ogType) {
            ogType.setAttribute("content", "profile");
          } else {
            const meta = document.createElement("meta");
            meta.setAttribute("property", "og:type");
            meta.setAttribute("content", "profile");
            document.head.appendChild(meta);
          }

          const canonicalUrl = `/${username}`;

          let canonicalTag = document.querySelector("link[rel='canonical']");

          if (canonicalTag) {
            canonicalTag.setAttribute("href", canonicalUrl);
          } else {
            canonicalTag = document.createElement("link");
            canonicalTag.setAttribute("rel", "canonical");
            canonicalTag.setAttribute("href", canonicalUrl);
            document.head.appendChild(canonicalTag);
          }
        }

        const ogDescription = document.querySelector(
  'meta[property="og:description"]'
);

const desc = `${res.data.name}'s digital profile on NSG. Connect and explore details.`;

if (ogDescription) {
  ogDescription.setAttribute("content", desc);
} else {
  const meta = document.createElement("meta");
  meta.setAttribute("property", "og:description");
  meta.setAttribute("content", desc);
  document.head.appendChild(meta);
}

  

        const schema = {
          "@context": "https://schema.org",
          "@type": "Person",

          name: res.data.name,

          url: `/${username}`,

          description: `${res.data.name}'s official digital profile on NSG. Connect and view contact details.`,

          image: res.data.profile_picture || "",

          jobTitle: res.data.Designation || "",

          worksFor: {
            "@type": "Organization",
            name: res.data.company || "",
          },

          sameAs: [
            res.data.linkedin,
            res.data.instagram,
            res.data.facebook,
            res.data.twitter,
          ].filter(Boolean),

          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `/${username}`,
          },

          identifier: username,

          knowsAbout: [
            "Digital Profile",
            "Professional Networking",
            "Online Contact Card",
            res.data.Designation,
          ].filter(Boolean),
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(schema);

        document.head.appendChild(script);
        setInitialLoading(false);
      })
      .catch((err) => {
        setInitialLoading(false);
        console.log("err", err);
      });
  };
  const totalImages = Gallery ? Gallery.length : 0;

  const getStepWidth = () => {
    const container = imageContainerRef.current;
    if (container && container.children.length > 1) {
      const firstCard = container.children[0];
      const secondCard = container.children[1];
      return secondCard.offsetLeft - firstCard.offsetLeft;
    }
    const cardElement = container?.querySelector(".featured_img_items");
    return (cardElement?.offsetWidth || 0) + 12;
  };

  const scrollLeft = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      imageContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (currentPage < totalImages) {
      const newPage = currentPage + 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      imageContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const get_logo = () => {
    const url = "api/logo/get_logo/";
    const payload = {
      username: username,
    };
    axios
      .post(url, payload)
      .then((res) => setLogo(res.data.logo))
      .catch((err) => console.log("err", err));
  };

  const handleDownloadVCard = () => {
    if (vCardData) {
      const blob = new Blob([vCardData], { type: "text/vcard" });
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "contact.vcf";
      downloadLink.target = "_blank";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }
  };

  const get_card = () => {
    const requestBody = {
      username: username,
      website: "/" + username,
    };
    fetch(axios.defaults.baseURL + "/api/digital_card/vcard/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.text())
      .then((data) => setVCardData(data))
      .catch((error) => {
        console.error("Error fetching vCard data:", error);
      });
  };

  const exchangeContact = () => {
    setLoading(true);
    const url = "api/exchange_contact/create_exchange_contact/";
    const payload = {
      email: contactDetails.email,
      name: contactDetails.name,
      phone: contactDetails.phone,
      comment: contactDetails.comment,
      username: username,
    };
    axios
      .post(url, payload)
      .then(() => {
        setLoading(false);
        setError("");
        setShowSaveContact(true);
        setShowExchangeContact(false);
        setShowReceiveCard(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response.data.message);
      });
  };

  const handleReceiveCard = () => {
    setLoading(true);
    const url = "api/digital_card/receive_card/";
    const payaload = {
      receiver_email: EmailId,
      receiver_name: Name,
      username: username,
    };
    axios
      .post(url, payaload)
      .then((res) => {
        setLoading(false);
        setShowCardPopup(true);
        setShowReceiveCard(false);
        setShowSaveContact(false);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.message,
          icon: "warning",
          buttons: true,
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (advisor.profile_picture !== undefined) {
      if (ogImageTag) {
        ogImageTag.setAttribute("content", advisor.profile_picture);
      } else {
        const newOgImageTag = document.createElement("meta");
        newOgImageTag.setAttribute("property", "og:image");
        newOgImageTag.setAttribute("content", advisor.profile_picture);
        document.head.appendChild(newOgImageTag);
      }
    }
  }, [advisor]);

  const handleTriggerExchangeContact = () => {
    setTimeout(() => {
      if (!showExchangeContact) {
        setShowExchangeContact(true);
        setShowBooking(false);
      }
    }, 4000);
  };

  const handleHidePopup = () => {
    setShowBooking(true);
  };

  const openImage = (src) => {
    setSelectedImage(src);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  if (InitialLoading) {
    return <ProfileSkeleton />;
  }
  const sectionComponents = {
    Service: advisor?.is_service ? (
      <div className="tm3-service">
        <Service advisor={advisor} username={username} />
      </div>
    ) : (
      <></>
    ),
    ProfileVideo:
      video?.video_link && advisor?.is_feature_video ? (
        <>
          <div className="video-wrapper">
            <div className="video-header">
              <h3>Featured Video</h3>
            </div>
            <div className="video-container">
              {video.isYouTube ? (
                <iframe
                  width="100%"
                  height="315"
                  src={getEmbedUrl(video.video_link)}
                  title={video.title || "YouTube video player"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{
                    borderRadius: 10,
                    display: "block",
                    maxWidth: "100%",
                  }}
                />
              ) : (
                <video controls width="100%" style={{ borderRadius: 10 }} >
                  <source src={video.video_link} type="video/mp4" />
                 
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </>
      ) : (
        <></>
      ),

    FeaturedImages:
      advisor?.is_feature_images && Gallery.length > 0 ? (
        <div className="tm3-gallery">
          <h3>Featured Images</h3>

          <div className="gallery_con" ref={imageContainerRef}>
            {Gallery.map((photo, index) => (
              <div className="gallery_img_wrapper">
                <img
                  key={index}
                  src={photo}
                  alt="gallery"
                  loading="lazy"
                  onClick={() => openImage(photo)}
                  className="gallery-img"
                />
              </div>
            ))}
          </div>
          <div className="profile_nav">
            <span>
              {totalImages > 0 ? `${currentPage}/${totalImages}` : ""}
            </span>

            <div>
              <button onClick={scrollLeft} disabled={currentPage === 1}>
                <KeyboardArrowLeftIcon />
              </button>
              <button
                onClick={scrollRight}
                disabled={currentPage === totalImages}
              >
                <KeyboardArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      ),
    OtherLinks:
      advisor?.is_links && (AllLinks?.length ?? 0) > 0 ? (
        <div className="tm3-links">
          <h3>Links</h3>
          <div className="links-con">
            {AllLinks.map((item, index) => {
              return (
                <button
                  key={index + "links"}
                  onClick={() => window.open(item.link)}
                >
                  <img
                    src={ProfileText.img.linksIcon}
                    alt="links"
                    loading="lazy"
                  />
                  <div>
                    <h5>{item.title}</h5>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <></>
      ),

    ProfileReview: advisor?.is_review ? (
      <Review advisor={advisor} is_review={advisor?.is_review} />
    ) : (
      <></>
    ),
  };

  return (
    <div className="template-three-con">
      <div className="tm3-hero">
        <div
          className="bg"
          style={{ backgroundColor: advisor.background_colour }}
        >
          <LazyLoadImage
            alt="bg"
            src={
              "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003352_png.webp"
            }
            effect="blur"
            wrapperClassName="bg_inner"
          />
        </div>

        <div className="tm3-user-info">
          <h2>
            {advisor?.wlcm_message?.heading || "Welcome aboard"}
            <img
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/waving-hand_png_99iRi4R.webp"
              alt="hand"
              loading="lazy"
            />
          </h2>
          <p>
            {advisor?.wlcm_message?.subheading
              ? advisor.wlcm_message.subheading.split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
              : "Explore my profile, reach out for inquiries or collaborations. Let's connect!"}
          </p>
        </div>
      </div>
      <div className="tm3-bottom-contant-wrapper">
        <div className="tm3-user-wrapper">
          <div className="tm3-user">
            <div className="tm3-user-img">
              <LazyLoadImage
                alt="bg"
                src={
                  advisor.profile_picture !== ""
                    ? advisor.profile_picture
                    : ProfileText.img.profilePlacholder
                }
                effect="blur"
                placeholderSrc={ProfileText.img.userPH}
                className="img_class"
                height={"100%"}
                width={"100%"}
              />
            </div>
            <div className="tm3-name">
              <h1>{advisor.name}</h1>
              {advisor.Designation !== "null" && <p>{advisor.Designation}</p>}
              <p className="mt-1">
                {advisor.company !== null ? advisor.company : ""}
              </p>
              <img
                src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Mask_group_png.webp"
                alt="bg"
                loading="lazy"
                className="bg_img"
              />
              {Logo !== "" && (
                <img
                  className="tm3_company_logo"
                  src={Logo}
                  alt="Company"
                  loading="lazy"
                />
              )}
            </div>
          </div>
          <div className="tm3-about-btn">
            <button
              className="btn-outline"
              onClick={() => {
                setShowReceiveCard(false);
                setShowSaveContact(true);
              }}
            >
              Save
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setShowBooking(false);
                setShowExchangeContact(true);
              }}
            >
              <FileUploadOutlinedIcon /> Exchange
            </button>
          </div>
        </div>
        <div className="tm3-bottom-contant">
          {advisor.about !== "" && (
            <div
              style={showFull ? { minHeight: 225 } : {}}
              className="tm3-about"
            >
              <h3>About</h3>
              <p>
                {showFull || !isLong
                  ? advisor.about
                  : `${advisor.about.substring(0, 300)}...`}
              </p>
              {isLong && (
                <button onClick={toggleReadMore}>
                  {showFull ? "Read less..." : "Read more..."}
                </button>
              )}
            </div>
          )}
          <Booking
            advisor={advisor}
            handleHidePopup={handleHidePopup}
            showAppointmentSection={showAppointmentSection}
          />
          <div className="tm3-social">
            {SocialLinks?.instagram !== "" ||
            SocialLinks?.facebook !== "" ||
            SocialLinks?.linkedin !== "" ||
            SocialLinks?.twitter !== "" ||
            SocialLinks?.substack !== "" ||
            SocialLinks?.tiktok !== "" ? (
              <h3>Social links</h3>
            ) : (
              ""
            )}
            <div className="social-con">
              {SocialLinks.instagram !== "" && (
                <button onClick={() => window.open(SocialLinks.instagram)}>
                  <img
                    src={ProfileText.img.instagram_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
              {SocialLinks.facebook !== "" && (
                <button onClick={() => window.open(SocialLinks.facebook)}>
                  <img
                    src={ProfileText.img.facebook_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
              {SocialLinks.linkedin !== "" && (
                <button onClick={() => window.open(SocialLinks.linkedin)}>
                  <img
                    src={ProfileText.img.linkedin_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
              {SocialLinks.twitter !== "" && (
                <button onClick={() => window.open(SocialLinks.twitter)}>
                  <img
                    src={ProfileText.img.twitter_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
              {SocialLinks.tiktok !== "" && (
                <button onClick={() => window.open(SocialLinks.tiktok)}>
                  <img
                    src={ProfileText.img.tiktok_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
              {SocialLinks.youtube !== "" && (
                <button onClick={() => window.open(SocialLinks.youtube)}>
                  <img
                    src={ProfileText.img.youtube_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
              {SocialLinks.substack !== "" && (
                <button onClick={() => window.open(SocialLinks.substack)}>
                  <img
                    src={ProfileText.img.substack_icon}
                    alt="social icon"
                    loading="lazy"
                  />
                </button>
              )}
            </div>
          </div>

          {LayoutOrder.map((section) => (
            <React.Fragment key={section}>
              {sectionComponents[section]}
            </React.Fragment>
          ))}

          {selectedImage && (
            <div className="image-modal" onClick={closeImage}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-btn" onClick={closeImage}>
                  <CloseIcon fontSize="small" />
                </button>
                <img src={selectedImage} alt="enlarged" />
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={showExchangeContact && !showBooking && !isPreview}
        onClose={() => setShowExchangeContact(false)}
        maxWidth={false}
        TransitionComponent={Transition}
        transitionDuration={500}
      >
        <DialogContent className="tm3_contact_popup">
          <div className="contact_popup_content">
            <div className="popup_content_nav">
              <button
                onClick={() => {
                  setShowExchangeContact(false);
                }}
              >
                <KeyboardBackspaceIcon />
              </button>
              <button
                onClick={() => {
                  setShowExchangeContact(false);
                }}
              >
                <ClearIcon />
              </button>
            </div>
            <h2>
              <span>Share</span> your contact
              <br />
              information with {advisor.name}
            </h2>
            <div className="popup_form">
              <input
                className="review-popup-input"
                value={contactDetails.name}
                onChange={(e) =>
                  setContactDetails({
                    ...contactDetails,
                    name: e.target.value,
                  })
                }
                placeholder="Name"
              />
              <input
                value={contactDetails.email}
                className="review-popup-input"
                onChange={(e) =>
                  setContactDetails({
                    ...contactDetails,
                    email: e.target.value,
                  })
                }
                placeholder="Email ID"
              />
              <input
                value={contactDetails.phone}
                className="review-popup-input"
                onChange={(e) =>
                  setContactDetails({
                    ...contactDetails,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone Number"
              />
              {error && <p className="error_text">{error}</p>}

              <button
                onClick={() => {
                  exchangeContact();
                }}
                className="btn-primary"
              >
                {!loading ? (
                  "Send"
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
              <span className="exchange_desc">
                Upon sending, you consent to being contacted by {advisor.name}.
                Read our
                <button
                  onClick={() => window.open("/privacy")}
                >
                  privacy policy
                </button>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showSaveContact}
        onClose={() => setShowSaveContact(false)}
        maxWidth={false}
        TransitionComponent={Transition}
        transitionDuration={500}
      >
        <DialogContent className="tm3_contact_popup">
          <div className="tm3_contact_popup">
            <div className="contact_popup_content">
              <div className="popup_content_nav">
                <button
                  onClick={() => {
                    if (showReceiveCard) {
                      setShowReceiveCard(false);
                    } else {
                      setShowSaveContact(false);
                    }
                  }}
                >
                  <KeyboardBackspaceIcon />
                </button>
                <button
                  onClick={() => {
                    setShowSaveContact(false);
                  }}
                >
                  <ClearIcon />
                </button>
              </div>
              {!showReceiveCard ? (
                <h2 style={{ marginBottom: 30 }}>
                  Scroll down to
                  <br />
                  <span>Create New Contact</span>
                </h2>
              ) : (
                <h2>
                  Receive card via <span>email</span>
                </h2>
              )}
              {!showReceiveCard ? (
                <div className="save_contact_content">
                  <LazyLoadImage
                    alt="bgImage"
                    src={ProfileText.img.bgImage}
                    effect="blur"
                    placeholderSrc={ProfileText.img.bgImagePlc}
                    className="save_contact_content_img"
                  />
                  <button
                    style={{ marginTop: 10 }}
                    className="btn-primary"
                    onClick={() => {
                      handleDownloadVCard();
                    }}
                  >
                    Save to contacts
                  </button>
                  <button
                    onClick={() => setShowReceiveCard(true)}
                    className="btn_receive"
                  >
                    Receive card via email <ArrowForwardIcon fontSize="small" />
                  </button>
                </div>
              ) : (
                <div className="receive_contact_content">
                  <input
                    value={Name}
                    placeholder="Enter your Name"
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4"
                  />
                  <input
                    value={EmailId}
                    placeholder="Enter your email id"
                    onChange={(e) => setEmailId(e.target.value)}
                  />
                  <button
                    className="btn-primary mb-3"
                    onClick={() => {
                      handleReceiveCard();
                    }}
                  >
                    {!loading ? (
                      "Send"
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
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showCardPopup}
        onClose={() => setShowCardPopup(false)}
        maxWidth={false}
        TransitionComponent={Transition}
        transitionDuration={500}
      >
        <DialogContent className="tm3_contact_popup">
          <div className="contact_popup_content">
            <div className="popup_content_nav">
              <button></button>
              <button
                onClick={() => {
                  setShowCardPopup(false);
                }}
              >
                <ClearIcon />
              </button>
            </div>
            <h2>
              Get NSG to <span>create digital business card</span> and
              network smarter
            </h2>
            <div className="card_contact_content">
              <LazyLoadImage
                alt="bgImage"
                src={ProfileText.img.bgImage2}
                effect="blur"
                placeholderSrc={ProfileText.img.bgImage2PH}
                className="card_contact_content_img"
              />
              <button
                className="btn-primary mt-2"
                onClick={() => {
                  setShowCardPopup(false);
                  window.open("/");
                }}
              >
                Start Your Trial
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateThree;
