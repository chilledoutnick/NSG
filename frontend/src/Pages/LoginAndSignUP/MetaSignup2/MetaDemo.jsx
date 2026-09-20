import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import "./MetaSignup3.scss";

function MetaDemo() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    showFamiliar: true,
    showGoodbye: false,
    showSave: false,
  });
  const [progress, setProgress] = useState(0);
  const [showTable, setShowTable] = useState(false);
  let signup_data = JSON.parse(sessionStorage.getItem("signup_data"));

  useEffect(() => {
    if (state.showGoodbye) {
      setProgress(50);
    } else if (state.showSave) {
      setProgress(100);
    } else {
      setProgress(20);
    }
  }, [state]);

  const [selectedTasks, setSelectedTasks] = useState([]);

  const handleChange = (label) => {
    setSelectedTasks((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const options = [
    "Running out of business cards",
    "Missing leads at events",
    "Managing leads in Excel",
    "Forgetting to follow up",
    "Losing potential clients in the chaos.",
  ];

  const close = () => {
    const url = "api/feature/close_lead/";
    const payload = {
      name: signup_data.name,
      contact_name: signup_data.name,
      email: signup_data.email,
      phone: signup_data.phone,
      feel_familiar: selectedTasks.join(", "),
      lead_source: "Facebook",
    };
    axios
      .post(url, payload)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  return (
    <div className="meta_demo">
      <div className="meta_signup_progress">
        <div
          className="progress-bar-inner"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <img
        src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1_png_DSjkWEw.webp"
        alt="NSG"
        className="meta_logo"
        loading="lazy"
      />
      <button
        className="back_btn"
        onClick={() => {
          if (state.showFamiliar) {
            navigate("/metasignup2/offer");
          } else if (state.showGoodbye) {
            setState({
              ...state,
              showFamiliar: true,
              showGoodbye: false,
              showSave: false,
            });
          } else {
            setState({
              ...state,
              showFamiliar: false,
              showGoodbye: true,
              showSave: false,
            });
          }
        }}
      >
        <ArrowBackIcon fontSize="small" /> Back
      </button>
      {state.showFamiliar && (
        <div className="meta_demo_familiar">
          <h2>
            <span>
              Which of these feel
              <br />
              familiar?{" "}
            </span>
          </h2>
          <span className="meta_demo_desc">(Select any that apply)</span>
          <ul>
            {options.map((label, index) => (
              <li key={index}>
                <input
                  type="checkbox"
                  id={`task${index}`}
                  checked={selectedTasks.includes(label)}
                  onChange={() => handleChange(label)}
                />
                <label htmlFor={`task${index}`}>{label}</label>
              </li>
            ))}
          </ul>
        </div>
      )}
      {state.showGoodbye && (
        <div className="meta_demo_goodbye">
          <h2>
            <span>Say goodbye</span> 👋 <br />
            <span>to these challenges</span>
          </h2>
          <span className="meta_demo_desc">
            With digital business card
            <br /> and built-in CRM{" "}
          </span>
          <img
            className="meta_demo_img"
            loading="lazy"
            src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_132131626_png.webp"
            alt="With digital business card and built-in CRM"
          />
          <div className="meta_demo_ui">
            <ul>
              <li>
                <span></span>Capture leads
              </li>
              <li>
                <span></span>Book meetings
              </li>
            </ul>
            <ul>
              <li>
                <span></span>Add notes & reminders
              </li>
              <li>
                <span></span>Send follow-up emails
              </li>
            </ul>
          </div>
        </div>
      )}
      {state.showSave && (
        <div className="meta_demo_save">
          <h2>
            <span>
              What if you could save more time and money for your business?
            </span>
          </h2>
          <div className="meta_demo_save_hr_con">
            <div className="meta_demo_save_hr">
              <div>
                <h5>~ $45</h5>
                <span>Saved per month</span>
                <hr />
                <p>
                  Skip multiple subscriptions—NSG unifies business cards,
                  CRM, and scheduling in one tool.
                  {showTable ? (
                    <KeyboardArrowUpIcon
                      className="icon"
                      onClick={() => setShowTable(false)}
                    />
                  ) : (
                    <KeyboardArrowDownIcon
                      className="icon"
                      onClick={() => setShowTable(true)}
                    />
                  )}
                </p>
              </div>
              {showTable && (
                <table>
                  <thead>
                    <tr>
                      <th>Features</th>
                      <th>
                        Other
                        <br /> Platforms
                      </th>
                      <th>NSG</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Business Cards</td>
                      <td>~$18/mo</td>
                      <td>Included</td>
                    </tr>
                    <tr>
                      <td>Scheduling System</td>
                      <td>$10/mo</td>
                      <td>Included</td>
                    </tr>
                    <tr>
                      <td>CRM Subscription</td>
                      <td>~$22/mo</td>
                      <td>Included</td>
                    </tr>
                    <tr>
                      <td>Mini Website</td>
                      <td>$10/mo</td>
                      <td>Included</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Total</b>
                      </td>
                      <td>
                        <b>~$60/mo</b>
                      </td>
                      <td>
                        <b>$10/mo</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="meta_demo_save_hr">
              <h5>1-3 hr</h5>
              <span>Per Week Saved</span>
              <p>
                Integrate NSG into your workflow to automatically consolidate
                your leads
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="meta_signup3_button">
        <button
          onClick={() => {
            if (state.showFamiliar) {
              if (axios.defaults.baseURL === "https://nsgcrm.com") {
                close();
              }
              setState({
                ...state,
                showFamiliar: false,
                showGoodbye: true,
                showSave: false,
              });
            } else if (state.showGoodbye) {
              setState({
                ...state,
                showFamiliar: false,
                showGoodbye: false,
                showSave: true,
              });
            } else {
              navigate("/metasignup2/pricing");
            }
          }}
          className="cta-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default MetaDemo;
