import { Suspense, lazy, useState, useEffect } from "react";
import "./App.scss";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import "react-loading-skeleton/dist/skeleton.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useLocation } from "react-router-dom";
import Shipping from "./Pages/BusinessLandingPage/shipping/Shipping.jsx";
import CreateYourCard from "./Pages/BusinessLandingPage/Create your card/CreateYourCard.jsx";

const REACT_APP_SUPRSEND_PUBLIC_KEY =
  "SS.PUBK.orfqmlPCOMkf2bS-sv5jExE16zqdomAhLekmqMnXJhA"; // Replace with your actual public key

const Profile = lazy(
  () => import("./Pages/Profile/UserProfile/UserProfile.jsx"),
);
const NotFound = lazy(() => import("./Pages/NotFound/NotFound"));
const Integrations = lazy(() => import("./Pages/Integrations/Integrations"));
const Calendar = lazy(() => import("./Pages/Calendar/Calendar"));
const Account = lazy(() => import("./Pages/Account/Account"));
const ClientLogs = lazy(() => import("./Pages/ClientLogsPage/ClientLogs"));
const Help = lazy(() => import("./Pages/Help/Help"));
const Referral = lazy(() => import("./Pages/Referral/Referral"));
const Feedback = lazy(() => import("./Pages/Feedback/Feedback"));
const Communication = lazy(() => import("./Pages/Communication/Communication"));
const ForgotPassword = lazy(
  () => import("./Pages/ForgotPasswordPage/ForgotPassword"),
);
const UserInfo = lazy(() => import("./Pages/SuperAdmin/UserInfo"));
const CountDownTimer = lazy(
  () => import("./Pages/SuperAdmin/CountDownTimer.jsx"),
);
const Booking = lazy(() => import("./Pages/Booking/Booking"));
const ConfirmBooking = lazy(() => import("./Pages/Booking/ConfirmBooking"));
const ContactInfo = lazy(() => import("./Pages/SuperAdmin/ContactInfo"));
const Campaign = lazy(() => import("./Pages/SuperAdmin/Campaign"));
const ResetPassword = lazy(
  () => import("./Pages/ResetPasswordPage/ResetPassword"),
);
const ResetPasswordDash = lazy(
  () => import("./Pages/ResetPasswordPage/Dashboard/ResetPasswordDash"),
);
const OTP = lazy(() => import("./Pages/OtpPage/OTP"));
const PricingCheckout = lazy(
  () => import("./Pages/LoginAndSignUP/PricingCheckout/Payment"),
);
const DomainSelection = lazy(
  () => import("./Pages/LoginAndSignUP/DomainSelection/DomainSelection"),
);
const PricingCard = lazy(
  () => import("./Pages/LoginAndSignUP/PricingV3/PricingV3"),
);

const SignupPage = lazy(() => import("./Pages/LoginAndSignUP/SignUp/SignUp"));
const MetaSignupPage = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup/MetaSignup"),
);
const MetaSignupPage2 = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup2/MetaSignup2.jsx"),
);
// const MetaSignupForm = lazy(() =>
//   import("./Pages/LoginAndSignUP/MetaSignup2/MetaSignupForm.jsx")
// );
const MetaPricing = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup2/MetaPricing.jsx"),
);
const MetaCoupon = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup2/MetaCoupon.jsx"),
);
const MetaDemo = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup2/MetaDemo.jsx"),
);
const CMS = lazy(() => import("./Pages/CMS/Gallery"));
const TemplateThree = lazy(
  () => import("./Pages/ProfileEdit/UserProfileEdit/UserProfileEdit.jsx"),
);
const Admin = lazy(() => import("./Pages/Admin/Admin"));
const People = lazy(() => import("./Pages/People/People"));
const Home = lazy(() => import("./Pages/Home/Home.jsx"));
const LayoutDashboard = lazy(
  () => import("./Components/LayoutDashboard/LayoutDashboard"),
);
const BookDemo = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup2/Bookdemo.jsx"),
);
const MetaConfirmBook = lazy(
  () => import("./Pages/LoginAndSignUP/MetaSignup2/MetaConfirmBook.jsx"),
);
const ProfileV2 = lazy(() => import("./Pages/ProfileV2/ProfileV2.jsx"));

