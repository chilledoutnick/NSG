import { useEffect, useState } from "react";
import "./Depositmodal.scss";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WhatshotIcon from "@mui/icons-material/Whatshot";


export default function DepositModal({ onCheckout, autoOpen = false }) {
  const [visible, setVisible] = useState(false);

 useEffect(() => {
  if (autoOpen) {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 6000);
    return () => clearTimeout(timer);
  } else {
    // 🔥 instantly open
    setVisible(true);
  }
}, []);

  if (!visible) return null;

  return (
    <div className="dm-overlay" onClick={() => setVisible(false)}>
      <div
        className="dm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className="dm-close" onClick={() => setVisible(false)}>
          ✕
        </button>

        {/* Heading */}
        <h2 className="dm-title">
          <span className="dm-title-black">$19 Deposit Today</span>
          <br />
          <span className="dm-title-purple">Remaining When Ships</span>
        </h2>

        {/* Subtext */}
        <p className="dm-sub">
          Secures your custom order. Balance charged after card design approval.
        </p>

        {/* Scarcity */}
        <p className="dm-scarcity">
         <WhatshotIcon style={{ color: "#410099", fontSize: "18px" }} /> 23/50 ADVANCE SPOTS LEFT
        </p>

        {/* CTA */}
        <button className="dm-cta" onClick={onCheckout}>
          Secure Order for $19
        </button>

        {/* Divider */}
        <div className="dm-divider" />

        {/* Trust badges */}
        <div className="dm-trust">
          <div className="dm-trust-item">
            <LockOutlinedIcon className="dm-trust-icon" />
            <span className="dm-trust-label">
              SECURE<br />SSL
            </span>
          </div>
          <div className="dm-trust-item">
         <TaskAltOutlinedIcon className="dm-trust-icon" />
            <span className="dm-trust-label">
              100%<br />SATISFACTION
            </span>
          </div>
          <div className="dm-trust-item">
            <LocalShippingOutlinedIcon className="dm-trust-icon" />
            <span className="dm-trust-label">
              FAST<br />DELIVERY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}