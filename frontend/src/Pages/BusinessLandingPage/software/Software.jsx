

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./Software.scss";

const logo2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/915d14d99c1b4a27a5f03047e2213333.webp";

export default function SoftwarePage() {
  const [software, setSoftware] = useState("standard");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const navigate = useNavigate();

  const order = JSON.parse(localStorage.getItem("order")) || {};
  const selectedPlan = order.metal_card || "metal79";

  const isPlan79 = selectedPlan === "metal79";
  const planPrice = isPlan79 ? "$79.00" : "$99.00";
  const planDesc = isPlan79
    ? "Your name & title engraved"
    : "Your name, title engraved & brand logo";


  const handleSelectShipping = () => {
    const updatedOrder = JSON.parse(localStorage.getItem("order")) || {};
    updatedOrder.software_plan = software;
    localStorage.setItem("order", JSON.stringify(updatedOrder));
    navigate("/shipping-method");
  };
return (
  <>
    {/* NAV */}
    <div className="nav">
      <div className="logo">
        <img src={logo2} alt="" />
      </div>
      <div>
        <button
          className="signbtn"
          onClick={() => (window.location.href = "/signup")}
        >
          SignIn
        </button>
      </div>
    </div>

    {/* CENTER WRAPPER */}
    <div className="software-outer">
      <div className="software-page">

        {/* HEADER */}
        <div className="page-header">
          <div className="back-wrap">
            <span className="back-text" onClick={() => navigate(-1)}>
              <ArrowBackIcon /> Back
            </span>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="order-summary-box">
          <div
            className="order-summary-header"
            onClick={() => setSummaryOpen(!summaryOpen)}
          >
            <span className="order-summary-title">Order Summary</span>

            <div className="order-summary-right">
              <span className="order-summary-price">{planPrice}</span>
              <span className="order-summary-chevron">
                {summaryOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </span>
            </div>
          </div>

          {summaryOpen && (
            <div className="order-summary-body">
              <div className="os-row">
                <div className="os-left">
                  <div className="os-title">Metal Custom Card</div>
                  <div className="os-desc">{planDesc}</div>
                </div>
                <div className="os-right">{planPrice}</div>
              </div>

              <div className="os-row">
                <div className="os-left">
                  <div className="os-title">
                    NSG {software === "pro" ? "Pro" : "Standard"}
                  </div>

                  <div className="os-desc">
                    {software === "pro"
                      ? "Digital business card with built-in CRM free for 3 months"
                      : "Digital business card and contact management"}
                  </div>
                </div>

                <div className="os-right muted">
                  {software === "pro" ? (
                    <>
                      <span className="cross-price">$7.5/mo</span> &nbsp; $0
                    </>
                  ) : (
                    "Included"
                  )}
                </div>
              </div>

              <div className="os-row">
                <div className="os-left">
                  <div className="os-title">Shipping</div>
                </div>
                <div className="os-right muted">
                  Calculated at checkout
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SOFTWARE PACKAGE */}
        <div className="package-section">
          <h4>Software Package</h4>
          <p className="sub">Choose a tier</p>

          {/* STANDARD */}
          <div
            className={`package-card ${
              software === "standard" ? "active" : ""
            }`}
            onClick={() => setSoftware("standard")}
          >
            <div
              className={`radio ${
                software === "standard" ? "checked" : ""
              }`}
            />
            <div className="content">
              <div className="title-row">
                <h5>Standard</h5>
                <span className="included">Included</span>
              </div>

              {software === "standard" && (
                <ul className="pro-features">
                  <li>Digital Business Card</li>
                  <li>Email Signature</li>
                  <li>Contact management</li>
                  <li>7000+ Integrations with Zapier</li>
                </ul>
              )}
            </div>
          </div>

          {/* PRO */}
          <div
            className={`package-card ${
              software === "pro" ? "active" : ""
            }`}
            onClick={() => setSoftware("pro")}
          >
            <div
              className={`radio ${
                software === "pro" ? "checked" : ""
              }`}
            />
            <div className="content">
              <div className="title-row">
                <h5>Pro</h5>
                <span className="price">
                  + $0 <span className="cross-price">$7.5/mo</span>
                </span>
              </div>

              {software === "pro" && (
                <ul className="pro-features">
                  <span className="free">3 months free</span>
                  <li>
                    <strong>Everything in Standard plus</strong>
                  </li>
                  <li>Advanced contact management</li>
                  <li>Auto follow-up reminders (SMS/Email)</li>
                  <li>Smart scheduling</li>
                  <li>2X more deals closed</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="sticky-cta">
          <button className="cta-button" onClick={handleSelectShipping}>
            Select Shipping
          </button>
        </div>

      </div>
    </div>

    {/* FOOTER (OUTSIDE WRAPPER) */}
    <div className="simple-footer">
      <img
        src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Logo_png.webp"
        alt="NSG"
      />
      <p>Copyright © 2026 NSG. All rights reserved.</p>
    </div>
  </>
);
}