const Agent = lazy(() => import("./Pages/Agent/Agent.jsx"));
const Onboarding = lazy(
  () => import("./Pages/LoginAndSignUP/Onboarding/Onboarding.jsx"),
);
const OnboardingSyncIntegration = lazy(
  () =>
    import(
      "./Pages/LoginAndSignUP/Onboarding/OnboardingSyncIntegration.jsx"
    ),
);

const SmartBusinessCard = lazy(
  () => import("./Pages/BusinessLandingPage/smartBusinessCard.jsx"),
);

const SelectYourCard = lazy(
  () => import("./Pages/BusinessLandingPage/SelectYourCard.jsx"),
);
const ChooseYourCard = lazy(
  () => import("./Pages/BusinessLandingPage/ChooseYourCard/ChooseYourCard.jsx"),
);

const PersonalizeCard = lazy(
  () => import("./Pages/BusinessLandingPage/personlized/PersonalizeCard.jsx"),
);
const Software = lazy(
  () => import("./Pages/BusinessLandingPage/software/Software.jsx"),
);

const PaymentCheckout = lazy(
  () => import("./Pages/BusinessLandingPage/Payment/PaymentCheckout.jsx"),
);

const ThankYou = lazy(
  () => import("./Pages/BusinessLandingPage/thankyou/ThankYou.jsx"),
);

const Redeem = lazy(
  () => import("./Pages/LoginAndSignUP/Redeem/Redeem.jsx"),
);

// const CheckoutWrapper = lazy(() =>
//   import("./Pages/BusinessLandingPage/Payment/CheckoutWrapper.jsx")
// );

