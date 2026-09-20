import axios from "axios";
import { useEffect, lazy, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import $ from "jquery";
import CheckIcon from "@mui/icons-material/Check";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import PricingCard from "../../../Components/PricingCard2/PricingCard";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import "./PricingV3.scss";
import "./PricingV3Res.scss";

const Questions = lazy(() => import("../../../Components/Questions/Questions"));
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

const bg =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Bg_graphic_2_png.webp";
function PricingV2() {
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const isUpgrade = pathname === "/account/pricing";
  const [isMonthly, setIsMonthly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [openTooltip, setOpenTooltip] = useState(null);
  const isMobile = window.innerWidth <= 576;
  const signup_data = JSON.parse(sessionStorage.getItem("signup_data"));

  const mobileTooltipProps = isMobile
    ? {
        disableFocusListener: true,
        disableHoverListener: true,
        disableTouchListener: true,
        onClose: () => setOpenTooltip(null),
      }
    : {};

  const add_sender_data = () => {
    const Abandoned = "dy7G16";
    const url = "api/feature/add_sender_data/";
    var fullName = signup_data.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const payload = {
      email: signup_data.email,
      firstname: firstName,
      lastname: lastName,
      tags: [Abandoned],
      phone: signup_data.phone ? "+1" + signup_data.phone : "",
    };
    axios
      .post(url, payload)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (axios.defaults.baseURL === "https://nsgcrm.com" && !isUpgrade) {
      mailChimp_submit();
      add_sender_data();
    }
  }, []);

  useEffect(() => {
    $(window).scrollTop(0);
  }, []);

  const handleTooltipTrigger = (id) => {
    if (openTooltip !== id) {
      setOpenTooltip(id);
    } else {
      setOpenTooltip(null);
    }
  };

  const Features = [
    {
      package: "Starter",
      amount: (
        <>
          $9 <span>/ month</span>
        </>
      ),
      cta: "Get Started",
      url: "",
    },
    {
      package: "Pro",
      amount: (
        <>
          $15 <span>/ month</span>
        </>
      ),
      cta: "Get started",
      url: "",
    },
    {
      package: "Team",
      amount: (
        <>
          $48 <span>/ month /seat</span>
        </>
      ),
      cta: "Contact us",
      url: "",
    },
  ];
  const FeaturesYearly = [
    {
      package: "Starter",
      amount: (
        <>
          $6 <span>/ month</span>
        </>
      ),
      cta: "Get Started",
      url: "",
    },
    {
      package: "Pro",
      amount: (
        <>
          $10 <span>/ month</span>
        </>
      ),
      cta: "Get started",
      url: "",
    },
    {
      package: "Team",
      amount: (
        <>
          $32 <span>/ month /seat</span>
        </>
      ),
      cta: "Contact us",
      url: "",
    },
  ];

  const mailChimp_submit = () => {
    var fullName = signup_data?.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const url = "api/mail_chimp/post_email/";
    const payload = {
      email: signup_data?.email,
      first_name: firstName,
      last_name: lastName,
      tags: ["Abandoned Cart Customers"],
    };
    axios
      .post(url, payload)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
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

  const handleMonthly = (value) => {
    setIsMonthly(value);
  };

  const RenderIconOrText = ({ value }) => {
    if (value === true) {
      return <CheckIcon className="compare_icon" />;
    }
    if (value === false) {
      return <HorizontalRuleIcon className="compare_icon_false" />;
    }
    return value;
  };

  const activePlan = isMonthly ? Features : FeaturesYearly;

  const ContactManagement = [
    {
      name: "Unlimited Leads",
      free: true,
      pro: true,
      team: true,
    },
    {
      name: "Tags, reminders, & notes",
      free: "Unlimited",
      pro: "Unlimited",
      team: "Unlimited",
    },
    {
      name: (
        <TooltipFeature
          id={1}
          tooltipContent={
            <>
              You can view all the activities for each contact in the timeline.
            </>
          }
          featureText="Timeline history"
        />
      ),
      free: "30 days",
      pro: "Unlimited",
      team: "Unlimited",
    },
    {
      name: (
        <TooltipFeature
          id={2}
          tooltipContent={
            <>
              View key insights from your networking activity, including profile
              views, leads generated, follow-up emails sent, and meetings booked
              to optimize engagement.
            </>
          }
          featureText="Insights & Analytics"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
  ];
  const Email = [
    {
      name: (
        <TooltipFeature
          id={3}
          tooltipContent={<>Send emails from nsg</>}
          featureText="Email sync (send)"
        />
      ),
      free: false,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={4}
          tooltipContent={<>Send a email to multiple contacts at once.</>}
          featureText="Send bulk email"
        />
      ),
      free: false,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={5}
          tooltipContent={
            <>
              Prevent your email accounts from exceeding the sending thresholds
              set by your email providers to safeguard your sender reputation.
            </>
          }
          featureText="Sending limits"
        />
      ),
      free: false,
      pro: true,
      team: true,
    },
  ];
  const MeetingsScheduling = [
    {
      name: (
        <TooltipFeature
          id={6}
          tooltipContent={
            <>
              Sync your calendar to automatically schedule meetings based on
              your availability.
            </>
          }
          featureText="Calendar sync"
        />
      ),
      free: false,
      pro: true,
      team: true,
    },
    {
      name: "Schedule meeting",
      free: false,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={7}
          tooltipContent={
            <>NSG will automatically remind you about upcoming meetings.</>
          }
          featureText="Meeting reminders"
        />
      ),
      free: false,
      pro: true,
      team: true,
    },
  ];
  const Integration = [
    {
      name: (
        <TooltipFeature
          id={8}
          tooltipContent={
            <>
              Operate mail & calendar from NSG, thus avoiding jumping between
              tabs.
            </>
          }
          featureText="Google, Outlook & other integration for email & calendar"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={9}
          tooltipContent={
            <>
              Set Google Meet as your primary meeting link to streamline
              scheduling
            </>
          }
          featureText="Google meet"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={10}
          tooltipContent={
            <>
              Add your Zoom, Microsoft Teams, or any other meeting link to your
              personal meeting link for a seamless scheduling experience.
            </>
          }
          featureText="Personal Meeting link"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={11}
          tooltipContent={
            <>
              Zapier integration enables all Team Plan users to securely connect
              with CRM systems and over 7,000 applications, automating their
              workflows seamlessly.
            </>
          }
          featureText="Workflow automation via Zapier "
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
  ];
  const ShareOptions = [
    {
      name: "Apple & Google wallet Pass",
      free: true,
      pro: true,
      team: true,
    },
    {
      name: "Email Signature",
      free: true,
      pro: true,
      team: true,
    },
    {
      name: "QR code",
      free: true,
      pro: true,
      team: true,
    },
    {
      name: "Profile URL",
      free: true,
      pro: true,
      team: true,
    },
    {
      name: "Email your profile",
      free: true,
      pro: true,
      team: true,
    },
  ];
  const SmartCard = [
    {
      name: "Smart business card",
      free: false,
      pro: "Add on $35",
      team: "Complimentary",
    },
    {
      name: "Metal card",
      free: false,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={12}
          tooltipContent={
            <>
              Your name & designation shall be printed in your card along with
              the QR code.
            </>
          }
          featureText="Name & designation on card"
        />
      ),
      free: false,
      pro: "Engraved",
      team: "Engraved",
    },
    {
      name: (
        <TooltipFeature
          id={13}
          tooltipContent={<>Logo of your brand shall be added to your card</>}
          featureText="Personalised logo on card"
        />
      ),
      free: false,
      pro: false,
      team: "Engraved",
    },
    {
      name: "Number of business cards",
      free: false,
      pro: "One",
      team: "Each member shall have their own",
    },
  ];
  const CustomerRelationship = [
    {
      name: "Support",
      free: "Standard support",
      pro: "Priority Support",
      team: "Priority support with Account manager",
    },
  ];
  const TeamManagement = [
    {
      name: "Number of seats",
      free: "1 (individual plan)",
      pro: "1 (individual plan)",
      team: "4 (team plan)",
    },
    {
      name: "Team profile dashboard",
      free: false,
      pro: false,
      team: true,
    },
    {
      name: "Team directory",
      free: false,
      pro: false,
      team: true,
    },
  ];

  const ProfileCustomization = [
    {
      name: (
        <>
          <TooltipFeature
            id={14}
            tooltipContent={
              <>
                You can add your own branding in the profile to create brand
                impression into your prospects mind.
              </>
            }
            featureText="Personalized branding"
          />
        </>
      ),

      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <>
          <TooltipFeature
            id={15}
            tooltipContent={
              <>
                You can use your Digital Business Card to share your profile
                with your prospects and make a stunning impression.
              </>
            }
            featureText="Lead capturing"
          />
        </>
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <>
          <TooltipFeature
            id={16}
            tooltipContent={
              <>
                Add a short video about your business offerings in your profile.
              </>
            }
            featureText="Embed video"
          />
        </>
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <>
          <TooltipFeature
            id={17}
            tooltipContent={
              <>
                Add images to add credibility about your business offerings in
                your profile.
              </>
            }
            featureText="Photo gallery"
          />
        </>
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <>
          <TooltipFeature
            id={18}
            tooltipContent={
              <>
                Add social proof to generate trust and also allow prospects to
                view more about the business offerings.
              </>
            }
            featureText="Social media links"
          />
        </>
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={19}
          tooltipContent={<>Add your own website and other important links.</>}
          featureText="Custom link"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={20}
          tooltipContent={
            <>
              Add your services to your profile to help viewers understand what
              you offer and how it can benefit them.
            </>
          }
          featureText="List Services"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
    {
      name: (
        <TooltipFeature
          id={21}
          tooltipContent={
            <>
              Gather reviews about your services or business to build trust and
              credibility.
            </>
          }
          featureText="Customer Reviews"
        />
      ),
      free: true,
      pro: true,
      team: true,
    },
  ];
  const AllFeatures = [
    {
      name: "Profile Customization",
      data: ProfileCustomization,
    },
    {
      name: "Share options",
      data: ShareOptions,
    },
    {
      name: "Lead management (CRM)",
      data: ContactManagement,
    },
    {
      name: "Email",
      data: Email,
    },
    {
      name: "Meetings + Scheduling",
      data: MeetingsScheduling,
    },
    {
      name: "Integration",
      data: Integration,
    },
    {
      name: "Smart business card (physical card)",
      data: SmartCard,
    },
    {
      name: "Customer relationship",
      data: CustomerRelationship,
    },
    {
      name: "Team management",
      data: TeamManagement,
    },
  ];
  const QuestionsData = [
    {
      id: 1,
      ques: "How does the 7-day  trial work?",
      ans: (
        <>
          {/* When you create an account on Standard or Pro, you are eligible for a
          7-day free trial. During this trial period, you will not be charged,
          and your billing cycle will begin on the 8th day from the date of
          purchase. You will have access to all features during the trial
          period. */}
           When you join our Standard or Pro plan, you’ll get a 7-day trial with full access to all features. Your billing starts on the day of purchase, but don’t worry, you’re completely protected by our 7-day money-back guarantee. If you’re not fully satisfied, you can cancel anytime within the trial and get a full refund, no questions asked
        </>
      ),
    },
    {
      id: 2,
      ques: "Which plan is best suited for a solopreneur?",
      ans: "The Pro Plan is the top choice for solopreneurs, offering all essential features to capture, manage, and convert leads efficiently. It helps streamline lead management, automate workflows, and enhance outreach, making it ideal for solo business growth.",
    },
    {
      id: 3,
      ques: "Is there a  trial or demo available?",
      ans: (
        <>
          Yes, we offer a 7-day trial for both the Starter and Pro plans. Teams
          can also schedule <br /> a demo with us through our{" "}
          <Link className="link_pricing" to="/get-demo">
            demo page.
          </Link>{" "}
        </>
      ),
    },
  ];

  return (
    <div
      className={"pricingv2_con " + (isUpgrade ? "pricingv2_con_upgrade" : "")}
    >
      <div className="pricingv2_con_hero">
        {!isUpgrade && (
          <div className="pricing_card_top">
            <HeaderLogin />
            <button onClick={() => navigate("/signup")} className="backButton">
              <ArrowBackIcon /> Back
            </button>
            <h2 className="mb-0">Choose your plan</h2>
          </div>
        )}
        <img className="bg_img" src={bg} alt="bg" loading="lazy" />
        <h1 className="pricingv2_con_hero_header">
          Great plan results in great
          <br /> networking
        </h1>
        <PricingCard handleMonthly={handleMonthly} isUpgrade={isUpgrade} />
      </div>
      <div className="pricingv2_features" id="compare_plan">
        <h2>Compare features</h2>
        <div className="pricing_card_nav">
          <button
            onClick={() => setSelectedPlan(0)}
            className={selectedPlan === 0 ? "nav_active" : ""}
          >
            Starter
          </button>
          <button
            onClick={() => setSelectedPlan(1)}
            className={selectedPlan === 1 ? "nav_active" : ""}
          >
            Pro
          </button>
          <button
            onClick={() => setSelectedPlan(2)}
            className={selectedPlan === 2 ? "nav_active" : ""}
          >
            Team
          </button>
        </div>
        <div className="pricingv2_features_plan">
          <p className="pricing_all_plan">All plans & features</p>
          {activePlan.map((item, i) => {
            return (
              <div
                className={
                  "features_plan_item " +
                  (i !== selectedPlan ? "features_plan_none" : "")
                }
                key={i}
                onClick={() => {
                  let starter_annual = "starter-annual";
                  let starter_quarterly = "starter-quarterly";
                  let pro_annual = "pro-annual";
                  let pro_quarterly = "pro-quarterly";
                  if (i === 2) {
                    window.location.assign("/contact-sales");
                  } else if (i === 0) {
                    if (!isMonthly) {
                      sessionStorage.setItem(
                        "signup_start_url",
                        starter_annual
                      );
                      if (isUpgrade) {
                        navigate("/account/checkout#" + starter_annual);
                      } else {
                        navigate("/signup/checkout#" + starter_annual);
                      }
                    } else {
                      sessionStorage.setItem(
                        "signup_start_url",
                        starter_quarterly
                      );
                      if (isUpgrade) {
                        navigate("/account/checkout#" + starter_quarterly);
                      } else {
                        navigate("/signup/checkout#" + starter_quarterly);
                      }
                    }
                  } else if (i === 1) {
                    if (!isMonthly) {
                      sessionStorage.setItem("signup_start_url", pro_annual);
                      if (isUpgrade) {
                        navigate("/account/checkout#" + pro_annual);
                      } else {
                        navigate("/signup/checkout#" + pro_annual);
                      }
                    } else {
                      sessionStorage.setItem("signup_start_url", pro_quarterly);
                      if (isUpgrade) {
                        navigate("/account/checkout#" + pro_quarterly);
                      } else {
                        navigate("/signup/checkout#" + pro_quarterly);
                      }
                    }
                  }
                }}
              >
                <p>{item.package}</p>
                <h5>{item.amount}</h5>
                <button
                  disabled={i === 0 && isUpgrade}
                  className={i === 1 ? "cta-btn" : "btn-secondary-outline"}
                >
                  {item.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {AllFeatures.map((feature, i) => {
        return (
          <div key={i + "feature"} className="pricingv2_features_compare">
            <h5>{feature.name}</h5>
            <div className="compare_item_wrapper">
              {feature.data.map((item, index) => {
                return (
                  <div
                    className="pricingv2_compare_item"
                    key={index + "compare_item"}
                  >
                    <span>{item.name}</span>
                    <span
                      className={selectedPlan !== 0 ? "compare_item_none" : ""}
                    >
                      <RenderIconOrText value={item.free} />
                    </span>
                    <span
                      className={selectedPlan !== 1 ? "compare_item_none" : ""}
                    >
                      <RenderIconOrText value={item.pro} />
                    </span>
                    <span
                      className={selectedPlan !== 2 ? "compare_item_none" : ""}
                    >
                      <RenderIconOrText value={item.team} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <Questions Questions={QuestionsData} />
    </div>
  );
}

export default PricingV2;
