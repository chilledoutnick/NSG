import axios from "axios";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import "./Agent.scss";

function Agent() {
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    company_name: "",
    agent_name: "",
    requirement: "",
    one_liner: "",
    language: "en",
    timezone: "America/New_York",
    voicemail: "",
    phone_number: "",
    area_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
//   useEffect(() => {
//   const already = localStorage.getItem("agent_created_for");
//   if (already) {
//     setResult({ existing: true });
//   }
// }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setLoading(true);

    axios
      .post("/api/agent/create_agent/", form)
      .then((res) => {
        swal({
          text: "Agent created successfully!",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setResult({
        client_name: form.client_name,
        company_name: form.company_name,
        agent_name: form.agent_name,
        twilio_number: res.data.twilio_number,   // from API
      });
      console.log("Result is now:", result);
        setLoading(false);
        // ✅ Save what was submitted + Twilio number 
      
    //   localStorage.setItem("agent_created_for", form.client_email);
        // setForm({
        //   client_name: "",
        //   client_email: "",
        //   company_name: "",
        //   agent_name: "",
        //   requirement: "",
        //   one_liner: "",
        //   language: "en",
        //   timezone: "America/New_York",
        //   voicemail: "",
        //   phone_number: "",
        //   area_code: "",
        // });
      })
      .catch((err) => {
        setLoading(false);
        const msg =
          err.response?.data?.error ||
          err.response?.data?.details ||
          "Something went wrong";
        swal({
          text: msg,
          icon: "error",
          timer: 3000,
          buttons: false,
        });
        console.log("API ERROR:", err.response);
      });
  };


    return (
    <div className="agent_page_wrapper">

      {/* LEFT — popup style form */}
      <div className="profile_add_popup agent_popup_form">
        <h4>Create New Agent</h4>
        <h5>Add details for your AI Caller Agent</h5>

        {/* FIELDS */}
        {[
          { label: "Client Name *", name: "client_name" },
          { label: "Client Email *", name: "client_email", type: "email" },
          { label: "Company Name *", name: "company_name" },
          { label: "Agent Name *", name: "agent_name" },
          { label: "One Liner (what your service does)", name: "one_liner" },
          {
            label: "Requirement (service description)",
            name: "requirement",
            textarea: true,
          },
          { label: "Language", name: "language" },
          { label: "Timezone", name: "timezone" },
          { label: "Voicemail Message", name: "voicemail" },
          { label: "Phone Number (for transfer)", name: "phone_number" },
          {
            label: "Area Code (for buying Twilio number)",
            name: "area_code",
          },
        ].map((field) => (
          <div className="form_group" key={field.name}>
            <label>{field.label}</label>

            {field.textarea ? (
              <textarea
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.label}
              ></textarea>
            ) : (
              <input
                name={field.name}
                type={field.type || "text"}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.label}
              />
            )}
          </div>
        ))}

        {/* BUTTONS */}
        <div className="profile_btn">
          <button
            onClick={handleSubmit}
            disabled={loading || result !== null}
            className="btn-save"
          >
            {!loading ? (
              "Create Agent"
            ) : (
              <ThreeDots
                height="25"
                width="60"
                radius="9"
                color="white"
                ariaLabel="loading"
              />
            )}
          </button>
        </div>
      </div>

      {/* RIGHT — Twilio result */}
      {result && (
        <div className="agent_result_box">
          <h3>Submission Summary</h3>

          <p>
            <strong>Client:</strong> {result.client_name}
          </p>
          <p>
            <strong>Company:</strong> {result.company_name}
          </p>
          <p>
            <strong>Agent Name:</strong> {result.agent_name}
          </p>

          <div className="twilio_box">
            <label>Twilio Number</label>
            <div className="twilio_row">
              <span>{result.twilio_number}</span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(result.twilio_number)
                }
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agent;