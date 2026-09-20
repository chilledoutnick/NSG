import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  PaymentElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { ThreeDots } from "react-loader-spinner";
import moment from "moment";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import "./PricingCheckout.scss";
import Swal from "sweetalert2";
import { useStore } from "../../../store/advisorStore";
import { useSearchParams, useNavigate } from "react-router-dom";
import { create } from "@mui/material/styles/createTransitions";

function PricingCheckout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [client_secret, setClientSecret] = useState("");
  const [isCardComplete, setIsCardComplete] = useState(false);
  const { get_advisor_data } = useStore();
  const payment_intent = searchParams.get("setup_intent");
  const stripe = useStripe();
  const elements = useElements();
  const pathname = window.location.pathname;
  const isUpgrade = pathname === "/account/checkout";
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [packageInfo, setPackageInfo] = useState({});
  const [coupon_code, setCoupon_code] = useState("");
  const [isCouponValid, setIsCouponValid] = useState(true);
  const signup_data = JSON.parse(sessionStorage.getItem("signup_data"));
  const product_details = JSON.parse(sessionStorage.getItem("product_details"));
  const stripe_details = JSON.parse(sessionStorage.getItem("stripe_details"));
  const meta_plan = sessionStorage.getItem("meta_plan") === "lifetime";
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  let lifetime = "prod_S6vm4Nggcerayj";
  const user_info = JSON.parse(localStorage.getItem("user_info"));

  useEffect(() => {
    if (!stripe || !packageInfo.amount_due) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: packageInfo.product_name || "Total",
        // amount: packageInfo.amount_due || 1, // Fallback to 10 USD
        amount: Math.round(packageInfo.amount_due * 100) || 1, // Fallback to 10 USD
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        pr.on("paymentmethod", async (ev) => {
          try {
            const clientSecret = stripe_details.client_secret;

            const { error, setupIntent } = await stripe.confirmCardSetup(
              clientSecret,
              {
                payment_method: ev.paymentMethod.id,
                return_url: `${window.location.origin}/${isUpgrade ? "account/domain" : "signup/domain"
                  }`,
              }
            );

            if (error) {
              ev.complete("fail");
              console.error("Stripe error:", error.message);
            } else {
              if (setupIntent && setupIntent.status === "succeeded") {
                ev.complete("success");
                window.location.href = `${window.location.origin}/${isUpgrade ? "account/domain" : "signup/domain"
                  }?setup_intent=${setupIntent.id}&redirect_status=succeeded`;
              }
            }
          } catch (err) {
            ev.complete("fail");
            console.error("Request failed:", err);
          }
        });

        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });
  }, [stripe, packageInfo.amount_due, packageInfo.product_name]);

  useEffect(() => {
    if (canMakePayment && paymentRequest) {
      setCardVisible(false);
    } else {
      setCardVisible(true);
    }
  }, [canMakePayment, paymentRequest]);

  const add_sender_data = () => {
    const Abandoned = "dy7G16";
    const url = "api/feature/add_sender_data/";
    var fullName = signup_data.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const payload = {
      email: signup_data.email,
      firstname: firstName,
      lastname: lastName,
      tags: [Abandoned],
      phone: signup_data.phone ? "+1" + signup_data.phone : "",
    };
    axios
      .post(url, payload)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const create_payment_subscription = (payment_intent, price_id, setup_intent_id) => {
    const url = "api/billing/create_payment_subscription/";
    const payload = {
      session_id: payment_intent,
      price_id: price_id,
      coupon: coupon_code,
    };
    axios
      .post(url, payload)
      .then(() => {
        if (isUpgrade) {
          if (axios.defaults.baseURL === "https://nsgcrm.com") {
            mailChimp_submit();
            add_sender_data();
          }
          setIsProcessing(false);
          post_payment_status(user_info, true);
        }
        setIsProcessing(false);
        setMessage("Payment succeeded and subscription created!");
        setIsSuccess(true);
        const redirectUrl = isUpgrade
          ? `${window.location.origin}/account`
          : `${window.location.origin}/signup/domain?setup_intent=${setup_intent_id}&redirect_status=succeeded`;

        window.location.href = redirectUrl;
      })
      .catch((err) => {
        console.error("Subscription API failed:", err);
        setMessage(
          err.response?.data?.message ||
          "Subscription creation failed. Please try again."
        );
      });
  };

  const post_payment_status = (data, Upgrade) => {
    const url = "api/user_profile/post_payment_status/";
    const payload = {
      payment_status: true,
      user_id: data.user_id,
      session_id: payment_intent,
      is_free: payment_intent !== null ? false : true,
    };
    axios
      .post(url, payload)
      .then(() => {
        if (Upgrade) {
          get_advisor_data();
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Successfully upgraded to premium",
            showConfirmButton: false,
            timer: 3000,
          });
          navigate("/account");
        } else {
          //handelLogin();
          console.log("Login function called");
        }
      })
      .catch((err) => {
        setLoading(false);
        setMessage(
          err.response?.data?.message ||
          "Subscription creation failed. Please try again with diffent card."
        );
        setIsSuccess(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      if (
        error.code === "setup_intent_unexpected_state" &&
        error.setup_intent?.status === "succeeded"
      ) {
        try {
          await create_payment_subscription(
            error.setup_intent.id,
            packageInfo.price_id,
          );

        } catch (apiErr) {
          setIsProcessing(false);
          console.error("Subscription creation failed:", apiErr);
          setMessage("Subscription creation failed. Please try again.");
          setIsSuccess(false);
        }
      } else if (error.type === "card_error" || error.type === "validation_error") {
        setIsProcessing(false);
        setMessage(error.message || "Your card was declined. Please try again with diffent card.");
        setIsSuccess(false);
        mailChimp_submit();
        add_sender_data();
      }
      else {
        setIsProcessing(false);
        setMessage(error.message || "An unexpected error occurred.");
        setIsSuccess(false);
      }
    } else if (setupIntent && setupIntent.status === "succeeded") {
      try {
        setClientSecret(setupIntent.client_secret);
        await create_payment_subscription(
          setupIntent.id,
          packageInfo.price_id,
          setupIntent.id

        );
      } catch (apiErr) {
        setIsProcessing(false);
        console.error("Subscription creation failed:", apiErr);
        setMessage("Subscription creation failed. Please try again with diffent card.");
        setIsSuccess(false);
      }
    }


  };



  useEffect(() => {
    let coupon = "50OFFNSG";
    let meta_id = "prod_S9cSVinWbwWNZE";
    let url_coupon = sessionStorage.getItem("url_coupon");
    if (
      product_details.product_id === meta_id &&
      product_details.period === "yearly"
    ) {
      setCoupon_code(coupon);
      sessionStorage.setItem("coupon_code", coupon);
      get_stripe_details(coupon);
    } else if (url_coupon) {
      setCoupon_code(url_coupon);
      sessionStorage.setItem("coupon_code", url_coupon);
      get_stripe_details(url_coupon);
    } else {
      get_stripe_details();
      sessionStorage.removeItem("coupon_code");
      setCoupon_code("");
    }
  }, []);

  const get_stripe_details = (meta_coupon) => {
    setLoading(true);
    const url = "api/stripe/get_stripe_details/";
    const payload = {
      period: product_details.period,
      coupon: meta_coupon ? meta_coupon : coupon_code,
      product_id: product_details.product_id,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setPackageInfo(res.data);
        setLoading(false);
        if (res.data.coupon_message === "Invalid Coupon") {
          setIsCouponValid(false);
          setCouponApplied(false);
        } else {
          setIsCouponValid(true);
          setCouponApplied(true);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("err", err);
      });
  };

  const get_stripe_details_no_coupon = () => {
    setLoading(true);
    const url = "api/stripe/get_stripe_details/";
    const payload = {
      period: product_details.period,
      coupon: "",
      product_id: product_details.product_id,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setPackageInfo(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log("err", err);
      });
  };

  const mailChimp_submit = () => {
    var fullName = signup_data.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const url = "api/mail_chimp/post_email/";
    const payload = {
      email: signup_data.email,
      first_name: firstName,
      last_name: lastName,
      tags: ["Abandoned Cart Customers"],
    };
    axios
      .post(url, payload)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  console.log("packageInfo", packageInfo);

  return (
 
    <div
      className={
        "pricing_checkout_con " +
        (isUpgrade ? "pricing_checkout_con_upgrade" : "")
      }
    >
      <div className="pricing_header">
        <HeaderLogin title="Complete your purchase" />
      </div>
      <div className="pricing_checkout_wrapper">
        <div className="pricing_checkout_left">
          <div className="pricing_checkout_details_wrapper">
            <h3>Payment method</h3>
            {canMakePayment && paymentRequest && (
              <div className="payment-request-button">
                <PaymentRequestButtonElement options={{ paymentRequest }} />
              </div>
            )}
            {!cardVisible ? (
              <button
                className="pay_with_card_btn"
                onClick={() => {
                  setCardVisible(true);
                }}
              >
                <span className="pay_btn_text">Pay with card</span>
                <span className="card_logos">
                  <img
                    src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Visa_png.webp"
                    alt="Visa"
                  />
                  <img
                    src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/American_Express_png.webp"
                    alt="Amex"
                  />
                  <img
                    src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Mastercard_png.webp"
                    alt="Mastercard"
                  />
                  <img
                    src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Japan_Credit_Bureau_png.webp"
                    alt="JCB"
                  />
                </span>
              </button>
            ) : (
              <div className="payment-element-wrapper">
                {canMakePayment && paymentRequest && (
                  <button
                    onClick={() => {
                      setCardVisible(false);
                    }}
                    className="backButton"
                  >
                    <ArrowBackIcon /> Back
                  </button>
                )}
                <PaymentElement
                  id="payment-element"
                  options={{
    wallets: {
      applePay: "never",
      googlePay: "never",
    },
  }}
                  onChange={(event) => {
                    setIsCardComplete(event.complete)
                    console.log("event", event);
                    setMessage("");
                  }
                  }

                />
                <button
                  disabled={
                    isProcessing || !stripe || !elements || !isCouponValid || !isCardComplete || !isSuccess
                  }
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  {isProcessing ? (
                    <ThreeDots
                      height="25"
                      width="60"
                      color="white"
                      ariaLabel="three-dots-loading"
                      visible={true}
                    />
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            )}
            <p className={`${isSuccess ? "success" : "error"} mt-2`}>
              {message}
            </p>


            <div className="secure-badge-wrapper">
              <div className="secure-badge">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="secure-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00A86B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="20"
                  height="20"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="secure-text">Pay safe &amp; secure</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pricing_checkout_right">
          {!isCollapsed ? (
            <div className="pricing_checkout_card_info_wrapper">
              <h3> Start Your 15 Days Trial <br />
                {/* {meta_plan
                ? `NSG Lifetime Plan`
                : `${packageInfo.product_name}`} */}
              </h3>

              {!meta_plan && (
                <span className="price_text">
                  USD {packageInfo.amount_due}{" "}
                  {product_details.period === "quarterly"
                    ? "per quarter"
                    : product_details.period === "monthly"
                      ? "per month"
                      : "per year"}
                </span>
              )}
              {meta_plan && <p className="price_text_access">$220 One Time</p>}
              <h5>{packageInfo.product_name}</h5>
              <p className="price_text_access">
                Full access <br /> {packageInfo.desc}
              </p>
              <div className="pricingContainer">
                <div className="pricingContainerInner">
                  <div
                    className="price_divier price_divier1"
                    style={{ marginBottom: 16 }}
                  >
                    <span>Subtotal</span>
                    <span>
                      USD{" "}
                      {product_details.product_id === "prod_S1LFZEbIt3c9Zj"
                        ? "$120.00"
                        : packageInfo.amount / 100}{" "}
                    </span>
                  </div>
                  <div className="coupon_con">
                    <div>
                      <input
                        value={coupon_code}
                        onChange={(e) => {
                          setCoupon_code(e.target.value);
                          setCouponApplied(false);
                          sessionStorage.setItem("coupon_code", e.target.value);
                          if (e.target.value.trim() === "") {
                            setIsCouponValid(true);
                            packageInfo.coupon_message = "";
                            get_stripe_details_no_coupon();
                          }
                        }}
                        type="text"
                        placeholder="Add promo code"
                      />
                      {coupon_code !== "" && !couponApplied && (
                        <button
                          className="apply_btn"
                          onClick={() => get_stripe_details()}
                        >
                          {!loading ? (
                            "Apply"
                          ) : (
                            <ThreeDots
                              height="10"
                              width="35"
                              color="white"
                              ariaLabel="three-dots-loading"
                              visible={true}
                            />
                          )}
                        </button>
                      )}
                    </div>
                    {packageInfo.discount !== 0 && (
                      <p>-USD {packageInfo.discount}</p>
                    )}
                  </div>
                  {packageInfo.coupon_message !== "" && (
                    <p
                      className={
                        "coupon_message_text " +
                        (packageInfo.coupon_message ===
                          "Coupon added successfully"
                          ? "coupon_message_text_success"
                          : "")
                      }
                    >
                      {packageInfo.coupon_message ===
                        "Coupon added successfully"
                        ? packageInfo.discount_off + "% off Applied"
                        : packageInfo.coupon_message}
                    </p>
                  )}

                  {/* {!meta_plan && (
                    <div className="price_divier price_divier1">
                      <span>Total after {packageInfo.trial_days} days</span>
                      <span>USD {packageInfo.amount_due}</span>
                    </div>
                  )} */}
                  <div className="price_divier price_divier2">
                    {meta_plan ? (
                      <span>Total</span>
                    ) : (
                      <span>Total due today</span>
                    )}
                    <span>USD {packageInfo.amount_due}</span>
                  </div>
                </div>

                <div className="arrow_div_container">
                  <span className="arrow_div">
                    <KeyboardArrowUpIcon
                      onClick={() => {
                        setIsCollapsed(true);
                      }}
                    />
                  </span>
                </div>
              </div>

              <button
                disabled={
                  isProcessing || !stripe || !elements || !isCouponValid || !isCardComplete || !isSuccess
                }
                onClick={handleSubmit}
                className="btn-primary"
              >
                {isProcessing ? (
                  <ThreeDots
                    height="25"
                    width="60"
                    color="white"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                ) : (
                  "Pay Now"
                )}
              </button>
              {meta_plan && (
                <p className="price_text_trial">
                  You have the option to cancel at any time within 15 days, and we
                  offer a 15-day money-back guarantee.
                </p>
              )}
              {!meta_plan && (
                <p className="price_text_trial">


                  {/* Today, <b>USD {packageInfo.amount_due} </b>  will be charged to your account. If you decide to cancel within 15 days, you’ll receive a full refund, thanks to our 7-day money-back guarantee—so you can try it risk-free! */}

                  Try it risk-free! <b>USD {packageInfo.amount_due} </b> will be charged today, and if you cancel within 15 days, you’ll receive a full refund under our 15-day money-back guarantee.
                </p>
              )}
            </div>
          ) : (
            <div className="pricing_checkout_card_info_wrapper">
              <h3>
                {meta_plan
                  ? `NSG Lifetime Plan`
                  : `${packageInfo.product_name}`}
              </h3>
              <div className="pricingContainer">
                <div className="pricingContainerInner">
                  <div className="price_divier price_divier2">
                    {meta_plan ? (
                      <span>Total</span>
                    ) : (
                      <span>Total due today</span>
                    )}
                    <span>USD {packageInfo.amount_due}</span>
                  </div>
                </div>
                <div className="arrow_div_container">
                  <span className="arrow_div">
                    <KeyboardArrowDownIcon
                      onClick={() => {
                        setIsCollapsed(false);
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );


}

export default PricingCheckout;
