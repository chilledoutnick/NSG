import { useState, useEffect } from "react";
import $ from "jquery";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import "./MasterContacts.scss";

function MaximizeInteraction(props) {
  const [marginAuto, setMarginAuto] = useState(0);

  useEffect(() => {
    $(document).ready(function () {
      let margin_left = $(".meta_signup_con_wrapper").css("margin-left");
      setMarginAuto(margin_left);
    });
  }, []);

  const scrollRight = () => {
    const containerWidth = $("#maximize_interaction_item").width();
    const scrollAmount = containerWidth * 1.09;
    $("#maximize_interaction_item").animate(
      {
        scrollLeft: `+=${scrollAmount}px`,
      },
      "slow"
    );
  };

  const scrollLeft = () => {
    const containerWidth = $("#maximize_interaction_item").width();
    const scrollAmount = containerWidth * 1.09;
    $("#maximize_interaction_item").animate(
      {
        scrollLeft: `-=${scrollAmount}px`,
      },
      "slow"
    );
  };

  return (
    <div
      style={{ paddingLeft: marginAuto }}
      className="maximize_interaction_con"
    >
      <h2 style={{ paddingRight: marginAuto }}>
        {props.title ? (
          props.title
        ) : (
          <>
            Step into the world of effortless networking with NSG
            <br /> and experience
            <span> results like never before</span> within the first
            <br /> few weeks.
          </>
        )}
      </h2>
      <div
        className="maximize_interaction_items"
        id="maximize_interaction_item"
      >
        {props.data.map((item, index) => {
          return (
            <div className="maximize_interaction_item" key={index}>
              <h5>{item.title}</h5>
              <span>{item.tag}</span>
              <p>{item.desc}</p>
            </div>
          );
        })}
      </div>
      <div className="use_cases_nav" style={{ paddingRight: marginAuto }}>
        <button onClick={scrollLeft}>
          <KeyboardArrowLeftIcon fontSize="large" />
        </button>
        <button onClick={scrollRight}>
          <KeyboardArrowRightIcon fontSize="large" />
        </button>
      </div>
    </div>
  );
}

export default MaximizeInteraction;
