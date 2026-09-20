import { lazy } from "react";
import "./Layout.scss";

const Sidebar = lazy(() => import("../NewSideBar/Sidebar"));
// const Header = lazy(() => import("../HeaderDashboard/Header"));

function Layout({ children }) {
  return (
    <div className="layout_con">
      {/* <Header /> */}
      <div className="layout_con_wrapper">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}

export default Layout;
