import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import copy from "copy-to-clipboard";
import moment from "moment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./Referral.scss";
import "./ReferralRes.scss";

const heroImg =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000004277_png.webp";
const dynamic_card_bg =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Perk_hub_empty_state_png.webp";
const dynamic_card_bg_mobile =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000004263_png.webp";

function Referral() {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [activeTab, setActiveTab] = useState(1);
  const [InviteLink, setInviteLink] = useState("");
  const [details, setDetails] = useState([]);
  const [copyClicked, setCopyClicked] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const copyContent = `Hey! I am sharing a free month of NSG with you!\n\nNSG helps you grow your business by unlocking seamless networking and relationship management, all in one smart digital card.\n\nUse my referral link to sign up and get your first month free: ${InviteLink}.\nHurry, the offer expires in 7 days!\n\nCheck out this video to see NSG in action: /smart-business-card`;

  const features = [
    {
      title: "$20 Amazon gift card + One free month per referral",
      desc: "Get a $20 Amazon gift card and a free month added to your subscription per referral. More you refer, more gift cards & free months you win.",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Creative_02_png.webp",
    },
    {
      title: "A free month for your friend",
      desc: "Your friend will be eligible for NSG’s all-in-one CRM software with personalized business card for a month without paying a single penny.",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/sports_and_fitness___meditation_zen_meditate_yoga_woman_people_activity_hobby_png.webp",
    },
  ];

  const Questions = [
    {
      id: 1,
      ques: "How many friends can I refer?",
      ans: "You can refer as many friends as you can. There is no upper limit to the number of referrals.",
    },
    {
      id: 2,
      ques: "How many months do I get for free?",
      ans: "One month for one referral. Also, a $20 Amazon gift card per referral.",
    },
    {
      id: 3,
      ques: "Will I be notified about my free months?",
      ans: "Once your friend signed up using the referral link, you shall be notified through email that you have earned a month. Also, you can view your earned months in the Referral page.",
    },
    {
      id: 4,
      ques: "When can I use my free month if I have an annual subscription?",
      ans: (
        <>
          No matter whether your subscription is month-basis or annual, free
          months will become effective only after the current subscription ends.
          <br />
          For example, if you have an annual subscription which ends in July,
          your free months will be effective from the month of August.
        </>
      ),
    },
    {
      id: 5,
      ques: "What kind of benefits my friend gets?",
      ans: "Your friend can enjoy NSG’s all-in-one platform for a month without paying a single penny.",
    },
  ];

  useEffect(() => {
    generate_referral_code_api();
    count_referrals();
  }, []);

  const generate_referral_code_api = () => {
    const url = "api/refer/generate_referral_code_api/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setInviteLink("/signup/" + res.data.referral_code);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const count_referrals = () => {
    const url = "api/refer/count_referral_subscription/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setDetails(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  const handleShareClick = () => {
    if (navigator.share && InviteLink) {
      try {
        navigator.share({
          title: "Check out this link!",
          text: copyContent,
        });
      } catch (error) {
        console.error("Error sharing via Web Share API:", error);
      }
    } else {
      alert(`Share this link: ${InviteLink}`);
    }
  };

  return (
    <>
      <BottomBar />
      <div className="referral_con">
        <div className="referral_hero">
          <div className="referral_hero_left">
            <h5>Hurry! Referrals ending soon!</h5>
            <h2>
              Refer to earn a $20 Amazon gift card & <br />a free month
            </h2>
            <span>
              Share the link to refer <ArrowDownwardIcon fontSize="small" />{" "}
            </span>
            <button onClick={handleShareClick} className="referral_hero_link">
              {InviteLink}
            </button>
            <div className="referral_hero_left_btns">
              <button
                onClick={() => {
                  copy(copyContent);
                  setCopyClicked(true);
                  setTimeout(() => {
                    setCopyClicked(false);
                  }, 2000);
                }}
                className={"btn-primary " + (copyClicked ? "btn-clicked" : "")}
              >
                <ContentCopyIcon fontSize="small" />
                {copyClicked ? (
                  <>
                    <span>Referral </span>link copied!
                  </>
                ) : (
                  <>
                    Copy <span>referral</span> link
                  </>
                )}
              </button>
              <button onClick={handleShareClick} className="btn-primary">
                <IosShareIcon fontSize="small" /> Share link
              </button>
            </div>
          </div>
          <div className="referral_hero_img_wrapper">
            <LazyLoadImage
              alt="User"
              effect="blur"
              src={heroImg}
              wrapperClassName="referral_hero_img"
            />
          </div>
        </div>
        <div className="referral_dynamic_card">
          <LazyLoadImage
            alt="User"
            effect="blur"
            src={isMobile ? dynamic_card_bg_mobile : dynamic_card_bg}
            wrapperClassName="referral_dynamic_card_bg"
          />
          <div className="referral_dynamic_card_left">
            <h2
              style={
                details.unrewarded_referrals_count === 0
                  ? { color: "#cf0d0d" }
                  : undefined
              }
            >
              {details.unrewarded_referrals_count}
            </h2>
            <h5>Free months earned</h5>
          </div>

          <p>
            View your free months here. <br />
            {details.subscription_end_date ? (
              <>
                Your subscription will expire on{" "}
                {moment(details.subscription_end_date).format("MMMM DD, YYYY")}.
              </>
            ) : (
              "Enjoy NSG and network effectively."
            )}
          </p>
        </div>
        <div className="referral_features">
          <h2 className="referral_header">What’s in for you?</h2>
          <div className="referral_features_wrapper">
            {features.map((item, index) => {
              return (
                <div
                  className="referral_features_item"
                  key={index + "features"}
                >
                  <LazyLoadImage
                    alt="User"
                    effect="blur"
                    src={item.img}
                    wrapperClassName="referral_features_item_img"
                  />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="referring_step">
          <h2 className="referral_header">
            Referring a friend has never been so easy
          </h2>
          <div className="referring_step_wrapper">
            <div className="referring_step_card">
              <h5>Option A</h5>
              <div className="referring_step_card_item">
                <h3>Step 1</h3>
                <p>Copy the referral link by clicking “Copy link”.</p>
              </div>
              <div className="referring_step_card_item">
                <h3>Step 2</h3>
                <p>Send the copied link to your friend.</p>
              </div>
            </div>
            <span className="or_divider">
              <span className="line"></span>OR
              <span className="line"></span>
            </span>
            <div className="referring_step_card">
              <h5>Option B</h5>
              <div className="referring_step_card_item">
                <h3>Step 1</h3>
                <p>
                  Share the referral link directly to your friend by clicking
                  “Share link”.
                </p>
              </div>
              <div className="referring_step_card_item">
                <h3>Step 2</h3>
                <p>
                  Let your friend open the link in any browser and sign up to
                  enjoy the referral benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="referring_questions">
          <h2 className="referral_header">Frequently Asked Questions</h2>
          {Questions.map((item, index) => {
            return (
              <div
                key={index + "ques"}
                className={
                  "ques_wrapper " +
                  (activeTab === item.id ? "ques_wrapper_active" : "")
                }
              >
                <button
                  className={
                    "ques_tbns " + (activeTab === item.id ? "active" : "")
                  }
                  onClick={() => {
                    if (activeTab === item.id) {
                      setActiveTab(0);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <h4>
                    {item.ques}
                    <KeyboardArrowDownIcon className="icon" fontSize="large" />
                  </h4>
                </button>
                <div
                  className={
                    "ans_con " + (activeTab === item.id ? "active_ans" : "")
                  }
                >
                  <p>{item.ans}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Referral;
