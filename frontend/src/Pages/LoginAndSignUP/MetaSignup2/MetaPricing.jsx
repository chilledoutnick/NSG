import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaPricingCard from "./MetaPricingCard";
import "./MetaSignup3.scss";

const TrustedCompany = lazy(() =>
  import("../../../Components/TrustedCompany/TrustedCompany")
);
const UserReviewSmart = lazy(() =>
  import("../../../Components/UserReviewSmart/UserReviewSmart")
);
const MaximizeInteraction = lazy(() =>
  import("../../../Components/MasterContacts/MaximizeInteraction")
);
const Questions = lazy(() => import("../../../Components/Questions/Questions"));

const max_data = [
  {
    title: "100%",
    tag: "Leads Capture",
    desc: "Capture all the in-person leads directly to the system with NSG Digital Business Card. ",
  },
  {
    title: "5X",
    tag: "Faster Follow-Ups",
    desc: "Increase your impact through targeted group and personalized email follow-ups.",
  },
  {
    title: "2X",
    tag: "Discovery Calls Booked",
    desc: "NSG users are experiencing higher booking rates, driving more business effortlessly!",
  },
  {
    title: "1-3 hr",
    tag: "Per Week Saved",
    desc: "Integrate NSG into your workflow to automatically consolidate your leads",
  },
];

const QuestionsData = [
  {
    id: 1,
    ques: "What features do I get with each plan?",
    ans: (
      <>
        Every plan includes a digital business card, booking system, and
        built-in CRM—giving you all the tools you need to effortlessly capture,
        manage, and convert leads.
      </>
    ),
  },
  {
    id: 2,
    ques: "What happens after the 7-day  trial?",
    ans: (
      <>
        After your 7-day trial, you’ll not be able to get money-back guarantee. During your trial, you can upgrade, downgrade ,cancel or change
        your plan at any time—no hassle. We offer 7days money-back guarantee.
      </>
    ),
  },
  {
    id: 3,
    ques: "How can I cancel?",
    ans: (
      <>
        You can cancel your account anytime by contacting our support team. If
        NSG isn’t the right fit for your sales process, just let us know and
        we’ll handle the rest—no questions asked.
        <br />
        <br />
        Email: <a href="mailto:nikhil@nsgcrm.com">nikhil@nsgcrm.com</a>
        <br />
        Phone: <a href="tel:+16056050394">+1 605 605 0394</a>
      </>
    ),
  },
  {
    id: 4,
    ques: "How do I contact support if I have questions?",
    ans: (
      <>
        Our friendly support team is available 7 days a week, from 9 AM to 5 PM
        to assist you. You can always find our contact details on our website,
        in your dashboard, and right here:
        <br />
        <br />
        Email: <a href="mailto:nikhil@nsgcrm.com">nikhil@nsgcrm.com</a>
        <br />
        Phone: <a href="tel:+16056050394">+1 605 605 0394</a>
      </>
    ),
  },
  {
    id: 5,
    ques: "Are there any hidden fees or extra costs?",
    ans: (
      <>
        No, there are absolutely no hidden fees. The price you see is the price
        you pay for your chosen plan.
      </>
    ),
  },
  {
    id: 6,
    ques: "Is my data secure and private?",
    ans: (
      <>
        Yes, your privacy and data security are our top priorities. NSG uses
        GCP cloud services and complies with global privacy standards, including
        ISO 27017 (cloud security), ISO 27701 (privacy management), and ISO
        27018 (cloud privacy). We do not store any credit card or banking
        information.
      </>
    ),
  },
];

function MetaPricing() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  let meta_plan = sessionStorage.getItem("meta_plan") === "lifetime";


  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m} : ${s}`;
  };

  return (
    <div className="meta_pricing">
      <div className="meta_pricing_header">
        <img
          src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1_png_DSjkWEw.webp"
          alt="NSG"
          className="meta_logo"
        />
        <button>
          50% discount reserve for: <span>{formatTime(timeLeft)}</span>
        </button>
      </div>
      <div className="meta_signup3_button">
        <button
          onClick={() =>
            navigate("/signup/checkout#metasignup", {
              state: { meta_coupon: "50OFFNSG" },
            })
          }
          className="cta-btn shiny_button"
        >
          {meta_plan
            ? "Start Creating Your Account"
            : "Start Your 7 Days  Trial"}
        </button>
      </div>
      <MetaPricingCard />
      <TrustedCompany
        title={
          <>
            <span>Join 1500+ Professionals</span>
            <br />
            Growing Their Business
            <br /> with NSG
          </>
        }
      />
      <UserReviewSmart hideDesc={true} />
      <MaximizeInteraction
        title={
          <>
            <span>Proven Results:</span> Effortlessly capture leads and turn
            them into opportunities
          </>
        }
        data={max_data}
      />
      <Questions Questions={QuestionsData} />
    </div>
  );
}

export default MetaPricing;
