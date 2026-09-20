import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLogin from "../../../Components/HeaderLogin/HeaderLogin";
import LoginSlider from "../../../Components/LoginSlider/LoginSlider";
import SyncAndIntegration from "../../Account/SyncAndIntegration/SyncAndIntegration";
import "./Onboarding.scss";

const OnboardingSyncIntegration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("jwt")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleContinue = () => {
    window.location.href = "/card";
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding_contant onboarding_contant_sync">
        <div className="onboarding_contant_top">
          <HeaderLogin />
        </div>

        <h2>Sync & integration</h2>

        <div className="onboarding-sync-wrapper">
          <SyncAndIntegration
            isOnboarding={true}
            redirectPathOnComplete="/card"
            onSkip={handleContinue}
            onComplete={handleContinue}
            oauthRedirectPath="/signup/onboarding/sync"
          />
        </div>
      </div>

      <LoginSlider />
    </div>
  );
};

export default OnboardingSyncIntegration;
