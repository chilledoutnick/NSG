import axios from "axios";
import { useState, lazy, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import { useStore } from "../../../../store/advisorStore";
import ShippingForm from "../ShippingForm";
import "./Upgrade.scss";
const ballon_img =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/balloon_png.webp";

const BlurPopup = lazy(() =>
  import("../../../../Components/BlurPopup/BlurPopup")
);

const visa =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Visa_png.webp";
const mastercard =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Mastercard_png.webp";
const american =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/American_Express_png.webp";
const jcb =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Japan_Credit_Bureau_png.webp";
const other =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/credit-card_png.webp";

function MonthlyUpgrade(props) {
  const { advisor_data, get_advisor_data } = useStore();
  const [loading, setLoading] = useState(false);
  const [isPay, setisPay] = useState(false);
  const [addCard, setAddCard] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [has_address, setHas_address] = useState(false);
  const subscription_details = JSON.parse(
    sessionStorage.getItem("subscription_details")
  );
  const user_info = JSON.parse(sessionStorage.getItem("advisor_data"));
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/billing/upgrade_yearly/";
    const payload = {
      yearly_price_id: props.isTeam
        ? "price_1QjNyxCeK0xF9nhYj2AjeAdq"
        : "price_1Px9ZtCeK0xF9nhYpj0wJcSB",
      is_card: addCard ? true : false,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setLoading(false);
        setIsSuccess(true);
        get_advisor_data();
      })
      .catch((err) => setLoading(false));
  };

  const has_address_disabled = addCard ? (has_address ? false : true) : false;

  return (
    <div className="payment_form_con">
      <button
        onClick={() => {
          if (isPay) {
            setisPay(false);
          } else {
            props.handleClose();
          }
        }}
        className="back_btn"
      >
        <ArrowBackIcon />
        Back
      </button>
      {!isPay ? (
        <div className="subscription_monthly_upgrade">
          <h2>Upgrade to yearly plan</h2>
          <p className="sub_desc">
            Save {props.isTeam ? "$120" : "$50.88"} USD by switching to yearly
            plans.
          </p>
          <div className="sub_upgrade_card_con">
            <div className="sub_upgrade_card">
              <h3>Current plan</h3>
              <p>
                At the current rate of expenses, after a year, you would be
                paying:
              </p>
              <h4>{props.isTeam ? "$359.88 USD" : "$119.88 USD"}</h4>
              <span>
                {props.isTeam ? "($29.99 x 12 months)" : "($9.99 x 12 months)"}
              </span>
            </div>
            <div
              className="sub_upgrade_card sub_upgrade_card_v2"
              style={addCard ? { borderColor: "#3A3A3A" } : {}}
            >
              <h3>Offered plan</h3>
              <p>
                At the offered rate of expenses, after a year, you would be
                paying:
              </p>
              <h4>{props.isTeam ? "$239.88 USD" : "$69 USD"}</h4>
              <span>
                {props.isTeam ? "($19.99 x 12 months)" : "($5.75 x 12 months)"}
              </span>
              <span
                style={
                  props.isTeam ||
                  advisor_data.account_status ===
                    "Pro (Monthly) + Smart Business Card"
                    ? { marginBottom: 16 }
                    : {}
                }
              >
                You will save a {props.isTeam ? "$120" : "$50.88"}
              </span>
              {!props.isTeam &&
                advisor_data.account_status !==
                  "Pro (Monthly) + Smart Business Card" && (
                  <div className="add_card">
                    <span>Add a Smart business card for $35.</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={addCard}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAddCard(true);
                          } else {
                            setAddCard(false);
                          }
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                )}
              <button
                onClick={() => {
                  setisPay(true);
                }}
                className="btn-primary"
              >
                Pay {addCard ? "$104" : "$69"}
              </button>
            </div>
          </div>
          <p className="sub_desc2">
            Note: Your upgraded yearly plan will be effective immediately when
            the current monthly plan ends. But,
            <br /> you will not be eligible for another 7-day trial.
          </p>
        </div>
      ) : (
        <div className="pricing_checkout_card_wrapper">
          <div className="pricing_card_form">
            <h3>Payment method</h3>
            <label htmlFor="">Contact information</label>
            <input
              readOnly
              type="text"
              value={subscription_details?.email || user_info?.email}
              placeholder="Email"
            />
            <input
              readOnly
              type="text"
              value={user_info?.phone}
              placeholder="Phone"
            />
            <label htmlFor="">Card information</label>
            <input
              readOnly
              type="text"
              placeholder="Card information"
              value={
                subscription_details?.last4
                  ? "**** **** **** " + subscription_details?.last4
                  : "**** **** **** ****"
              }
            />
            <input
              type="text"
              readOnly
              value={
                subscription_details?.exp_month +
                "/" +
                subscription_details?.exp_year
              }
              placeholder="Expire date"
            />
            <label htmlFor="">Country or region</label>
            <input
              readOnly
              type="text"
              value={subscription_details?.country}
              placeholder="Country or region"
            />
          </div>
          <div className="pricing_checkout_card">
            <h3>{props.isTeam ? "Team" : "Pro"} (yearly)</h3>
            <span className="price_text">
              {props.isTeam
                ? "$239.88 USD per year (You are saving $120)"
                : "$69 USD per year (You are saving $50.88)"}
            </span>
            <h5>
              {props.isTeam
                ? "NSG Team Plan (Yearly)"
                : "NSG Pro Plan (Yearly)"}
            </h5>
            <p className="price_text_access">
              You shall be billed on {subscription_details?.billing_date}, after
              the current monthly plan ends @ {props.isTeam ? "$239.88" : "$69"}{" "}
              USD per year (billed annually). Your plan will be effective
              automatically when the current plan ends.
            </p>
            {addCard && (
              <>
                <h5>Smart business card</h5>
                <p className="price_text_access">
                  A metal-based smart business card worth $35 will be delivered
                  to your address.
                </p>
                <ShippingForm
                  isCheckout={true}
                  hasAddress={(e) => {
                    setHas_address(e);
                  }}
                />
              </>
            )}
            <div
              className="price_divier price_divier1"
              style={addCard ? {} : { marginBottom: 16 }}
            >
              <span>{props.isTeam ? "Team" : "Pro"} (billed yearly)</span>
              <span>{props.isTeam ? "$239.88" : "$69.00"}</span>
            </div>
            {addCard && (
              <div
                className="price_divier price_divier1"
                style={{ marginBottom: 16 }}
              >
                <span>Smart business card (one time)</span>
                <span>$35.00</span>
              </div>
            )}
            <div className="price_divier price_divier1">
              <span>Total on {subscription_details?.billing_date}</span>
              <span>{props.isTeam ? "$239.88" : "$69.00"}</span>
            </div>
            <div className="price_divier price_divier2">
              <span>Total due today</span>
              <span>{addCard ? "$35.00" : "$0.00"}</span>
            </div>
            <button
              disabled={loading || isSuccess || has_address_disabled}
              onClick={() => {
                handleSubmit();
              }}
              className="btn-primary"
            >
              {loading ? (
                <ThreeDots
                  height="25"
                  width="60"
                  color="white"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              ) : (
                "Pay $69"
              )}
            </button>
          </div>
        </div>
      )}
      {isSuccess && (
        <BlurPopup
          onClose={() => setIsSuccess(false)}
          openState={isSuccess}
          ComponentClass="booking_integration_popup"
        >
          <div className="blurpopup_con_wrapper booking_integration_popup_pause">
            <div className="success_pause">
              <h3>Successfully upgraded to yearly plan</h3>
              <h4>A notification has been mailed to you.</h4>
              <LazyLoadImage
                src={ballon_img}
                effect="blur"
                alt="ballon img"
                wrapperClassName="success_pause_img"
              />
              <h5>You saved $50.88</h5>
              <h4>
                You shall be billed on {subscription_details?.billing_date} @
                $69 USD per year. Your plan will be effective automatically when
                the current monthly plan ends.
              </h4>
              <div onClick={props.handleClose} className="pause_btn">
                <button className="btn-primary">
                  <ThumbUpOutlinedIcon fontSize="small" /> Done
                </button>
              </div>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default MonthlyUpgrade;
