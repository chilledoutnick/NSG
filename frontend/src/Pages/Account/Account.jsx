import { lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/advisorStore";
import "./Account.scss";

const Subscription = lazy(() => import("./Subscription/Subscription"));
const AccountInfo= lazy(() => import("./AccountInfo/AccountInfo"));
const Integrations = lazy(() => import("../Integrations/Integrations"));
const SyncAndIntegration = lazy(() =>
  import("./SyncAndIntegration/SyncAndIntegration")
);
const BottomBar = lazy(() =>
  import("../../Components/CardProfileBottomBar/BottomBar")
);
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

function Account() {
  const navigate = useNavigate();
  const { advisor_data, get_advisor_data } = useStore();
  const [activeTab, setActiveTab] = useState(1);
  const isSync = window.location.pathname === "/account/sync-and-integration";
  useEffect(() => {
    if (isSync) {
      setActiveTab(2);
    }
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
  }, []);

  return (
    <div className="account_con">
      <div className="account_header">
        <h1>Account</h1>
        {advisor_data.account_status === "Free" && (
          <button
            className="get_premium"
            onClick={() => {
              navigate("/account/pricing");
            }}
          >
            {diamond}Get Premium
          </button>
        )}
      </div>
      <div className="account_nav">
        <button
          className={activeTab === 1 ? "active_nav" : ""}
          onClick={() => setActiveTab(1)}
        >
          Account Info
        </button>
        <button
          className={activeTab === 2 ? "active_nav" : ""}
          onClick={() => setActiveTab(2)}
        >
          Subscription
        </button>
        <button
          className={activeTab === 3 ? "active_nav" : ""}
          onClick={() => setActiveTab(3)}
        >
          Sync & integration
        </button>
        <button
          className={activeTab === 4 ? "active_nav" : ""}
          onClick={() => setActiveTab(4)}
        >
          Zapier
        </button>
      </div>
      {activeTab === 1 ? (
        <AccountInfo />
      ) : activeTab === 2 ? (
        <Subscription />
      ) : activeTab === 3 ? (
        <SyncAndIntegration />
      ) : (
        <Integrations />
      )}
      <BottomBar />
    </div>
  );
}

export default Account;
