import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import TrustedCompany from "../../../Components/TrustedCompany/TrustedCompany";
import "./MetaSignup3.scss";

function MetaSignup3() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email_exists, setEmail_exists] = useState(false);
  const randomPassword = Math.floor(10000000 + Math.random() * 90000000);
  let local_signup_info = JSON.parse(
    sessionStorage.getItem("local_signup_info")
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: randomPassword.toString(),
  });

  const formRef = useRef(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const form = formRef.current;
      if (form) {
        const rect = form.getBoundingClientRect();
        const formMiddle = rect.top + rect.height / 2;
        setShowStickyCTA(formMiddle < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    formData[e.target.name] = e.target.value;
    setFormData({
      ...formData,
    });
  };


  useEffect(() => {
    if (local_signup_info !== null && formData.name === "") {
      setFormData({
        ...formData,
        name: local_signup_info.name,
        email: local_signup_info.email,
        phone: local_signup_info.phone ? local_signup_info.phone : "",
        password: local_signup_info.password,
      });
    }
  }, []);

  useEffect(() => {
    let input = formData.phone?.replace(/\D/g, "");
    if (input?.length === 11 && input?.startsWith("1")) {
      input = input.slice(1);
    }

    if (input?.length > 10) {
      input = input.slice(-10);
    }

    if (formData.phone !== input) {
      setFormData((prev) => ({
        ...prev,
        phone: input ? input : "",
      }));
    }
  }, [formData.phone]);

  const check_email = (email) => {
    const url = "/api/user/email_check/";
    const payload = {
      email: email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setErrorMsg("");
        setEmail_exists(res.data.email_exists);
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
      });
  };

  const add_sender_data = () => {
    const Abandoned = "dGzk4L";
    const url = "api/feature/add_sender_data/";
    var fullName = formData.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const payload = {
      email: formData.email,
      firstname: firstName,
      lastname: lastName,
      tags: [Abandoned],
      phone: formData.phone ? "+1" + formData.phone : "",
    };
    axios
      .post(url, payload)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const submit_check_email = () => {
    setLoading(true);
    const url = "/api/user/email_check/";
    const payload = {
      email: formData.email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        if (res.data.email_exists !== true) {
          setEmail_exists(res.data.email_exists);
          sessionStorage.setItem("local_signup_info", JSON.stringify(formData));
          sessionStorage.setItem("isGoogleSignup", false);
          sessionStorage.setItem("signup_data", JSON.stringify(formData));
          navigate("/metasignup2/offer");
          if (axios.defaults.baseURL === "https://nsgcrm.com") {
            add_sender_data();
            close();
          }
        } else {
          setEmail_exists(res.data.email_exists);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        setErrorMsg(err.response.data.message);
        setLoading(false);
      });
  };

  const close = () => {
    const url = "api/feature/close_lead/";
    const payload = {
      name: formData.name,
      contact_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      feel_familiar: "",
      lead_source: "Facebook",
    };
    axios
      .post(url, payload)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const btnDisabled =
    !formData.name || !formData.email || !formData.phone || email_exists;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="meta_signup3">
      {showStickyCTA && (
        <button
          onClick={() => {
            $("html, body").animate({ scrollTop: 0 }, 50);
          }}
          className="meta_signup_finish"
        >
          <KeyboardDoubleArrowUpIcon className="up_icon" /> Finish Your Form to
          Get Offer
        </button>
      )}
      <div className="meta_signup3_con">
        <div ref={formRef} className="meta_signup3_claim">
          <h2>Claim Your Exclusive Offer</h2>
          <p className="meta_signup3_desc">
            Enter your contact information to receive your offer details
          </p>
          <div className="meta_signup3_form">
            <label>Name*</label>
            <input
              className="meta_signup_input"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your answer."
            />
            <label>Email*</label>
            <input
              className="meta_signup_input"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your answer."
              onBlur={(e) => {
                check_email(e.target.value);
              }}
            />
            {email_exists && (
              <p className="error_text w-100 mb-2" style={{ marginTop: -10 }}>
                Account with this email already exists
              </p>
            )}
            <label>Phone number*</label>
            <div className="meta_signup_input_phone">
              <span>+1</span>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                className="meta_signup_input"
                onChange={(e) => {
                  let input = e.target.value.replace(/\D/g, "");

                  if (input.length === 11 && input.startsWith("1")) {
                    input = input.slice(1);
                  }

                  if (input.length > 10) return;

                  setFormData((prev) => ({
                    ...prev,
                    phone: input,
                  }));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  let pasted = e.clipboardData
                    .getData("text")
                    .replace(/\D/g, "");

                  if (pasted.length === 11 && pasted.startsWith("1")) {
                    pasted = pasted.slice(1);
                  }

                  pasted = pasted.slice(-10);

                  setFormData((prev) => ({
                    ...prev,
                    phone: pasted,
                  }));
                }}
                pattern="\d{10}"
                placeholder="(000)-000-0000"
              />
            </div>
          </div>
          {errorMsg && <p className="error_text">{errorMsg}</p>}
          <p className="meta_signup3_note">
            <span>
              By submitting this form, you agree to receive offer messages from
              NSG. Message frequency varies. Reply STOP to unsubscribe or
              HELP for help. See our{" "}
              <Link target="_blank" to="/terms-of-service">
                Terms of service
              </Link>{" "}
              &{" "}
              <Link target="_blank" to="/privacy">
                Privacy policy
              </Link>{" "}
              former details.
            </span>
          </p>
        </div>
        <div className="meta_signup3_button">
          <button
            onClick={submit_check_email}
            disabled={btnDisabled}
            className="cta-btn"
          >
            {!loading ? (
              "Get Your Offer"
            ) : (
              <ThreeDots
                height="25"
                width="60"
                color="black"
                ariaLabel="three-dots-loading"
                visible={true}
              />
            )}
          </button>
        </div>
        <div className="meta_signup3_digital">
          <h3>
            Only Digital Business Card <br />
            <span>with Built-in CRM!</span>
          </h3>
          <p>
            Capture, Manage & Close Leads—All in One Tool! Get 50% off your
            yearly plan and try it  for 7 days
          </p>
          <img
            src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1321316225_1_png.webp"
            loading="lazy"
            alt="Digital"
            className="meta_signup3_digital_img"
          />
          <TrustedCompany />
        </div>
      </div>
    </div>
  );
}

export default MetaSignup3;