function App() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const loggedIn = localStorage.getItem("jwt") !== null;
  let apiUrl = window.REACT_APP_API_URL;
  if (!apiUrl || apiUrl === "{{ api_url }}") {
    apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
  }
  axios.defaults.baseURL = apiUrl;

  const username = window.location.pathname.split("/")[1];
  const pathname = window.location.pathname.split("/")[2];
  const meetDuration = window.location.pathname.split("/")[3];

  const location = useLocation();


  useEffect(() => {
    if (typeof window !== "undefined" && !window.calendlyPreloaded) {
      window.calendlyPreloaded = true;

      const link = document.createElement("link");

      link.rel = "preload";

      link.href = "https://assets.calendly.com/assets/external/widget.js";

      link.as = "script";

      document.head.appendChild(link);

      const preconnect1 = document.createElement("link");

      preconnect1.rel = "preconnect";

      preconnect1.href = "https://assets.calendly.com";

      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement("link");

      preconnect2.rel = "preconnect";

      preconnect2.href = "https://calendly.com";

      document.head.appendChild(preconnect2);
    }
  }, []);

  useEffect(() => {
    handleRoutes();
    isTokenValid();
    getCustomUsername();
    $("#preloader").css("display", "none");
  }, []);

  const getCustomUsername = async () => {
    try {
      const { data } = await axios.post(
        "/api/user_profile/get_custom_username/",
        {
          custom_username: username,
        },
      );
      const { username: customUsername } = data;
      const basePath = `/${customUsername}`;
      if (pathname === "booking") {
        setRoutes((current) => [
          ...current,
          {
            element: <Booking isExternal={true} username={customUsername} />,
            path: `${basePath}/booking`,
          },
        ]);
        if ([15, 30, 45, 60].includes(Number(meetDuration))) {
          setRoutes((current) => [
            ...current,
            {
              element: <Booking isExternal={true} username={customUsername} />,
              path: `${basePath}/booking/${meetDuration}`,
            },
          ]);
          navigate(`${basePath}/booking/${meetDuration}`);
        } else {
          navigate(`${basePath}/booking`);
        }
      } else {
        console.log(basePath);
        setRoutes((current) => [
          ...current,
          { element: <Profile />, path: basePath },
        ]);
        // ✅ Preserve query params like ?preview=true
        navigate({
          pathname: basePath,
          search: window.location.search, // this keeps ?preview=true
        });
      }
    } catch (error) {
      console.error("Error fetching custom username:", error);
    }
  };

  const isTokenValid = async () => {
    if (loggedIn) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        };
        await axios.post("api/user/is_token_valid/", {}, config);
        console.log("Token Valid");
      } catch (error) {
        logout();
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post("api/user/logout/");
      localStorage.removeItem("user_info");
      localStorage.removeItem("jwt");
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const RedirectWithHistory = () => {
    const location = useLocation();

    useEffect(() => {
      // Save where the user was trying to go (e.g., /contact/john-doe)
      localStorage.setItem("post_login_redirect", location.pathname);
    }, [location]);

    return <Navigate to="/login" replace />;
  };
  const handleRoutes = () => {
    const commonRoutes = [
      { element: <SignupPage />, path: "/signup" },
      { element: <MetaSignupPage />, path: "/metasignup" },
      { element: <MetaSignupPage2 />, path: "/metasignup2" },
      // { element: <MetaSignupForm />, path: "/metasignup2/info" },
      { element: <MetaCoupon />, path: "/metasignup2/offer" },
      { element: <BookDemo />, path: "/bookdemo" },
      { element: <MetaConfirmBook />, path: "/metasignup2/metaconfirmbook" },
      { element: <MetaPricing />, path: "/metasignup2/pricing" },
      { element: <MetaDemo />, path: "/metasignup2/metademo" },
      { element: <PricingCard />, path: "/signup/pricing" },
      { element: <DomainSelection />, path: "/signup/domain" },
      { element: <PricingCheckout />, path: "/signup/checkout" },
      { element: <SignupPage />, path: "/signup/:signup_url" },
      { element: <ForgotPassword />, path: "/forgot-password" },
      { element: <ResetPassword />, path: "/reset-password" },
      { element: <ConfirmBooking />, path: "/confirm-booking" },
      { element: <OTP />, path: "/otp-password" },
      { element: <CMS />, path: "/cms" },
      { element: <NotFound />, path: "*" },
      { element: <Agent />, path: "/agent" },
      { element: <Onboarding />, path: "/signup/onboarding" },
      {
        element: <OnboardingSyncIntegration />,
        path: "/signup/onboarding/sync",
      },
      // { element: <People />, path: "/contact/:publicIdSlug" },
      { element: <SmartBusinessCard />, path: "/smart-business-card" },
      { element: <ChooseYourCard />, path: "/choose-your-smart-card" },
      { element: <SelectYourCard />, path: "/select-your-card" },
      { element: <PersonalizeCard />, path: "/personalize-card" },
      { element: <CreateYourCard />, path: "/create-your-card" },
      // { element: <Software />, path: "/software" },
      { element: <Shipping />, path: "/shipping-method" },
      { element: <ThankYou />, path: "/thankyou" },
      { element: <ThankYou />, path: "/thank-you" },
      { element: <PaymentCheckout />, path: "/payment-checkout" },
      { element: <Redeem />, path: "/signup/redeem" },
      { element: <Redeem />, path: "/signup/promo" },
    ];

    const loggedOutRoutes = [
      { element: <Navigate to="/signup" />, path: "/login" },
      { element: <Navigate to="/signup" />, path: "/home" },
      { element: <Navigate to="/signup" />, path: "/dashboard" },
      { element: <Navigate to="/login" />, path: "/card" },
      { element: <Navigate to="/login" />, path: "/account" },
      { element: <RedirectWithHistory />, path: "/people" },
      { element: <RedirectWithHistory />, path: "/contact/:publicIdSlug" },
      { element: <Navigate to="/login" />, path: "/admin-dashboard" },
      { element: <Navigate to="/login" />, path: "/setting" },
      { element: <Navigate to="/login" />, path: "/integrations" },
      { element: <Navigate to="/login" />, path: "/referral" },
      { element: <Navigate to="/login" />, path: "/calendar" },
      { element: <Navigate to="/login" />, path: "/client-logs" },
      { element: <Navigate to="/login" />, path: "/admin-client-logs" },
      { element: <Navigate to="/login" />, path: "/communication" },
      { element: <Navigate to="/login" />, path: "/refer" },
      { element: <Navigate to="/login" />, path: "/campaign" },
      { element: <Navigate to="/login" />, path: "/contact-info" },
      { element: <Navigate to="/login" />, path: "/feedback" },
      { element: <Navigate to="/login" />, path: "/user-info" },
      { element: <Navigate to="/login" />, path: "/analytics" },
      { element: <Navigate to="/login" />, path: "/reset-password-dash" },
    ];
    const loggedInRoutes = [
      { element: <Navigate to="/card" />, path: "/login" },
      {
        element: <Navigate to="/signup/onboarding" />,
        path: "/signup/onboarding",
      },
    ];

    setRoutes([
      ...commonRoutes,
      ...(loggedIn ? loggedInRoutes : loggedOutRoutes),
    ]);
  };

  const DashboardRoutes = [
    { element: <Onboarding />, path: "/signup/onboarding" },
    {
      element: <OnboardingSyncIntegration />,
      path: "/signup/onboarding/sync",
    },
    { element: <ProfileV2 />, path: "/card" },
    { element: <Home />, path: "/home" },
    { element: <Navigate to="/home" />, path: "/dashboard" },
    { element: <Account />, path: "/account" },
    { element: <Account />, path: "/account/card-upgrade" },
    { element: <Account />, path: "/account/sync-and-integration" },
    { element: <Calendar />, path: "/calendar" },
    { element: <ClientLogs />, path: "/client-logs" },
    { element: <Referral />, path: "/referral" },
    { element: <Communication />, path: "/communication" },
    { element: <Help />, path: "/help" },
    { element: <Feedback />, path: "/feedback" },
    { element: <Admin />, path: "/admin-dashboard" },
    { element: <ClientLogs />, path: "/admin-client-logs" },
    { element: <Integrations />, path: "/integrations" },
    { element: <UserInfo />, path: "/user-info" },
    { element: <CountDownTimer />, path: "/countdown" },
    { element: <ContactInfo />, path: "/contact-info" },
    { element: <Campaign />, path: "/campaign" },
    { element: <People />, path: "/people" },
    { element: <People />, path: "/contact/:publicIdSlug" },
    { element: <ResetPasswordDash />, path: "/reset-password-dash" },
    { element: <PricingCard />, path: "/account/pricing" },
    { element: <PricingCheckout />, path: "/account/checkout" },
    { element: <DomainSelection />, path: "/account/domain" },
  ];

  return (
    <Suspense fallback={<div id="preloader"></div>}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path.replace("/", "")}
            path={route.path}
            element={route.element}
          />
        ))}
        {loggedIn && (
          //     <SuprSendProvider
          //   publicApiKey={REACT_APP_SUPRSEND_PUBLIC_KEY}
          //   distinctId={
          //     localStorage.getItem("user_info")
          //       ? JSON.parse(localStorage.getItem("user_info")).user_id
          //       : null
          //   }
          //   userToken={localStorage.getItem("jwt")}
          // >
          <Route path="/" element={<LayoutDashboard />}>
            {DashboardRoutes.map((route) => (
              <Route
                key={route.path.replace("/", "")}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
          // </SuprSendProvider>
        )}
      </Routes>
    </Suspense>
  );
  // return (
  //   <Suspense fallback={<div id="preloader"></div>}>
  //     <TawkToWidget />
  //     {loggedIn ? (
  //       <SuprSendProvider
  //         publicApiKey={REACT_APP_SUPRSEND_PUBLIC_KEY}
  //         distinctId={
  //           localStorage.getItem("user_info")
  //             ? JSON.parse(localStorage.getItem("user_info")).user_id
  //             : null
  //         }
  //         userToken={localStorage.getItem("user_info").suprsend_token}
  //       >
  //         <Routes>
  //           {routes.map((route) => (
  //             <Route
  //               key={route.path.replace("/", "")}
  //               path={route.path}
  //               element={route.element}
  //             />
  //           ))}
  //         </Routes>
  //       </SuprSendProvider>
  //     ) : (
  //       <Routes>
  //         {routes.map((route) => (
  //           <Route
  //             key={route.path.replace("/", "")}
  //             path={route.path}
  //             element={route.element}
  //           />
  //         ))}
  //       </Routes>
  //     )}
  //   </Suspense>
  // );
}

export default App;
