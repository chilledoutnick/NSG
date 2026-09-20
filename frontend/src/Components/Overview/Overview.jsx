import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./Overview.scss";
const ConnectData = [
  {
    id: 0,
    title: "Benefits",
    
    desc: (
      <>
        <b>Capture 4x More Leads:</b> Boost your pipeline
        <br />
        <b>Save 1-3 Hours/Week:</b> Automate lead management
        <br />
        <b>Accelerate Follow-Ups:</b> Respond instantly and stay ahead
        <br />
        <b>Optimize Networking:</b> Manage connections seamlessly
        <br />
      </>
    ),

    
  },
  {
    id: 1,
    title: "Pricing Overview",
    desc: (
      <>
        Try NSG for 7 days,  You have the option to cancel at any time within 7 days, and we offer a 7-day money-back guarantee.:
        <br />
        <br />
        <span
          style={{
            textDecoration: "line-through",
            fontSize: "16px",
            color: "gray",
            display: "inline",
            padding: "3px",
          }}
        >
          $120
        </span>
        60 per year ($0.16/day)
        <br />
        Or,
        <br />
        $10 per month
        <br />
        <br />
        <a
          href="/signup/metasignup"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#410099", display: "inline" }}
        >
          Limited-Time Offer! Create Your Account Now.
        </a>
      </>
    ),
  },
  {
    id: 2,
    title: "Features",
    desc: (
      <>
        <b>Digital Business Card:</b> Capture leads professionally
        <br />
        <b>Built-in CRM:</b> Manage leads with tags and priorities
        <br />
        <b>All-in-One Workflow: </b> Set reminders, send follow-ups, and
        schedule meetings efficiently
        <br />
        <b>Complete Contact History:</b> Make informed decisions to close deals
      </>
    ),
  },
];
function Overview() {
  const [selectedId, setSelectedId] = useState(undefined);
  const selectedItem = ConnectData.find((item) => item.id === selectedId);

  return (
    <div className="contacts_connect_info">
      <div className="connect_info_btns">
        {ConnectData.map((item, index) => {
          return (
            <button
              key={index}
              onClick={() => {
                if (selectedId !== index) {
                  setSelectedId(index);
                } else {
                  setSelectedId(undefined);
                }
              }}
            >
              <span>
                {item.title}{" "}
                <ExpandMoreIcon
                  className={
                    "icon " + (selectedId === index ? "icon_active" : "")
                  }
                />
              </span>
              <div
                className={
                  "connect_info_content " +
                  (selectedId === index ? "connect_info_btns_active" : "")
                }
              >
                <p>{selectedItem?.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Overview;
