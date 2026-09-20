import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import "./PricingCard.scss";

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

const info_icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M7.9987 11.334C8.18759 11.334 8.34592 11.2701 8.4737 11.1423C8.60148 11.0145 8.66536 10.8562 8.66536 10.6673V8.00065C8.66536 7.81176 8.60148 7.65343 8.4737 7.52565C8.34592 7.39787 8.18759 7.33398 7.9987 7.33398C7.80981 7.33398 7.65148 7.39787 7.5237 7.52565C7.39592 7.65343 7.33203 7.81176 7.33203 8.00065V10.6673C7.33203 10.8562 7.39592 11.0145 7.5237 11.1423C7.65148 11.2701 7.80981 11.334 7.9987 11.334ZM7.9987 6.00065C8.18759 6.00065 8.34592 5.93676 8.4737 5.80898C8.60148 5.68121 8.66536 5.52287 8.66536 5.33398C8.66536 5.1451 8.60148 4.98676 8.4737 4.85898C8.34592 4.73121 8.18759 4.66732 7.9987 4.66732C7.80981 4.66732 7.65148 4.73121 7.5237 4.85898C7.39592 4.98676 7.33203 5.1451 7.33203 5.33398C7.33203 5.52287 7.39592 5.68121 7.5237 5.80898C7.65148 5.93676 7.80981 6.00065 7.9987 6.00065ZM7.9987 14.6673C7.07648 14.6673 6.20981 14.4923 5.3987 14.1423C4.58759 13.7923 3.88203 13.3173 3.28203 12.7173C2.68203 12.1173 2.20703 11.4118 1.85703 10.6007C1.50703 9.78954 1.33203 8.92287 1.33203 8.00065C1.33203 7.07843 1.50703 6.21176 1.85703 5.40065C2.20703 4.58954 2.68203 3.88398 3.28203 3.28398C3.88203 2.68398 4.58759 2.20898 5.3987 1.85898C6.20981 1.50898 7.07648 1.33398 7.9987 1.33398C8.92092 1.33398 9.78759 1.50898 10.5987 1.85898C11.4098 2.20898 12.1154 2.68398 12.7154 3.28398C13.3154 3.88398 13.7904 4.58954 14.1404 5.40065C14.4904 6.21176 14.6654 7.07843 14.6654 8.00065C14.6654 8.92287 14.4904 9.78954 14.1404 10.6007C13.7904 11.4118 13.3154 12.1173 12.7154 12.7173C12.1154 13.3173 11.4098 13.7923 10.5987 14.1423C9.78759 14.4923 8.92092 14.6673 7.9987 14.6673ZM7.9987 13.334C9.48759 13.334 10.7487 12.8173 11.782 11.784C12.8154 10.7507 13.332 9.48954 13.332 8.00065C13.332 6.51176 12.8154 5.25065 11.782 4.21732C10.7487 3.18398 9.48759 2.66732 7.9987 2.66732C6.50981 2.66732 5.2487 3.18398 4.21536 4.21732C3.18203 5.25065 2.66536 6.51176 2.66536 8.00065C2.66536 9.48954 3.18203 10.7507 4.21536 11.784C5.2487 12.8173 6.50981 13.334 7.9987 13.334Z"
      fill="black"
    />
  </svg>
);

