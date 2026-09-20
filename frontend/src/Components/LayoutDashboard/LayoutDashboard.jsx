import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import "./LayoutDashboard.scss";

// const Sidebar = lazy(() => import("../Sidebar/Sidebar"));
const Sidebar = lazy(() => import("../NewSideBar/Sidebar"));
// const Header = lazy(() => import("../HeaderDashboard/Header"));
const Loader = lazy(() => import("../Loader/Loader"));

function LayoutDashboard() {
  const pathname = window.location.pathname;
  return (
    <div 
      className={
        "layout_dashboard_con " +
        (pathname === "/people" ? "people_layout_dashboard_con" : "")
      }
    >
       {/* <Header /> */}
      <div className="layout_con_wrapper">
        <Sidebar /> 
        <div className="layout_outlet">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default LayoutDashboard;
