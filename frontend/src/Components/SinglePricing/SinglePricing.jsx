import  { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import "./SinglePricing.scss";

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
function SinglePricing() {
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

  const isTooltipOpen = (id) => (isMobile ? openTooltip === id : undefined);

  const handleTooltipTrigger = (id) => {
    if (openTooltip !== id) {
      setOpenTooltip(id);
    } else {
      setOpenTooltip(null);
    }
  };

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

  const data = [
    <TooltipFeature
      id={6}
      tooltipContent={
        <>
          You can use Digital Business Card to <br />
          share your profile with your prospects.
        </>
      }
      featureText="Digital business card"
    />,
    <TooltipFeature
      id={7}
      tooltipContent={
        <>
          You can share your digital profile through
          <br />
          QR code scanning & links, and also have it
          <br /> in your Apple or Google wallets.
        </>
      }
      featureText="Share digital profile via Apple & Google wallet, QR code, URL & email"
    />,
    <TooltipFeature
      id={9}
      tooltipContent={
        <>
          You can add unlimited contacts in the contact management system. You
          can add them manually or when a prospect shares their contact through
          your profile.
        </>
      }
      featureText="Store unlimited contacts"
    />,
    <TooltipFeature
      id={3}
      tooltipContent={
        <>
          You can add unlimited tags,
          <br /> reminders, & notes for your contacts.
        </>
      }
      featureText="Use of tags, reminders, & notes"
    />,
    <TooltipFeature
      id={4}
      tooltipContent={
        <>
          You can send unlimited
          <br /> emails to your contacts.
        </>
      }
      featureText="Email & Schedule meetings"
    />,
    <TooltipFeature
      id={11}
      tooltipContent={
        <>
          You may avail our Smart business <br /> card made of metal at USD 35$.
        </>
      }
      featureText="Smart business card in $35 (On demand)"
    />,
    <TooltipFeature
      id={10}
      tooltipContent={
        <>
          You can view all the activities for
          <br /> each contact added from Day 1
        </>
      }
      featureText="Unlimited activity history"
    />,
    <TooltipFeature
      id={17}
      tooltipContent={
        <>
          Have our team at your disposal to troubleshoot any problem you face.
        </>
      }
      featureText=" Priority support"
    />,
  ];
  return (
    <div className="single_pricing">
      <div className="single_pricing_con">
        <h2>Great Plan Results In Great Networking</h2>
        <div className="single_pricing_note">
          <span>All prices are in USD</span>
          <span>|</span>
          <span>7-days  trial</span>
        </div>
        <div className="single_pricing_card shadow-sm">
          <span className="single_pricing_discount">Limited Time 50% Off</span>
          <h3>$120/Yearly</h3>
          <p>
            Billed <span>$120</span> $60 yearly (with 50% Off)
          </p>
          <button
            onClick={() => {
              $(window).scrollTop(0);
            }}
            className="cta-btn"
          >
            Get started
          </button>
          <ul>
            {data.map((item, index) => {
              return <li key={index}>{item}</li>;
            })}
          </ul>
          <LazyLoadImage
            effect="blur"
            alt="single_pricing_img"
            src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_340_png.webp"
            wrapperClassName="single_pricing_img"
          />
        </div>
      </div>
    </div>
  );
}

export default SinglePricing;
