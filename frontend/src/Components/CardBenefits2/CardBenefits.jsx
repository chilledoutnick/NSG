import { useState } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./CardBenefits.scss";

function CardBenefits(props) {
  const [activeTab, setActiveTab] = useState(1);
  return (
    <div className="card_benefits_con2">
      <div className="card_benefits_con2_wrppaer">
        <h3>
          <span>Revolutionize Networking with NSG</span> The Digital Business
          Card with Built-In CRM
        </h3>
        <div className="card_benefits_wrapper">
          {props.data &&
            props.data.map((item, index) => {
              return (
                <div className="card_benefits_item" key={index + "benefits"}>
                  <button
                    onClick={() => {
                      if (activeTab !== item.id) {
                        setActiveTab(item.id);
                      } else {
                        setActiveTab(0);
                      }
                    }}
                    className="card_benefits_item_nav"
                  >
                    <span>
                      <img
                        src={item.icon}
                        alt="icon"
                        loading="lazy"
                        width={index === 0 ? 12 : 20}
                      />
                      {item.tag}
                    </span>
                    {activeTab === item.id ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </button>
                  <div
                    className={
                      "card_benefits_item_wrapper " +
                      (activeTab !== item.id ? "hide_benefits" : "")
                    }
                  >
                    <div className="card_benefits_item_left">
                      <LazyLoadImage
                        src={item.img}
                        effect="blur"
                        wrapperClassName="card_benefits_item_img"
                        alt={item.alt ? item.alt : "Benefits"}
                      />
                    </div>
                    <div className="card_benefits_item_right">
                      <h5>{item.title}</h5>
                      <ul>
                        {item.options.map((option, index) => {
                          return <li key={index + "option"}>{option}</li>;
                        })}
                      </ul>
                      <Link
                        className="card_benefits_item_right_btn"
                        // to={item.link ? item.link : "/signup/"}
                        onClick={() => {
                          $(window).scrollTop(0);
                        }}
                      >
                        Get Started
                        <ArrowRightAltIcon className="icon" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default CardBenefits;
