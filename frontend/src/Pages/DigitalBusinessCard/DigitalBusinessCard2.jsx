import  { lazy } from "react";
import CountdownTimer from "../../Components/CountdownTimer/CountdownTimer";
import "./CardLandingPage.scss";
import "./ResCardLandingPage.scss";
import "./LandingPages.scss";
import "./DigitalBusinessCard.scss";

const SavingSection = lazy(() =>
  import("../../Components/SavingSection/SavingSection")
);
const SinglePricing = lazy(() =>
  import("../../Components/SinglePricing/SinglePricing")
);
const TrustedCompany = lazy(() =>
  import("../../Components/TrustedCompany/TrustedCompany")
);
const ResFooter = lazy(() => import("../../Components/CADFooter/ResFooter"));

const UserReview = lazy(() =>
  import("../../Components/UserReviewSmart/UserReviewSmart")
);
const VideoSection = lazy(() =>
  import("../../Components/VideoSection2/VideoSection")
);
const Networking = lazy(() =>
  import("../../Components/NetworkingV2/Networking")
);
const MaximizeInteraction = lazy(() =>
  import("../../Components/MasterContacts/MaximizeInteraction")
);
const PricingFeatures = lazy(() =>
  import("../../Components/PricingFeatures/PricingFeatures")
);
const OurPromise = lazy(() =>
  import("../../Components/OurPromise/OurPromise.jsx")
);


const max_data = [
  {
    title: "100%",
    tag: "Contacts Capture",
    desc: "Capture all the in-person interactions directly to the system with NSG Digital Business Card. ",
  },
  {
    title: "5X",
    tag: "Faster Follow-Ups",
    desc: "With group and personalized email options at your fingertips, you follow-up at just the right time.",
  },
  {
    title: "1-3 hr",
    tag: "Per Week Saved",
    desc: "Automate consolidating important information, eliminating the need for multiple tools.",
  },
  {
    title: "4X",
    tag: "Lead Capture",
    desc: "Increase the number of leads you capture with quick contact exchange.",
  },
];

function DigitalBusinessCard(props) {

  return (
    <div
      id="smart_card_video"
      className="business_card_home_con digital_business_card"
    >
      <TrustedCompany />
      {props.isSecondary && (
        <>
          <MaximizeInteraction data={max_data} />
          <PricingFeatures
            title="Great Plan Results in Great Networking"
            desc="Trusted by hundreds of professionals, businesses and their teams."
            hideCard={props.Meta1 ? true : false}
            isMetaPricing={props.Meta1 ? true : false}
            showAllHover={true}
          />
          <div className="meta_signup_header_timer meta_signup_header_timer3">
            <p className="timer_desc">
              50% Off for the First 100 Accounts! Hurry!
            </p>
            <CountdownTimer isSecondary={props.Meta1 ? false : true} />
          </div>
        </>
      )}
      <UserReview />
      <VideoSection
        title={
          props.Meta1 ? (
            <>
              Unlock <span>Efficiency & Productivity</span>
            </>
          ) : (
            <>
              NSG’s Best
              <br /> Digital Business
              <br /> Cards
            </>
          )
        }
        desc="NSG brings together everything you need for in-person meetings. Connecting, managing, and nurturing contacts—while combining the functionality of a business card with smart contact management. This all-in-one solution boosts your efficiency by:"
        cta={"Select the Best Plan for You"}
        video_desc="Play the video to learn more about our best Business Card"
      />
      <SavingSection isSecondary={props.isSecondary} />
      {!props.isSecondary && <SinglePricing />}

      <OurPromise />
      <Networking
        title={
          <>
            Elevate your <br />
            connections
          </>
        }
        desc={
          <>
            Revolutionize networking with the custom digital
            <br /> business card. Ditch the traditional card andl
            <br /> elevate your networking game today!
          </>
        }
        cta="Get Started today"
        img="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_r8rocr_png.webp"
        imgMb="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_r8rocr_png.webp"
        alt=" Elevate your connections with nsg digital business card"
      />
      <ResFooter />
    </div>
  );
}

export default DigitalBusinessCard;
