import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ThreeDots, RotatingLines } from "react-loader-spinner";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../../Components/LoginSlider/LoginSlider";
import InputField from "../../../Components/InputField/InputField";
import "../SignUp/SignUp.scss";
import "./Redeem.scss";

const Redeem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if this component is being accessed directly via /signup/redeem
    if (window.location.pathname === "/signup/redeem") {
      const urlCode = searchParams.get("promo_code");
      if (urlCode) {
        sessionStorage.setItem("promo_code", urlCode);
      }
      // Mark the flow as a redemption flow
      sessionStorage.setItem("signup_start_url", "redeem");
      // Redirect to the general signup page
      navigate("/signup");
      return; // Prevent rendering the form
    }

    // If not directly /signup/redeem, then it's likely /signup/promo for verification
    const sessionPromoCode = sessionStorage.getItem("promo_code");
    if (sessionPromoCode) {
      setCode(sessionPromoCode);
      // Automatically verify if code is detected from session
      verifyPromoCode(sessionPromoCode);
    }
  }, [searchParams, navigate]);

  const verifyPromoCode = async (promoCode) => {
    if (!promoCode) {
      setErrorMsg("Please enter your unique license code.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      // Step 2: Verify unique license code validity from backend api
      const response = await axios.post("api/user_profile/signup_code_check/", {
        promo_code: promoCode,
      });

      // Step 3: Once verified, redirect to the usual account creation page (/domain)
      sessionStorage.setItem("promo_code", promoCode);
      navigate("/signup/domain");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 
        "Invalid or expired license code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      verifyPromoCode(code.trim());
    } else {
      setErrorMsg("Please enter your unique license code.");
    }
  };

  // If we are in the initial redirect phase, don't render the form
  if (window.location.pathname === "/signup/redeem") {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><RotatingLines strokeColor="grey" strokeWidth="5" animationDuration="0.75" width="96" visible={true} /></div>;
  }

  return (
    <div className="signup_con">
      <div className="signup_con_left">
        <div className="signup_con_left_wrapper">
          <div className="signup_con_left_header">
            <HeaderLogin title="Verify License Code" Redirect={true} />
          </div>
          <div className="redeem_content" style={{ marginTop: "40px" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Unlock Lifetime Access</h2>
            <p className="login_left_term" style={{ marginBottom: "24px", color: "#666" }}>
              Please enter the unique license code you received after purchase to unlock your lifetime plan limits instantly.
            </p>
            <form onSubmit={handleSubmit}>
              <InputField
                name="promo_code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErrorMsg("");
                }}
                label="Enter License Code*"
                type="text"
                className={"login_input " + (errorMsg ? "error_border" : "")}
                autoComplete="off"
              />
              {errorMsg && (
                <p className="error_text w-100 mb-3" style={{ marginTop: "-10px" }}>{errorMsg}</p>
              )}
              <button type="submit" className="cta-btn" style={{ marginTop: "16px" }} disabled={loading || !code}>
                {!loading ? "Verify & Continue" : <ThreeDots height="25" width="60" color="black" visible={true} />}
              </button>
            </form>
          </div>
        </div>
      </div>
      <LoginSlider title="Redeem your lifetime license" />
    </div>
  );
};

export default Redeem;