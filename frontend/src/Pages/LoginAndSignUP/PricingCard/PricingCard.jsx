import  { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import "./PricingCard.scss";


const grapics =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003352_png_CNUtW8N.webp";
const grapics2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/sqsq_png.webp";
const checkbox =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Isolation_Mode_1_png.webp";
const cardBg =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/card_bttom_png.webp";
const cardBg2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1321315933_himons_png.webp";

function PricingCard() {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const navigate = useNavigate();
  const [isMonthly, setIsMonthly] = useState(false);
  const PricingMonthly = [
    {
      price: "$6.99",
      period: "per month",
      status: "PERSONAL",
      cta: "Select Personal Plan",
      title: "NSG Core features:",
      url: "/signup/monthly",
      features: [
        "7-days trial",
        "NSG Signature Card",
        "Digital Business Card",
        "Customized profile",
        "Unlimited contacts/mo",
        "Lead management",
        "Scheduling system",
      ],
    },
    {
      price: "$16.59",
      period: "per month",
      status: "PRO",
      cta: "Coming Soon",
      title: "Everything in Personal, Plus:",
      features: [
        "7-days trial",
        "Automate Communication",
        "Data Insights & Suggestions",
        "Priority Support",
      ],
    },
    {
      price: "Let’s Chat!",
      period: "",
      status: "TEAM",
      cta: "Contact Us",
      title: "Every Core feature, Plus:",
      features: [
        "Team Admin Account",
        "Zapier Integration",
        "Dedicated Success Management",
      ],
    },
  ];

  const PricingYearly = [
    {
      price: "$5.75",
      period: "per month",
      status: "PERSONAL",
      cta: "Select Personal Plan",
      title: "NSG Core features:",
      url: "/signup/annual",
      features: [
        "7-days trial",
        "Premium Smart Card",
        "Digital Business Card",
        "Customized profile",
        "Unlimited contacts/mo",
        "Lead management",
        "Scheduling system",
      ],
    },
    {
      price: "$12.45",
      period: "per month",
      status: "PRO",
      cta: "Coming Soon",
      title: "Everything in Personal, Plus:",
      features: [
        "7-days trial",
        "Automate Communication",
        "Data Insights & Suggestions",
        "Priority Support",
      ],
    },
    {
      price: "Let’s Chat!",
      period: "",
      status: "TEAM",
      cta: "Contact Us",
      title: "Every Core feature, Plus:",
      features: [
        "Team Admin Account",
        "Zapier Integration",
        "Dedicated Success Management",
      ],
    },
  ];

  let activeData = isMonthly ? PricingMonthly : PricingYearly;

  return (
    <div className="pricing_card_con">
      <div className="pricing_card_top_wrapper">
        <div className="pricing_card_top">
          <HeaderLogin />
          <button onClick={() => navigate("/signup")} className="backButton">
            <ArrowBackIcon /> Back
          </button>
          <h2>Choose your plan</h2>
          <p>
            Whether you're looking to streamline your personal networking
            efforts, unlock advanced features, or empower your entire team, we
            have a plan for you.
          </p>
        </div>
        <div className="pricing_card_btn_wrapper">
          <div className="pricing_card_btn">
            <button
              onClick={() => setIsMonthly(true)}
              className={isMonthly ? "active_btn" : ""}
            >
              Pay Monthly
            </button>
            <button
              className={!isMonthly ? "active_btn" : ""}
              onClick={() => setIsMonthly(false)}
            >
              Pay Annually
            </button>
          </div>
        </div>
        <div className="pricing_card_wrapper">
          {activeData.map((item, index) => {
            return (
              <div className="pricing_card" key={index + "pricing"}>
                <div className={"pricing_card_inner pricing_card" + index}>
                  <h5>{item.status}</h5>
                  <div className="price_wrapper">
                    <h3>{item.price}</h3>
                    <span>{item.period}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (index === 2) {
                        window.open("/get-demo");
                      } else if (index === 0) {
                        if (!isMonthly) {
                          navigate("/signup/checkout#annual");
                        } else {
                          navigate("/signup/checkout#monthly");
                        }
                      }
                    }}
                    className={index === 1 ? "btn-disabled" : "btn-primary"}
                  >
                    {item.cta}
                  </button>
                  <img
                    src={index === 0 ? grapics : grapics2}
                    alt="grapics"
                    className="grapics"
                  />
                </div>
                <div className="pricing_card_list">
                  <h5>{item.title}</h5>
                  {item.features.map((feature, index) => {
                    return (
                      <p key={"feature" + index}>
                        <img src={checkbox} alt="checkbox" loading="lazy" />
                        {feature}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="about_join_business">
        <LazyLoadImage
          src={isMobile ? cardBg2 : cardBg}
          wrapperClassName="about_join_img"
          effect="blur"
          alt="Take networking to the next level with nsg smart business card"
        />
        <div className="about_join_right">
          <h5>Limited time offer</h5>
          <h3>
            NSG Premium Smart
            <br /> Card at No Extra Cost
          </h3>
          <p>
            Unlock the future of networking with our annual package. Get the
            NSG Premium Smart Card, engraved with your name and designation,
            at no extra shipping cost.
          </p>
          <button onClick={() => navigate("/signup")}>
            <span>Get Started today</span>
            <ArrowRightAltIcon className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingCard;
