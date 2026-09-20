import  { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { ClickAwayListener } from "@mui/material";
import "./SavingSection.scss";

const checkbox =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/dwacheck-ci_png.webp";

function SavingSection(props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const data = [
    {
      title: "Business Cards",
      price: "$10 - $25",
    },
    {
      title: "Scheduling system",
      price: "$10",
    },
    {
      title: "Personal CRM",
      price: "$10 - $20",
    },
    {
      title: "Mini website",
      price: "$10",
    },
    {
      title: "Total monthly cost",
      price: "$40 - $65",
    },
  ];

  useEffect(() => {
    if (window.location.hash === "#learn-more") {
      const homeSection = document.getElementById("learn-more");
      setTimeout(() => {
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 1000);
    }
  }, []);

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#FFF",
      color: "#000",
      maxWidth: 213,
      fontSize: 14,
      borderRadius: 20,
      padding: 14,
      boxShadow: "0 .5rem 1rem rgba(0,0,0,.15)!important",
      fontFamily: "Open Sans, sans-serif",
    },
  }));

  return (
    <div
      className={
        "saving_section_con " + (props.isSecondary ? "saving_section_con2" : "")
      }
      id="learn-more"
    >
      <div className="saving_section_con_wrapper">
        <h2>
          <span>Save ~$55</span> Each Month
        </h2>
        <p className="saving_section_desc">
          {
            props.desc ? props.desc : <>NSG users unlock more savings & efficiency while streamlining their
            workflows. <br /> Our features are integrated to maximize productivity
            and help you make the most of every business interaction.</>
          }
          
        </p>
        <table>
          <thead>
            <tr>
              <th>Features</th>
              <ClickAwayListener onClickAway={() => setShowTooltip(false)}>
                <th className="text-center">
                  <HtmlTooltip
                    open={showTooltip}
                    onOpen={() => setShowTooltip(true)}
                    onClose={() => setShowTooltip(false)}
                    title='"Traditional costs" refer to the average market prices for similar features and services, estimated based on industry standards.'
                  >
                    <span
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="trad_text"
                    >
                      Traditional costs
                    </span>
                    <br />
                  </HtmlTooltip>
                  /month
                </th>
              </ClickAwayListener>
              <th className="text-center">
                NSG costs <br /> /month
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              return (
                <tr key={index}>
                  <td className="table_title">{item.title}</td>
                  <td className="text-center">{item.price}</td>
                  <td className="text-center">
                    {index === 4 ? (
                      <p className="table_btm_price">
                        <span>Save: $30 - $55</span> $10/mo{" "}
                        <span>(Bill Annually)</span>
                      </p>
                    ) : (
                      <LazyLoadImage
                        src={checkbox}
                        effect="blur"
                        wrapperClassName="checkIcon"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!props.hideCta && (
          <button
            onClick={() => window.open("/signup/metasignup")}
            className="cta-btn"
          >
            Get Started for Free
          </button>
        )}
      </div>
    </div>
  );
}

export default SavingSection;
