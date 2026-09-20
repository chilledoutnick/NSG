import  { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import "./PricingFeatures.scss";

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

const PricingFeatures = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  const [activePlan, setActivePlan] = useState("yearly");
  const [openTooltip, setOpenTooltip] = useState(null);
  const isMetaPricing = props.isMetaPricing;
  const tabRefs = useRef([]);
  const underlineRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("meta_plan", "yearly");
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const planIndex = ["quarterly", "yearly", "monthly"].indexOf(activePlan);
      const activeTab = tabRefs.current[planIndex];
      if (activeTab && underlineRef.current) {
        underlineRef.current.style.width = `${activeTab.offsetWidth}px`;
        underlineRef.current.style.left = `${activeTab.offsetLeft}px`;
      }
    }, 0);


    return () => clearTimeout(timeout);
  }, [activePlan]);  
 

  const mobileTooltipProps = isMobile
    ? {
        disableFocusListener: true,
        disableHoverListener: true,
        disableTouchListener: true,
        onClose: () => setOpenTooltip(null),
      }
    : {};

  const handleTooltipTrigger = (id) => {
    setOpenTooltip(openTooltip !== id ? id : null);
  };

  const isTooltipOpen = (id) => (isMobile ? openTooltip === id : undefined);

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

  const featuresData1 = [
    <TooltipFeature
      id={6}
      tooltipContent="You can use Digital Business Card to share your profile with your prospects."
      featureText="Digital business card"
    />,
    <TooltipFeature
      id={9}
      featureText="Built-in CRM"
      tooltipContent="Store unlimited networking leads in the built-in CRM to streamline follow-up emails and schedule meetings efficiently. "
    />,
    <TooltipFeature
      id={3}
      tooltipContent="Add unlimited tags, reminders, & notes for your contacts."
      featureText="Tags, reminders, & notes"
    />,
    <TooltipFeature
      id={4}
      tooltipContent="Send unlimited emails & schedule meetings with your contacts."
      featureText="Email & Schedule meetings"
    />,
    <TooltipFeature
      id={10}
      tooltipContent="View all activities for each contact added from Day 1."
      featureText="Unlimited activity history"
    />,
    <TooltipFeature
      id={12}
      tooltipContent="Get standard support for troubleshooting any problem you face."
      featureText="Standard support"
    />,
  ];

  const featuresData2 = [
    <TooltipFeature
      id={6}
      tooltipContent="You can use Digital Business Card to share your profile with your prospects."
      featureText="Digital business card"
    />,
    <TooltipFeature
      id={9}
      featureText="Built-in CRM"
      tooltipContent="Store unlimited networking leads in the built-in CRM to streamline follow-up emails and schedule meetings efficiently. "
    />,
    <TooltipFeature
      id={12}
      tooltipContent="Get priority support for troubleshooting any problem you face."
      featureText="Priority support"
    />,
  ];
  const featuresFinalData = props.showAllHover ? featuresData1 : featuresData2;

  const Pricing = [
    {
      price: (
        <>
          <span>$45</span>$30
          <span className="dayprice">($0.33/day)</span>
        </>
      ),
      discount: "Charges will apply . Cancel anytime within  7 days Money-Back Guarantee",
      cta: "Start Your 7 days Trial",
      title: "Quarterly",
      url: "/signup/quarterly",
      features: featuresFinalData,
    },
    {
      price: (
        <>
          <span>$180</span> $90
          <span className="dayprice">($0.25/day)</span>
        </>
      ),
      discount: "Charges will apply . Cancel anytime within  7 days Money-Back Guarantee",
      cta: "Start Your 7 days Trial",
      title: "Yearly",
      url: "/signup/metasignup",
      features: featuresFinalData,
    },
    {
      price: isMetaPricing ? (
        <>
          <span>$315</span>$220
          <span className="dayprice">(No Monthly Fees)</span>
        </>
      ) : (
        "$10"
      ),
      discount: "Charges will apply . Cancel anytime within  7 days Money-Back Guarantee",
      cta: "Start Creating Your Account",
      title: isMetaPricing ? "Lifetime" : "Monthly",
      url: isMetaPricing ? "/signup/lifetime" : "/signup/monthly",
      features: featuresFinalData,
    },
  ];

 


  return (
    <div className="pricing_features_con">
      <div className="pricing_features_header">
        <div>
          <h2>
            Your networking
            <br /> leads Deserve
            <br /> better. <span>So do you.</span>
          </h2>
          <p>
            NSG replaces paper business cards with
            <br /> digital card, helping you capture leads in
            <br /> real-time and nurture them with smart
            <br /> NSG CRM.
          </p>
        </div>
        <img
          src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/wafwafwafwawcw_png.webp"
          alt="networking"
        />
      </div>
      {props.title && <h2 style={{ marginBottom: 8 }}>{props.title}</h2>}
      {props.desc && <p className="pricing_features_desc">{props.desc}</p>}
      {isMobile && (
        <div className="toggle-buttons">
          <button
            ref={(el) => (tabRefs.current[0] = el)}
            className={`toggle-btn ${
              activePlan === "quarterly" ? "active" : ""
            }`}
            onClick={() => {
              setActivePlan("quarterly");
              sessionStorage.setItem("meta_plan", "quarterly");
            }}
          >
            Quarterly
          </button>
          <button
            ref={(el) => (tabRefs.current[1] = el)}
            className={`toggle-btn ${activePlan === "yearly" ? "active" : ""}`}
            onClick={() => {
              setActivePlan("yearly");
              sessionStorage.setItem("meta_plan", "yearly");
            }}
          >
            Yearly
          </button>
          <button
            ref={(el) => (tabRefs.current[2] = el)}
            className={`toggle-btn ${activePlan === "monthly" ? "active" : ""}`}
            onClick={() => {
              setActivePlan("monthly");
              sessionStorage.setItem("meta_plan", "lifetime");
            }}
          >
            {isMetaPricing ? "Lifetime" : "Monthly"}
          </button>
          <div className="underline" ref={underlineRef}></div>
        </div>
      )}
      <div className="pricing_card_wrapper">
        <span className="pricing_card_currency">All prices are in USD</span>
        {Pricing.map((item, index) => {
          const planType =
            index === 0 ? "quarterly" : index === 1 ? "yearly" : "monthly";
          if (isMobile && activePlan !== planType) {
            return null; // Hide the non-active plan on mobile
          }
          return (
            <div className="pricing_card" key={index + "pricing"}>
              <h5>
                {item.title} {index === 1 && <span>Limited Time 50% Off</span>}
              </h5>
              <h3>{item.price}</h3>
              <p>{item.discount}</p>
              {!props.hideCta && (
                <Link
                  to={item.url}
                  onClick={() => {
                    sessionStorage.setItem(
                      "meta_plan",
                      item.title.toLowerCase() === "lifetime"
                        ? "lifetime"
                        : item.title.toLowerCase()
                    );
                  }}
                  className={index === 1 ? "cta-btn" : "btn-secondary-outline"}
                >
                  {item.cta}
                </Link>
              )}
              <ul className="pricing_card_list">
                {item.features.map((feature, i) => (
                  <li className={i === 0 ? "everything_text" : ""} key={i}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <br />
      {!props.hideCard && (
        <div className="pricing_card discover_card">
          <div className="discover_content">
            <h3>Discover How It Fits Your Sales Process</h3>
            <p>
              Unsure if it’s the right fit? Let’s chat—schedule a call to
              explore
              <br />
              how it works for you.
            </p>
          </div>
          <br />
          <a
            href="https://calendly.com/nikhil-nsg/30min"
            className="btn-outline"
          >
            Book A Demo
          </a>
        </div>
      )}

      <br />
    </div>
  );
};

export default PricingFeatures;
