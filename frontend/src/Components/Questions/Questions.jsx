import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./Questions.scss";

function Questions(props) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="questions_con">
      <h3>Frequently Asked Questions</h3>
      {props.Questions &&
        props.Questions.map((item, index) => {
          return (
            <div
              key={index + "ques"}
              style={
                activeTab === item.id && item.ans !== null
                  ? { background: "rgba(0, 0, 0, 0.04)" }
                  : {}
              }
              className="ques_wrapper "
            >
              <button
                className={
                  "ques_btns " + (activeTab === item.id ? "active" : "")
                }
                onClick={() => {
                  if (activeTab === item.id) {
                    setActiveTab(0);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                {item.ques}
                <KeyboardArrowDownIcon className="icon" fontSize="large" />
              </button>
              <div
                className={
                  "ans_con " +
                  (activeTab === item.id && item.ans !== null
                    ? "active_ans"
                    : "")
                }
              >
                <p>{item.ans}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default Questions;

