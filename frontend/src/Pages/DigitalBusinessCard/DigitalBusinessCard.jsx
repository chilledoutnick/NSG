import  { lazy, useEffect } from "react";
import $ from "jquery";
import CountdownTimer from "../../Components/CountdownTimer/CountdownTimer";
import OurPromise from "../../Components/OurPromise/OurPromise";
import "./CardLandingPage.scss";
import "./ResCardLandingPage.scss";
import "./LandingPages.scss";
import "./DigitalBusinessCard.scss";

const CardBenefits = lazy(() =>
  import("../../Components/CardBenefits2/CardBenefits")
);
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


const data = [
  {
    id: 1,
    title: "Create a Memorable First Impression",
    tag: "Digital Presence",
    alt: "Personalize Your Digital Presence with nsg",
    icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/atm_png_n4XNzyR.webp",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1321315926_png.webp",
    cta: "Learn More about the customized Profile",
    link: "/virtual-business-card",
    options: [
      <>
        <b>Showcase your brand instantly</b> with a mini website, customized
        with your logo, colors and your brand.
      </>,
      <>
        <b>Boost credibility</b> with a personalized domain that makes you easy
        to remember.
      </>,
      <>
        <b>Engage effectively</b> using interactive content like images, videos,
        and links.
      </>,
    ],
  },
  {
    id: 2,
    title: "Capture Leads Anywhere & In Any Setting",
    tag: "Network",
    alt: "Share Your Digital Business Card and Capture Leads with nsg",
    icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/text-flow-rows_png_0AH4keW.webp",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Share_Contacts-02_1_png.webp",
    cta: "Learn More about business card with QR",
    link: "/digital-business-card-with-qr-code",
    options: [
      <>
        <b>Collect leads</b> by sharing your digital business card via QR code
        or Apple & Google Wallet card.
      </>,
      <>
        <b>Easily collect contacts in any setting,</b> including virtual events,
        by sending your card through a link or email.
      </>,

      <>
        <b>Connect with your network</b> by adding your profile link to bios,
        group chats, or email signatures to drive referral growth.
      </>,
    ],
  },
  {
    id: 3,
    title: "Simplify and Streamline Lead Management",
    tag: "Lead Management",
    alt: " Streamline Leads with Smart Contact Management where you can capture all the contact interaction",
    icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/square_png_fTAKyCC.webp",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/wafwafwafwawcw_png.webp",
    cta: "Explore Smart Contact Management",
    link: "/smart-contact-management",
    options: [
      <>
        <b>Automatically organize leads</b> with tags and priorities, ensuring
        you stay on top of your follow-ups.
      </>,
      <>
        <b>Store all lead details and notes</b> in one place for a 360-degree
        view of your connections.
      </>,
      <>
        <b>Sync NSG with your CRM to automate workflows</b> and manage team
        leads.
      </>,
    ],
  },
  {
    id: 4,
    title: "Enhance Your Follow-Ups and Close More Leads",
    tag: "Build Relationship",
    alt: " Enhance Your Follow-Ups and reminder Close More Leads with nsg",
    icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/square_png_fTAKyCC.webp",
    img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_335_png.webp",
    cta: "Learn More",
    link: "/smart-contact-management",
    options: [
      <>
        <b>Set reminders to ensure timely follow-ups</b> and never miss an
        important action.
      </>,
      <>
        <b>Send follow-up emails directly</b> from NSG to stay engaged with
        leads.
      </>,
      <>
        <b>Close more deals by booking meetings</b> and efficiently moving leads
        through your sales funnel.
      </>,
    ],
  },
];

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
  useEffect(() => {
    $(window).scrollTop(0);
  }, []);

  return (
    <div
      id="smart_card_video"
      className="business_card_home_con digital_business_card"
    >
      <TrustedCompany />
      {props.isSecondary && (
        <>
          <div className="meta_signup_header_timer meta_signup_header_timer3">
            <p className="timer_desc">
              50% Off For The First
              <br /> 100 Accounts! Hurry!
            </p>
            <br />
            <CountdownTimer isSecondary={true} />
          </div>
          <MaximizeInteraction data={max_data} />
          <PricingFeatures />
        </>
      )}

      <CardBenefits
        data={data}
        title={
          <>
            <span>One Digital Business Card,</span> Countless Benefits
          </>
        }
      />
      <VideoSection
        title={
          <>
            NSG’s Best
            <br /> Digital Business
            <br /> Cards
          </>
        }
        desc="NSG brings together everything you need for in-person meetings. Connecting, managing, and nurturing contacts—while combining the functionality of a business card with smart contact management. This all-in-one solution boosts your efficiency by:"
        cta={"Select the Best Plan for You"}
        video_desc="Play the video to learn more about our best Business Card"
      />
      <SavingSection isSecondary={props.isSecondary} />
      {!props.isSecondary && <SinglePricing />}
      <UserReview />
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
