import axios from "axios";
import  { useEffect, useState, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import momentTz from "moment-timezone";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { styled } from "@mui/material/styles";
import MonthlyUpgrade from "./Upgrade/MonthlyUpgrade";
import { useStore } from "../../../store/advisorStore";
import Toast from "../../../Components/Toast/Toast";
import "./Subscription.scss";
const BlurPopup = lazy(() => import("../../../Components/BlurPopup/BlurPopup"));
const PauseSub = lazy(() => import("./PauseSub"));
const ShippingForm = lazy(() => import("./ShippingForm"));
const CardUpgrade = lazy(() => import("./Upgrade/CardUpgrade"));

const diamond = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
  >
    <path
      d="M9.2 8.75L11.85 3.5H12.15L14.8 8.75H9.2ZM11.25 20.6L2.625 10.25H11.25V20.6ZM12.75 20.6V10.25H21.375L12.75 20.6ZM16.45 8.75L13.85 3.5H19L21.625 8.75H16.45ZM2.375 8.75L5 3.5H10.15L7.55 8.75H2.375Z"
      fill="black"
    />
  </svg>
);

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#5B5574",
    color: "#FFF",
    fontSize: "12px",
    padding: "8px",
    borderRadius: "4px",
    fontFamily: "'Open Sans', sans-serif",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#5B5574",
  },
}));

