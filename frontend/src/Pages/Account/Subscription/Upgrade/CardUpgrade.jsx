import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShippingForm from "../ShippingForm";
import "./Upgrade.scss";

function CardUpgrade() {
  const nav = useNavigate();
  const [has_address, setHas_address] = useState(false);
  return (
    <div className="payment_form_con">
      <button onClick={() => nav("/account")} className="back_btn">
        <ArrowBackIcon />
        Back
      </button>
      <div className="pricing_checkout_card">
        <h3 style={{ marginBottom: 28 }}>Smart business card</h3>
        <h5>Metal-based Smart Business Card</h5>
        <p className="price_text_access">
          A metal-based smart business card worth $35 will be delivered to your
          address.
        </p>
        <ShippingForm
          isCheckout={true}
          hasAddress={(data) => {
            setHas_address(data);
          }}
        />
        <div
          className="price_divier price_divier1"
          style={{ marginBottom: 16 }}
        >
          <span>Smart business card (one time)</span>
          <span>$35.00</span>
        </div>
        <div className="price_divier price_divier2">
          <span>Total due today</span>
          <span>$35.00</span>
        </div>
        <button
          disabled={!has_address}
          onClick={() => {
            window.location.assign("https://buy.stripe.com/aEU28L3fp95F7hC8xp");
          }}
          className="btn-primary"
        >
          Pay a total of $35
        </button>
      </div>
    </div>
  );
}

export default CardUpgrade;