function PricingCard(props) {
  const navigate = useNavigate();
  const [isMonthly, setIsMonthly] = useState(false);
  const [activePlan, setActivePlan] = useState(0);
  const [openTooltip, setOpenTooltip] = useState(null);
  const isMobile = window.innerWidth <= 576;
  const mobileTooltipProps = isMobile
    ? {
        disableFocusListener: true,
        disableHoverListener: true,
        disableTouchListener: true,
        onClose: () => setOpenTooltip(null),
      }
    : {};

  const handleTooltipTrigger = (id) => {
    if (openTooltip !== id) {
      setOpenTooltip(id);
    } else {
      setOpenTooltip(null);
    }
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

  const Pricing = [
    {
      price: (
        <>
          $9 <span>/month</span>
        </>
      ),
      discount: <>Billed $27 quarterly</>,
      status: "For individual",
      cta: props.isUpgrade ? "Current plan" : "Start Your 7 Days  Trial",
      title: "Starter",
      features: [
        <TooltipFeature
          id={1}
          tooltipContent={
            <>
              You can use Digital Business Card to <br />
              share your profile with your prospects.
            </>
          }
          featureText="Digital Business Card"
        />,
        <TooltipFeature
          id={2}
          tooltipContent={
            <>
              Add your digital signature to every email to stand out and
              maintain a consistent professional touch in your communications.
            </>
          }
          featureText="Email Signature"
        />,
        <TooltipFeature
          id={3}
          tooltipContent={
            <>
              All leads are captured in NSG’s contact management system when
              a prospect shares their contact via a digital business card, books
              a meeting from your profile, or is manually added for tracking and
              management.
            </>
          }
          featureText="Lead Capture & Management"
        />,

        "Insights & Analytics",
        <TooltipFeature
          id={4}
          tooltipContent={
            <>
              Zapier integration securely connects NSG with your workflow,
              enabling seamless automation across 7,000+ applications for
              enhanced efficiency.
            </>
          }
          featureText="7000+ Integrations with Zapier"
        />,
      ],
    },
    {
      price: (
        <>
          $15 <span>/month</span>
        </>
      ),
      discount: <>Billed $45 quarterly</>,
      status: "For power users",
      cta: "Start Your 7 Days  Trial",
      title: "Pro",
      features: [
        "Everything in Starter Plan, Plus",
        <TooltipFeature
          id={5}
          tooltipContent={
            <>
              You can send emails to your leads, helping you drive business
              growth effectively.
            </>
          }
          featureText="Built-in Email"
        />,
        <TooltipFeature
          id={6}
          tooltipContent={
            <>
              Sync your calendar to automatically schedule meetings based on
              your availability, whether within contact management or as a
              standalone tool for booking with leads.
            </>
          }
          featureText="Schedule Meetings"
        />,
        <TooltipFeature
          id={7}
          tooltipContent={
            <>
              You can view all the activities for each contact added from Day 1
            </>
          }
          featureText="Unlimited Lead History"
        />,
        <TooltipFeature
          id={8}
          tooltipContent={
            <>You may avail our Smart business card made of metal at USD 35$.</>
          }
          featureText="Smart Metal Business Card (Add On)"
        />,
      ],
    },
    {
      price: (
        <>
          $48 <span>/month /seat</span>
        </>
      ),
      discount: <>Billed $144 quarterly</>,
      status: "For small teams",
      cta: "Contact us",
      title: "Team",
      features: [
        "Everything in Pro Plan, Plus",
        <TooltipFeature
          id={9}
          tooltipContent={
            <>
              Team profile dashboard provides the admin to manage team members
              and also get an overview of the activities of the team.
            </>
          }
          featureText="Team profile dashboard"
        />,
        "Add up to 4 team members to your account",
        <TooltipFeature
          id={10}
          tooltipContent={
            <>
              Get complimentary Smart business card made of metal for every team
              member.
            </>
          }
          featureText="Smart Metal Business Card (complimentary)"
        />,
      ],
    },
  ];

  const PricingYearly = [
    {
      price: (
        <>
          $6 <span>/month</span>
        </>
      ),
      discount: (
        <>
          billed <span>$108</span> $72 / year
        </>
      ),
      status: "For individual",
      cta: props.isUpgrade ? "Current plan" : "Start Your 7 Days  Trial",
      title: "Starter",
      features: [
        <TooltipFeature
          id={11}
          tooltipContent={
            <>
              You can use Digital Business Card to <br />
              share your profile with your prospects.
            </>
          }
          featureText="Digital Business Card"
        />,
        <TooltipFeature
          id={12}
          tooltipContent={
            <>
              Add your digital signature to every email to stand out and
              maintain a consistent professional touch in your communications.
            </>
          }
          featureText="Email Signature"
        />,
        <TooltipFeature
          id={13}
          tooltipContent={
            <>
              All leads are captured in NSG’s contact management system when
              a prospect shares their contact via a digital business card, books
              a meeting from your profile, or is manually added for tracking and
              management.
            </>
          }
          featureText="Lead Capture & Management"
        />,

        "Insights & Analytics",
        <TooltipFeature
          id={14}
          tooltipContent={
            <>
              Zapier integration securely connects NSG with your workflow,
              enabling seamless automation across 7,000+ applications for
              enhanced efficiency.
            </>
          }
          featureText="7000+ Integrations with Zapier"
        />,
      ],
    },
    {
      price: (
        <>
          $10 <span>/month</span>
        </>
      ),
      discount: (
        <>
          billed <span>$180</span> $120 / year
        </>
      ),
      status: "For power users",
      cta: "Start Your 7 Days  Trial",
      title: "Pro",
      features: [
        "Everything in Starter Plan, Plus",
        <TooltipFeature
          id={15}
          tooltipContent={
            <>
              You can send emails to your leads, helping you drive business
              growth effectively.
            </>
          }
          featureText="Built-in Email"
        />,
        <TooltipFeature
          id={16}
          tooltipContent={
            <>
              Sync your calendar to automatically schedule meetings based on
              your availability, whether within contact management or as a
              standalone tool for booking with leads.
            </>
          }
          featureText="Schedule Meetings"
        />,
        <TooltipFeature
          id={17}
          tooltipContent={
            <>
              You can view all the activities for each contact added from Day 1
            </>
          }
          featureText="Unlimited Lead History"
        />,
        <TooltipFeature
          id={18}
          tooltipContent={
            <>You may avail our Smart business card made of metal at USD 35$.</>
          }
          featureText="Smart Metal Business Card (Add On)"
        />,
      ],
    },
    {
      price: (
        <>
          $32 <span>/month /seat</span>
        </>
      ),
      discount: (
        <>
          billed <span>$576</span> $384 / year
        </>
      ),
      status: "For small teams",
      cta: "Contact us",
      title: "Team",
      features: [
        "Everything in Pro Plan, Plus",
        <TooltipFeature
          id={19}
          tooltipContent={
            <>
              Team profile dashboard provides the admin to manage team members
              and also get an overview of the activities of the team.
            </>
          }
          featureText="Team profile dashboard"
        />,
        "Add up to 4 team members to your account",
        <TooltipFeature
          id={20}
          tooltipContent={
            <>
              Get complimentary Smart business card made of metal for every team
              member.
            </>
          }
          featureText="Smart Metal Business Card (complimentary)"
        />,
      ],
    },
  ];

  let activeData = isMonthly ? Pricing : PricingYearly;

  useEffect(() => {
    props.handleMonthly(isMonthly);
  }, [isMonthly]);

  return (
    <div className="pricing_card_con2">
      <div className="pricing_card_btn_wrapper">
        <div className="pricing_card_btn">
          <button
            onClick={() => {
              setIsMonthly(false);
              setOpenTooltip(null);
            }}
            className={!isMonthly ? "active_btn" : ""}
          >
            Yearly (saving 33%)
          </button>
          <button
            className={isMonthly ? "active_btn" : ""}
            onClick={() => {
              setIsMonthly(true);
              setOpenTooltip(null);
            }}
          >
            Quarterly
          </button>
        </div>
      </div>
      <div className="pricing_card_wrapper_top">
        <div className="pricing_options">
          <span>All prices are in USD</span>
          <div className="pricing_options_line"></div>
          <TooltipFeature
            id={21}
            tooltipContent={
              <>
              

            All Starter, Pro, and Team plans include a 7-day trial. You can cancel anytime within those 7 days and get a full money-back guarantee.
              </>
            }
            featureText="7-days  trial"
          />
        </div>
        <div className="pricing_card_wrapper">
          <div className="pricing_card_nav">
            <button
              onClick={() => setActivePlan(0)}
              className={activePlan === 0 ? "nav_active" : ""}
            >
              Starter
            </button>
            <button
              onClick={() => setActivePlan(1)}
              className={activePlan === 1 ? "nav_active" : ""}
            >
              Pro
            </button>
            <button
              onClick={() => setActivePlan(2)}
              className={activePlan === 2 ? "nav_active" : ""}
            >
              Team
            </button>
          </div>
          {activeData.map((item, index) => {
            return (
              <div
                className={
                  "pricing_card " +
                  (index !== activePlan ? "pricing_card_none" : "")
                }
                key={index + "pricing"}
              >
                <h5>
                  {item.title} {index === 1 && <span>Most popular</span>}{" "}
                </h5>
                <span style={{ minHeight: 20, maxHeight: 20 }}>
                  {item.status}
                </span>
                <h3>{item.price}</h3>
                <p>{item.discount}</p>
                <button
                  disabled={index === 0 && props.isUpgrade}
                  onClick={() => {
                    let starter_annual = "starter-annual";
                    let starter_quarterly = "starter-quarterly";
                    let pro_annual = "pro-annual";
                    let pro_quarterly = "pro-quarterly";
                    if (index === 2) {
                      window.location.assign(
                        "/contact-sales"
                      );
                    } else if (index === 0) {
                      if (!isMonthly) {
                        sessionStorage.setItem(
                          "signup_start_url",
                          starter_annual
                        );
                        if (props.isUpgrade) {
                          navigate("/account/checkout#" + starter_annual);
                        } else {
                          navigate("/signup/checkout#" + starter_annual);
                        }
                      } else {
                        sessionStorage.setItem(
                          "signup_start_url",
                          starter_quarterly
                        );
                        if (props.isUpgrade) {
                          navigate("/account/checkout#" + starter_quarterly);
                        } else {
                          navigate("/signup/checkout#" + starter_quarterly);
                        }
                      }
                      // navigate("/signup/domain");
                    } else if (index === 1) {
                      if (!isMonthly) {
                        sessionStorage.setItem("signup_start_url", pro_annual);
                        if (props.isUpgrade) {
                          navigate("/account/checkout#" + pro_annual);
                        } else {
                          navigate("/signup/checkout#" + pro_annual);
                        }
                      } else {
                        sessionStorage.setItem(
                          "signup_start_url",
                          pro_quarterly
                        );
                        if (props.isUpgrade) {
                          navigate("/account/checkout#" + pro_quarterly);
                        } else {
                          navigate("/signup/checkout#" + pro_quarterly);
                        }
                      }
                    }
                  }}
                  className={index === 1 ? "cta-btn" : "btn-secondary-outline"}
                >
                  {item.cta}
                </button>
                <ul className="pricing_card_list">
                  {item.features.map((feature, i) => {
                    return (
                      <li className={i === 0 ? "everything_text" : ""} key={i}>
                        {feature}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <div
          className={
            "pricing_plan " + (activePlan !== 2 ? "pricing_plan_none" : "")
          }
        >
          <div>
            <h5>Enterprise plan</h5>
            <p>For teams of more than 20 members</p>
          </div>
          <button
            onClick={() => navigate("/contact-sales")}
            className="btn-secondary-outline"
          >
            Contact us
          </button>
        </div>
        <button
          onClick={() => {
            const homeSection = document.getElementById("compare_plan");
            homeSection.scrollIntoView({ behavior: "smooth" });
          }}
          className="btn-secondary-outline compare_btn"
        >
          Compare features <ArrowDropDownIcon />
        </button>
      </div>
    </div>
  );
}

export default PricingCard;
