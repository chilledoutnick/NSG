import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import { useStore } from "../../../store/advisorStore";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../../Components/LoginSlider/LoginSlider";
import "./DomainSelection.scss";
import { SuprSend } from "@suprsend/web-sdk";

const suprSendKey = process.env.REACT_APP_SUPRSEND_PUBLIC_KEY;
const suprSendVapid = process.env.REACT_APP_SUPRSEND_VAPID_KEY;
const suprSendClient = suprSendKey
  ? new SuprSend(suprSendKey, {
      vapidKey: suprSendVapid,
      swFileName: "/firebase-messaging-sw.js",
    })
  : null;


const DomainSelection = () => {
  const navigate = useNavigate();
  const { get_advisor_data } = useStore();
  const [searchParams] = useSearchParams();
  const pathname = window.location.pathname;
  const isUpgrade = pathname === "/account/domain";
  const payment_intent = searchParams.get("setup_intent");
  const signup_data = JSON.parse(sessionStorage.getItem("signup_data"));
  const user_info = JSON.parse(localStorage.getItem("user_info"));
  const localPayment_intent = sessionStorage.getItem("setup_intent");
  const referral_host_advisor = JSON.parse(
    sessionStorage.getItem("referral_host_advisor"),
  );

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [suggested_username, setSuggested_username] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const product_details = JSON.parse(sessionStorage.getItem("product_details"));
  let coupon = sessionStorage.getItem("coupon_code");
  const signup_start_url = sessionStorage.getItem("signup_start_url");

  // const payment_intent = searchParams.get("setup_intent");
  const sessionId =
    searchParams.get("session_id") ||
    sessionStorage.getItem("stripe_session_id");

  useEffect(() => {
    check_username(signup_data.name.toLowerCase().replaceAll(" ", ""));
  }, []);

  const get_stripe_details = () => {
    const url = "api/stripe/get_stripe_details/";
    const payload = {
      period: product_details.period,
      coupon: coupon,
      product_id: product_details.product_id,
    };
    axios
      .post(url, payload)
      .then((res) => {
        create_payment_subscription(payment_intent, res.data.price_id);
        sessionStorage.setItem("payment_intent", payment_intent);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  // const add_sender_data = () => {
  //   const FreeUser = "bkBPPK";
  //   const PaidUser = "b22EEW";
  //   const tags = payment_intent !== null ? PaidUser : FreeUser;
  //   const url = "api/feature/add_sender_data/";
  //   var fullName = signup_data.name.split(" "),
  //     firstName = fullName[0],
  //     lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
  //   const payload = {
  //     email: signup_data.email,
  //     firstname: firstName,
  //     lastname: lastName,
  //     tags: [tags],
  //     phone: signup_data.phone ? "+1" + signup_data.phone : "",
  //   };
  //   axios
  //     .post(url, payload)
  //     .then((res) => console.log(res))
  //     .catch((err) => console.log(err));
  // };


  const add_sender_data = () => {
  const LeadTag = "dGzk4L";
  const PaidTag = "b22EEW";
  const FreeTag = "bkBPPK"; 

  const promo_code = sessionStorage.getItem("promo_code");

  const isPaidUser =
    signup_start_url === "metal" || payment_intent !== null || !!promo_code;

  let tags = [LeadTag]; // 👈 har case me lead rahega

  if (isPaidUser) {
    tags.push(PaidTag);   // paid / metal
  } else {
    tags.push(FreeTag);   // free user
  }

  const url = "api/feature/add_sender_data/";

  var fullName = signup_data.name.split(" "),
    firstName = fullName[0],
    lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";

  const payload = {
    email: signup_data.email,
    firstname: firstName,
    lastname: lastName,
    tags: tags,   // 👈 FINAL TAG ARRAY
    phone: signup_data.phone ? "+1" + signup_data.phone : "",
  };

  axios
    .post(url, payload)
    .then((res) => console.log("✅ sender updated", tags))
    .catch((err) => console.log("❌ sender error", err));
};

  const create_payment_subscription = (payment_intent, price_id) => {
    const url = "api/billing/create_payment_subscription/";
    const payload = {
      session_id: payment_intent,
      price_id: price_id,
      coupon: coupon,
    };
    axios
      .post(url, payload)
      .then(() => {
        if (isUpgrade) {
          if (axios.defaults.baseURL === "https://nsgcrm.com") {
            mailChimp_submit();
            add_sender_data();
          }
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err.response.data.message,
          confirmButtonText: "Contact us",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/contact-sales";
          }
        });
      });
  };

  const check_username = (username) => {
    const url = "api/user/check_username/";
    const payload = {
      username: username,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setDomain(res.data.suggested_username);
        setSuggested_username(res.data.suggested_username);
        setSubmitError("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
      });
  };

  const submit_check_username = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = "api/user/check_username/";
    const payload = {
      username: domain,
    };
    axios
      .post(url, payload)
      .then((res) => {
        if (res.data.is_user !== false) {
          setErrorMsg("Domain already taken");
          setLoading(false);
          setSuggested_username(res.data.suggested_username);
        } else {
          signUp();
          setErrorMsg("");
        }
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
        setLoading(false);
        console.log("err", err);
      });
  };

  // ─── NEW: Update smart card with user_id after account creation ──────────
  const updateSmartCard = async (userId) => {
    try {
      await axios.post("api/smart_card/update_smart_card/", {
        email: signup_data.email,
        user_id: userId,
      });
    } catch (err) {
      // Non-blocking — log error but don't interrupt signup flow
      console.error("update_smart_card failed:", err);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // const redeemPromoCode = async (userId, code) => {
  //   try {
  //     await axios.post("api/user/redeem_promo_code/", {
  //       user_id: userId,
  //       promo_code: code,
  //     });
  //   } catch (err) {
  //     console.error("Promo code redemption failed:", err);
  //   }
  // };

  const signUp = async () => {
    try {
      setLoading(true);
      setSubmitError("");

      const promo_code = sessionStorage.getItem("promo_code");
      const isMetalFlow = signup_start_url === "metal";
      const isFreeFlow = signup_start_url === "free" || !signup_start_url;
      const isRedeemFlow = signup_start_url === "redeem" || !!promo_code;

      // 🛡 METAL SECURITY CHECK
      if (isMetalFlow && !isRedeemFlow) {
        const metalVerified = localStorage.getItem("metal_payment_verified");

        if (!metalVerified) {
          alert("Unauthorized access. Please complete payment first.");
          navigate("/pricing");
          return;
        }

        const paymentDetailsRes = await axios.post(
          "api/billing/payment_details/",
          { session_id: sessionId },
        );

        const { stripe_subscription_id, payment_intent_id, session_id } =
          paymentDetailsRes.data || {};

        if (!stripe_subscription_id && !payment_intent_id && !session_id) {
          throw new Error("Payment not verified");
        }
      }

      if (!isMetalFlow && !isFreeFlow && !isRedeemFlow) {
        const paymentDetailsRes = await axios.post(
          "api/billing/payment_details/",
          { email: signup_data.email },
        );

        const { stripe_subscription_id, payment_intent_id, session_id } =
          paymentDetailsRes.data || {};

        if (!stripe_subscription_id && !payment_intent_id && !session_id) {
          throw new Error("Payment not verified");
        }
      }

      // ✅ CREATE USER
      const createUserRes = await axios.post("api/user_profile/create_user/", {
        email: signup_data.email,
        name: signup_data.name,
        password: signup_data.password,
        phone: "",
        username: domain,
        package: isRedeemFlow ? 6 : (isMetalFlow ? 4 : 5),
        is_advisor: true,
        profile_picture: signup_data.profile_picture,
        promo_code: promo_code || "",
      });

      // ─── Link smart card to the newly created user ───────────────────────
      const newUserId = createUserRes.data?.id || createUserRes.data?.user_id;
      if (newUserId) {
        await updateSmartCard(newUserId);
        
      }

      // // ✅ STEP 4: SAVE PROMO CODE DETAILS
      if (newUserId && promo_code) {
      //   await redeemPromoCode(newUserId, promo_code);
        sessionStorage.removeItem("promo_code");
      }

       add_sender_data();


      // Remove metal flag after success
      if (isMetalFlow) {
        localStorage.removeItem("metal_payment_verified");
      }

      handelLogin();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Signup failed");
      setLoading(false);
    }
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
      tags: payment_intent !== null ? ["New User"] : ["Free User"],
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

  const signup_with_referral = (referred_advisor) => {
    const url = "api/refer/signup_with_referral/";
    const payload = {
      host_user: referral_host_advisor,
      referred_user: referred_advisor,
      referral_code: "NSG18",
    };
    axios
      .post(url, payload)
      .then((res) => console.log("res", res))
      .catch((err) => console.log("err", err));
  };

  const handelLogin = () => {
    const url = "/api/user/login/";
    axios
      .post(url, signup_data)
      .then((res) => {
        handleNavigate(res.data);
        sessionStorage.setItem("showProgress", true);
      })
      .catch(() => {
        navigate("/login");
      });
  };

  const handleNavigate = (data) => {
    localStorage.setItem(
      "user_info",
      `{
        "name": "${data.name}",
        "user_id": "${data.id}",
        "email": "${data.email}",  
        "phone": "${data.phone}",
        "username": "${data.username}",
        "app_password": "${data.app_password}",
        "is_superuser": ${data.is_superuser},
        "is_team_admin": ${data.is_team_admin},
        "package": "${data.package}",
        "meet_link" : "${data.meet_link}",
        "suprsend_token": "${data.suprsend_token}"
        }`,
    );
    localStorage.setItem("jwt", data.jwt);
    localStorage.setItem("app_password", data.app_password);
    // Redirect to onboarding page
    navigate(`/signup/onboarding?user_id=${data.id}`);

    const distinctId = data.id.toString();
    const userToken = data.suprsend_token;

    suprSendClient
      .identify(distinctId, userToken)
      .then(() => {
        const perm = suprSendClient.webpush.notificationPermission();
        if (perm === "default") {
          Notification.requestPermission().then((result) => {
            if (result === "granted") {
              suprSendClient.webpush
                .registerPush()
                .then((resp) => console.log("Push registered:", resp))
                .catch((err) => console.error("Push register failed", err));
            } else {
              console.log("User denied notifications");
            }
          });
        } else if (perm === "granted") {
          suprSendClient.webpush
            .registerPush()
            .then((resp) => console.log("Push registered:", resp))
            .catch((err) => console.error("Push register failed", err));
        } else {
          console.log("Notifications permission denied");
        }
      })
      .catch((err) => console.error("SuprSend identify failed", err));
  };

  return (
    <div className="domain-container">
      {!isUpgrade && (
        <>
          {" "}
          <div className="domain_contant">
            <div className="domain_contant_top">
              <HeaderLogin />
            </div>
            <h2>Select your domain name</h2>
            <form className="domain-form">
              <div
                className={
                  "domain-input-wrapper " + (errorMsg ? "error_border" : "")
                }
              >
                <span className="preset-domain">nsgcrm.com</span>
                <input
                  type="text"
                  placeholder="Your domain name*"
                  value={domain}
                  className="domain-input"
                  onChange={(e) => {
                    e.preventDefault();
                    setDomain(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>
              {submitError && (
                <p className="error_text w-100 mt-1">{submitError}</p>
              )}
              {errorMsg && (
                <div className="w-100 mt-1">
                  <p
                    style={{ paddingLeft: "30%" }}
                    className="error_text w-100"
                  >
                    {errorMsg}
                  </p>
                  <div
                    onClick={() => {
                      setDomain(suggested_username);
                      setErrorMsg("");
                    }}
                    className="available_btn"
                  >
                    Available:<span>{" " + suggested_username}</span>
                  </div>
                </div>
              )}
              <button
                disabled={errorMsg || loading}
                onClick={submit_check_username}
                className="btn-primary w-100"
              >
                {!loading ? (
                  " Continue "
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    color="white"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                )}
              </button>
            </form>
          </div>
          <LoginSlider />
        </>
      )}
    </div>
  );
};

export default DomainSelection;