function Subscription() {
  const navigate = useNavigate();
  const { advisor_data, get_advisor_data } = useStore();
  const [ActivePlan, setActivePlan] = useState(0);
  const [subscription_details, setSubscription_details] = useState({});
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [showCard_purchase, setShowCard_purchase] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [isTeam, setisTeam] = useState(false);
  let user = JSON.parse(localStorage.getItem("user_info"));
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    const url = window.location.href.split("#");
    sessionStorage.setItem("signup_data", JSON.stringify(user));
    get_subscription_details();
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
    if (url[1] === "card_purchase_success") {
      setToastText({
        ...ToastText,
        text: "Smart card purchased successfully",
        show: true,
      });
      window.history.pushState({}, "", "/account");
      get_advisor_data(true);
      card_purchase_status();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(advisor_data).length !== 0) {
      sessionStorage.setItem("advisor_data", JSON.stringify(advisor_data));
    }
    if (advisor_data.account_status === "Free") {
      setActivePlan(1);
    } else if (advisor_data.account_status === "Pro (Monthly)") {
      setActivePlan(2);
    } else if (
      advisor_data.account_status === "Pro (Monthly) + Smart Business Card"
    ) {
      setActivePlan(2);
    } else {
      setActivePlan(3);
    }
  }, [advisor_data]);

    useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({
          ...ToastText,
          show: false,
        });
      }, 4000);
    }
  }, [ToastText]);

  
  useEffect(() => {
    const url2 = window.location.pathname;
    if (url2 === "/account/card-upgrade") {
      setShowCard_purchase(true);
    } else {
      setShowCard_purchase(false);
    }
  }, [window.location.pathname]);
  


  const card_purchase_status = () => {
    const url = "/api/smart_card/card_purchase_status/";
    axios
      .post(url, { has_smart_card: true }, config)
      .then((res) => console.log("res", res.data))
      .catch((err) => console.log("err", err));
  };

  const get_subscription_details = () => {
    const url = "api/billing/get_subscription_details/";
    const payload = {
      timezone: momentTz.tz.guess(),
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        const PlanName = "Pro(Yearly) + Smart Business Card";
        const data = res.data;
        setSubscription_details(data);
        sessionStorage.setItem("subscription_details", JSON.stringify(data));
        if (data.plan_type === PlanName) {
          setisTeam(true);
        } else {
          setisTeam(false);
        }
      })
      .catch((err) => console.log("err", err));
  };



  return (
    <div className="subscription_con">
      {ToastText.show && <Toast text={ToastText.text} />}
      {!showCard_purchase ? (
        !isUpgrade ? (
          <div className="subscription_details_con">
            <div className="subscription_details">
              <LazyLoadImage
                src={advisor_data.profile_picture}
                alt="User"
                effect="blur"
                wrapperClassName="subscription_details_img"
              />
              <div className="subscription_text">
                <h5>{advisor_data.name}</h5>
                <p>{advisor_data.email}</p>
                <p>{advisor_data.phone}</p>
              </div>
            </div>
            {ActivePlan === 1 ? (
              <div className="subscription_plan">
                <div className="subscription_plan_text">
                  <p>Current plan</p>
                  <h5>Free</h5>
                  <span>Valid forever</span>
                </div>
                <button
                  onClick={() => navigate("/account/pricing")}
                  className="get_premium"
                >
                  {diamond}Get Premium
                </button>
              </div>
            ) : (
              <>
                <div className="subscription_plan subscription_plan_pro">
                  <div className="subscription_plan_text">
                    <p>Current plan</p>
                    <h5>{subscription_details.plan_type}</h5>
                    <div className="subscription_plan_item">
                      <div>
                        <span>Purchased</span>
                        <span>: {subscription_details.start_date}</span>
                      </div>
                      <div>
                        <span>Billed</span>
                        <span>
                          : {subscription_details.start_date}{" "}
                          <CustomTooltip
                            arrow
                            title={
                              <>
                                {/* Your billing date is 7 days after
                                <br /> purchase, following a free 7-day
                                <br /> trial. You will be billed yearly. */}
                                You have the option to cancel at <br />any time within 7 days, <br />
                                 and we offer a 7-day money-back guarantee.
                              </>
                            }
                          >
                            <span>
                              <InfoOutlinedIcon className="icon" />
                            </span>
                          </CustomTooltip>
                        </span>
                      </div>
                      <div>
                        <span>Renews</span>
                        <span>: {subscription_details.renew_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="subscription_plan subscription_plan_tips">
                  <div className="subscription_plan_text">
                    <h5>Money saving tips!</h5>
                    <p>
                      Share the referral link with your loved ones to earn a
                      free month per referral.
                    </p>
                    {ActivePlan === 2 && (
                      <button
                        onClick={() => setIsUpgrade(true)}
                        className="btn-primary"
                      >
                        Upgrade to yearly (save {isTeam ? "$120" : "$51"} )
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/referral")}
                      className="btn-outline"
                    >
                      <ContentCopyIcon fontSize="small" /> Refer & earn free
                      months
                    </button>
                    <span>
                      Note: Refer a friend to NSG and earn an extra month per
                      successful referral on your subscription! Your renewal
                      date shall update automatically if your friend subscribes
                      using your referral link. Learn more about{" "}
                      <Link to="/referral">Referral</Link>.
                    </span>
                  </div>
                </div>
                <ShippingForm />
                {ActivePlan !== 2 ? (
                  <p className="subscription_contact_us">
                    <Link
                      target="_blank"
                      to="/contact-sales"
                    >
                      Contact us
                    </Link>{" "}
                    to cancel the subscription
                  </p>
                ) : (
                  <p className="subscription_contact_us">
                    <button onClick={() => setShowPause(true)}>
                      Pause here
                    </button>{" "}
                    or{" "}
                    <Link
                      target="_blank"
                      to="/contact-sales"
                    >
                      contact us
                    </Link>{" "}
                    to cancel the subscription
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <MonthlyUpgrade
            isTeam={isTeam}
            handleClose={() => setIsUpgrade(false)}
          />
        )
      ) : (
        <CardUpgrade singleCard={true} />
      )}
      {showPause && (
        <BlurPopup
          onClose={() => setShowPause(false)}
          openState={showPause}
          ComponentClass="booking_integration_popup"
        >
          <div className="blurpopup_con_wrapper booking_integration_popup_pause">
            <PauseSub onClose={() => setShowPause(false)} />
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default Subscription;





// import axios from "axios";
// import { useEffect, useState, lazy } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import momentTz from "moment-timezone";
// import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// import { styled } from "@mui/material/styles";
// import moment from "moment-timezone";
// import MonthlyUpgrade from "./Upgrade/MonthlyUpgrade";
// import { useStore } from "../../../store/advisorStore";
// import Toast from "../../../Components/Toast/Toast";
// import "./Subscription.scss";
// const BlurPopup = lazy(() => import("../../../Components/BlurPopup/BlurPopup"));
// const PauseSub = lazy(() => import("./PauseSub"));
// const ShippingForm = lazy(() => import("./ShippingForm"));
// const CardUpgrade = lazy(() => import("./Upgrade/CardUpgrade"));

// const diamond = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="25"
//     viewBox="0 0 24 25"
//     fill="none"
//   >
//     <path
//       d="M9.2 8.75L11.85 3.5H12.15L14.8 8.75H9.2ZM11.25 20.6L2.625 10.25H11.25V20.6ZM12.75 20.6V10.25H21.375L12.75 20.6ZM16.45 8.75L13.85 3.5H19L21.625 8.75H16.45ZM2.375 8.75L5 3.5H10.15L7.55 8.75H2.375Z"
//       fill="black"
//     />
//   </svg>
// );

// const CustomTooltip = styled(({ className, ...props }) => (
//   <Tooltip {...props} classes={{ popper: className }} />
// ))(({ theme }) => ({
//   [`& .${tooltipClasses.tooltip}`]: {
//     backgroundColor: "#5B5574",
//     color: "#FFF",
//     fontSize: "12px",
//     padding: "8px",
//     borderRadius: "4px",
//     fontFamily: "'Open Sans', sans-serif",
//   },
//   [`& .${tooltipClasses.arrow}`]: {
//     color: "#5B5574",
//   },
// }));



// function Subscription() {
//   const navigate = useNavigate();
//   const { advisor_data, get_advisor_data } = useStore();
//   const [ActivePlan, setActivePlan] = useState(0);
//   const [subscription_details, setSubscription_details] = useState({});
//   const [isUpgrade, setIsUpgrade] = useState(false);
//   const [showCard_purchase, setShowCard_purchase] = useState(false);
//   const [showPause, setShowPause] = useState(false);
//   const [pauseInfo, setPauseInfo] = useState(null);
//   const [finalRenewDate, setFinalRenewDate] = useState(null);
//   const [isTeam, setisTeam] = useState(false);
//   let user = JSON.parse(localStorage.getItem("user_info"));
//   const [ToastText, setToastText] = useState({
//     text: "",
//     show: false,
//   });
//   const config = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
//   };

//   useEffect(() => {
//     const pause = localStorage.getItem("pause_info");
//     if (pause) {
//       const parsed = JSON.parse(pause);
//       const now = Math.floor(Date.now() / 1000);

//       if (parsed.resumes_at > now) {
//         setPauseInfo(parsed);
//       } else {
//         localStorage.removeItem("pause_info");
//       }
//     }
//   }, []);

//   useEffect(() => {
//   const local = localStorage.getItem("pause_info");
//   if (!local) return;

//   try {
//     const localPause = JSON.parse(local);
//     if (localPause?.pause_started_at && localPause?.resumes_at) {
//       const pause_days = Math.ceil(
//         (localPause.resumes_at - localPause.pause_started_at) / 86400
//       );
//       const renewDate = subscription_details?.renew_date;
// // console.log("Final Renew Date:", renewDate);
//       if (renewDate) {
//         const updated = moment(renewDate)
//           .add(pause_days, "days")
//           .format("MMM DD, YYYY");
//         setFinalRenewDate(updated);
//         console.log("Updated Renew:", updated);
//       }
//     }
//   } catch (err) {
//     console.error("pause_info corrupted", err);
//   }
// }, [subscription_details]);

//   useEffect(() => {
//     const url = window.location.href.split("#");
//     sessionStorage.setItem("signup_data", JSON.stringify(user));
//     get_subscription_details();
//     if (Object.keys(advisor_data).length === 0) {
//       get_advisor_data(true);
//     }
//     if (url[1] === "card_purchase_success") {
//       setToastText({
//         ...ToastText,
//         text: "Smart card purchased successfully",
//         show: true,
//       });
//       window.history.pushState({}, "", "/account");
//       get_advisor_data(true);
//       card_purchase_status();
//     }
//   }, []);

//   useEffect(() => {
//     if (Object.keys(advisor_data).length !== 0) {
//       sessionStorage.setItem("advisor_data", JSON.stringify(advisor_data));
//     }
//     if (advisor_data.account_status === "Free") {
//       setActivePlan(1);
//     } else if (advisor_data.account_status === "Pro (Monthly)") {
//       setActivePlan(2);
//     } else if (
//       advisor_data.account_status === "Pro (Monthly) + Smart Business Card"
//     ) {
//       setActivePlan(2);
//     } else {
//       setActivePlan(3);
//     }
//   }, [advisor_data]);

//   useEffect(() => {
//     if (ToastText.show) {
//       setTimeout(() => {
//         setToastText({
//           ...ToastText,
//           show: false,
//         });
//       }, 4000);
//     }
//   }, [ToastText]);

  

//   useEffect(() => {
//     const url2 = window.location.pathname;
//     if (url2 === "/account/card-upgrade") {
//       setShowCard_purchase(true);
//     } else {
//       setShowCard_purchase(false);
//     }
//   }, [window.location.pathname]);

//   const card_purchase_status = () => {
//     const url = "/api/smart_card/card_purchase_status/";
//     axios
//       .post(url, { has_smart_card: true }, config)
//       .then((res) => console.log("res", res.data))
//       .catch((err) => console.log("err", err));
//   };

//   const get_subscription_details = () => {
//     const url = "api/billing/get_subscription_details/";
//     const payload = {
//       timezone: momentTz.tz.guess(),
//     };
    
//     axios
//       .post(url, payload, config)
//       .then((res) => {
//         const PlanName = "Pro(Yearly) + Smart Business Card";
//         const data = res.data;
//         setSubscription_details(data);
//         sessionStorage.setItem("subscription_details", JSON.stringify(data));
//         if (data.plan_type === PlanName) {
//           setisTeam(true);
//         } else {
//           setisTeam(false);
//         }
//       })
//       .catch((err) => console.log("err", err));
//   };



//   return (
//     <div className="subscription_con">
//       {ToastText.show && <Toast text={ToastText.text} />}
//       {!showCard_purchase ? (
//         !isUpgrade ? (
//           <div className="subscription_details_con">
//             <div className="subscription_details">
//               <LazyLoadImage
//                 src={advisor_data.profile_picture}
//                 alt="User"
//                 effect="blur"
//                 wrapperClassName="subscription_details_img"
//               />
//               <div className="subscription_text">
//                 <h5>{advisor_data.name}</h5>
//                 <p>{advisor_data.email}</p>
//                 <p>{advisor_data.phone}</p>
//               </div>
//             </div>
//             {ActivePlan === 1 ? (
//               <div className="subscription_plan">
//                 <div className="subscription_plan_text">
//                   <p>Current plan</p>
//                   <h5>Free</h5>
//                   <span>Valid forever</span>
//                 </div>
//                 <button
//                   onClick={() => navigate("/account/pricing")}
//                   className="get_premium"
//                 >
//                   {diamond}Get Premium
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="subscription_plan subscription_plan_pro">
//                   <div className="subscription_plan_text">
//                     <p>Current plan</p>
//                     <h5>{subscription_details.plan_type}</h5>
//                     <div className="subscription_plan_item">
//                       <div>
//                         <span>Purchased</span>
//                         <span>: {subscription_details.start_date}</span>
//                       </div>
//                       <div>
//                         <span>Billed</span>
//                         <span>
//                           : {subscription_details.start_date}{" "}
//                           <CustomTooltip
//                             arrow
//                             title={
//                               <>
//                                 Your billing date is 7 days after
//                                 <br /> purchase, following a free 7-day
//                                 <br /> trial. You will be billed yearly.
//                               </>
//                             }
//                           >
//                             <span>
//                               <InfoOutlinedIcon className="icon" />
//                             </span>
//                           </CustomTooltip>
//                         </span>
//                       </div>
//                       {/* <div>
//                         <span>Renews</span>
//                         <span>: {subscription_details.renew_date}</span>
//                       </div> */}
// {/* {finalRenewDate ? (
//   <div>
//     <span>
//       Renews: {finalRenewDate}
//       <span >(updated)</span>
//     </span>
//   </div>
// ) : (
//   <div>
//     <span>Renews: {subscription_details.renew_date}</span>
//   </div>
// )} */}

// <div className="plan-renew-info">
//   <div>
//     <span className="label">Renews</span>{" "}
//     <span className="date">
//       {finalRenewDate
//         ? `: ${finalRenewDate} (updated)`
//         : moment(subscription_details?.renew_date).format(": MMM DD, YYYY")}
//     </span>
//   </div>
// </div>

//                       {pauseInfo && (
//                         <span>
//                           Paused from{" "}
//                           {moment
//                             .unix(pauseInfo.pause_started_at)
//                             .format("MMM DD, YYYY")}{" "}
//                           to{" "}
//                           {moment
//                             .unix(pauseInfo.resumes_at)
//                             .format("MMM DD, YYYY")}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="subscription_plan subscription_plan_tips">
//                   <div className="subscription_plan_text">
//                     <h5>Money saving tips!</h5>
//                     <p>
//                       Share the referral link with your loved ones to earn a
//                       free month per referral.
//                     </p>
//                     {ActivePlan === 2 && (
//                       <button
//                         onClick={() => setIsUpgrade(true)}
//                         className="btn-primary"
//                       >
//                         Upgrade to yearly (save {isTeam ? "$120" : "$51"} )
//                       </button>
//                     )}
//                     <button
//                       onClick={() => navigate("/referral")}
//                       className="btn-outline"
//                     >
//                       <ContentCopyIcon fontSize="small" /> Refer & earn free
//                       months
//                     </button>
//                     <span>
//                       Note: Refer a friend to NSG and earn an extra month per
//                       successful referral on your subscription! Your renewal
//                       date shall update automatically if your friend subscribes
//                       using your referral link. Learn more about{" "}
//                       <Link to="/referral">Referral</Link>.
//                     </span>
//                   </div>
//                 </div>
//                 <ShippingForm />
//                 {ActivePlan === 1 ? (
//                   <p className="subscription_contact_us">
//                     <Link
//                       target="_blank"
//                       to="/contact-sales"
//                     >
//                       Contact us
//                     </Link>{" "}
//                     to cancel the subscription
//                   </p>
//                 ) : (
//                   <p className="subscription_contact_us">      
//                            {!pauseInfo?.resumes_at && subscription_details?.status !== "trialing" && (
//                     <button onClick={() => setShowPause(true)}>
//                       Pause here
//                     </button>
//                     )}{" "}
//                     <Link
//                       target="_blank"
//                       to="/contact-sales"
//                     >
//                       contact us
//                     </Link>{" "}
//                     to cancel the subscription
//                   </p>
//                 )}
//               </>
//             )}
//           </div>
//         ) : (
//           <MonthlyUpgrade
//             isTeam={isTeam}
//             handleClose={() => setIsUpgrade(false)}
//           />
//         )
//       ) : (
//         <CardUpgrade singleCard={true} />
//       )}
//       {showPause && (
//         <BlurPopup
//           onClose={() => setShowPause(false)}
//           openState={showPause}
//           ComponentClass="booking_integration_popup"
//         >
//           <div className="blurpopup_con_wrapper booking_integration_popup_pause">
//             <PauseSub onClose={() => setShowPause(false)} />
//           </div>
//         </BlurPopup>
//       )}
//     </div>
//   );
// }

// export default Subscription;

