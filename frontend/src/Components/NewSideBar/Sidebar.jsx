
import React from "react";
import axios from "axios";
import { lazy, Suspense } from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ContactPageOutlinedIcon from "@mui/icons-material/ContactPageOutlined";
import PersonPinOutlinedIcon from "@mui/icons-material/PersonPinOutlined";
import AvTimerOutlinedIcon from "@mui/icons-material/AvTimerOutlined";
import Toast from "../Toast/Toast";
import { useStore } from "../../store/advisorStore";
import {
  DashboardOutlined as DashboardIcon,
  ContactsOutlined as ContactsIcon,
  CalendarMonthOutlined as ScheduleIcon,
  HelpOutlineOutlined as HelpIcon,
  FeedbackOutlined as FeedbackIcon,
  ExpandMore as ExpandIcon,
  PermIdentityOutlined as AccountIcon,
  LockReset as ResetIcon,
  PeopleOutlined as ReferIcon,
  PersonOutline as PersonOutlined,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import styles from "./Sidebar.module.scss";

const FeedbackPopup = lazy(() => import("../FeedbackPopup/FeedbackPopup"));

 function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showPopupRef, setShowPopupRef] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [EmailID, setEmailID] = useState("");
  const [user, setUser] = useState({ name: "", email: "" });
  const location = useLocation();
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  const dropdownRef = useRef(null);
  const { advisor_data, get_advisor_data } = useStore();
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  const isSuperAdmin = JSON.parse(
    localStorage.getItem("user_info")
  )?.is_superuser;
  
  const isAdmin = JSON.parse(
    localStorage.getItem("user_info")
  )?.is_team_admin;

  const data = JSON.parse(localStorage.getItem("user_info"));

  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  // const isAdminView = useMemo(
  //   () =>
  //     [
  //       "/admin-client-logs",
  //       "/analytics",
  //       "/integrations",
  //     ].includes(location.pathname),
  //   [location.pathname]
  // );

  const navItems = useMemo(() => [
    { icon: <DashboardIcon style={{ fontSize: 20, width: 20, height: 20 }} />, label: "Home", path: "/home" },
    { icon: <PersonOutlined  style={{ fontSize: 20, width: 20, height: 20 }}/>, label: "Profile", path: "/card" },
    { icon: <ContactsIcon style={{ fontSize: 20, width: 20, height: 20 }} />, label: "Contacts", path: "/people" },
    { icon: <ScheduleIcon style={{ fontSize: 20, width: 20, height: 20 }} />, label: "Schedule", path: "/calendar" },
    { icon: <HelpIcon style={{ fontSize: 20, width: 20, height: 20 }}/>, label: "Help", path: "/help" },
    { icon: <FeedbackIcon style={{ fontSize: 20, width: 20, height: 20 }} />, label: "Feedback", path: "/feedback" },

    ...(isSuperAdmin
      ? [
        {
          icon: <AccountBoxOutlinedIcon  style={{ fontSize: 20, width: 20, height: 20 }}/>,
          label: "Active User",
          path: "/user-info",
        },
        {
          icon: <AccountCircleOutlinedIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
          label: "Create Card",
          path: "/campaign",
         },
        {
          icon: <PersonSearchOutlinedIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
          label: "Popup Data",
          path: "/contact-info",
        },
        {
           icon: <AvTimerOutlinedIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
          label: "Countdown",
          path: "/countdown",
        },
      ]
      : []),
  ], [isSuperAdmin]);

  const isOnAdminPage = useMemo(() => {
  const adminPaths = [
    "/admin-dashboard",
    "/admin-client-logs",
    "/analytics",
    "/integrations",
  ];
  return adminPaths.includes(location.pathname);
}, [location.pathname]);

// const dropdownMenu = useMemo(() => [
   

//   ...(isAdmin
//     ? [
//         {
//           label: isOnAdminPage ? "My NSG Profile" : "Admin Dashboard",
//           icon: <AccountIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
//           path: isOnAdminPage ? "/card" : "/admin-dashboard",
//         },
//          ]
//     : []),
//      { label: "Account", icon: <AccountIcon style={{ fontSize: 20, width: 20, height: 20 }} />, path: "/account" },
//       {
//       label: "Reset Password",
//       icon: <ResetIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
//       path: "/reset-password-dash",
//     },
//     { label: "Refer a Friend", icon: <ReferIcon style={{ fontSize: 20, width: 20, height: 20 }}/>, path: "/referral" },
//     { label: "Logout", icon: <LogoutIcon style={{ fontSize: 20, width: 20, height: 20 }}/>, action: "logout" },
     
//   ],
//  [isSuperAdmin, isAdmin  , isOnAdminPage]
// );

const dropdownMenu = useMemo(() => [
  ...(isAdmin
    ? [
        {
          label: isOnAdminPage ? "My NSG Profile" : "Admin Dashboard",
          icon: <AccountIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
          path: isOnAdminPage ? "/card" : "/admin-dashboard",
        },
      ]
    : []),

  ...(!isOnAdminPage
    ? [
        {
          label: "Account",
          icon: <AccountIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
          path: "/account",
        },
      ]
    : []),

  {
    label: "Reset Password",
    icon: <ResetIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
    path: "/reset-password-dash",
  },
  {
    label: "Refer a Friend",
    icon: <ReferIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
    path: "/referral",
  },
  {
    label: "Logout",
    icon: <LogoutIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
    action: "logout",
  },
], [isSuperAdmin, isAdmin, isOnAdminPage]);


  const adminNavItems = useMemo(() => [
    {
      icon: <PersonPinOutlinedIcon style={{ fontSize: 20, width: 20, height: 20 }}/>,
      label: "Profiles",
      path: "/admin-dashboard",
    },
    {
      icon: <ContactPageOutlinedIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
      label: "Contacts",
      path: "/admin-client-logs",
    },
    {
      icon: <ShareOutlinedIcon style={{ fontSize: 20, width: 20, height: 20 }} />,
      label: "Integrations",
      path: "/integrations",
    },
  ],
 []
);

  const refer_friend = () => {
    setLoading(true);
    const url = "api/user/refer_friend/";
    const payload = {
      referral_email: EmailID,
      refer_code: "NSG22",
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setEmailID("");
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        swal({
          text: err.response.data.message,
          icon: "warning",
        });
      });
  };

  useEffect(() => {
    const adminPaths = [
      "/admin-dashboard",
      "/admin-client-logs",
      "/analytics",
      "/integrations",
    ];
    if (!adminPaths.includes(location.pathname)) {
      setShowAdminSidebar(false);
    }
  }, [location]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_info");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleOutsideClick = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      !avatarRef.current.contains(e.target)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
     console.log("Advisor data fetching");
    get_advisor_data();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleDropdownClick = async (item) => {
    if (item.action === "logout") {
      try {
        await axios.post("api/user/logout/");
        localStorage.removeItem("user_info");
        localStorage.removeItem("jwt");
        navigate("/signup");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    } else if (item.path) {
      if (item.path === "/admin-dashboard") {
        setShowAdminSidebar(true);
      }
      navigate(item.path);
    }
    setOpen(false);
  };

useEffect(() => {
  console.log("SIDEBAR MOUNTED");
}, []);


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

  return (
    <div className={styles.sidebar}>
      {ToastText.show && <Toast text={ToastText.text} />}
      
      <div className={styles.avatarSection}>
        <div
          ref={avatarRef}
          className={`${styles.avatarWrapper} ${open ? styles.active : ""}`}
          onClick={() => setOpen(!open)}
        >
          <div className={styles.avatarRow}>
            <div className={styles.avatar}>
              <img
                src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/0ead2662ca664af2ba2b4bcd94b9d5ec.webp"
                alt="Logo"
                className={styles.logoImg}
              />
            </div>
            <ExpandIcon className={styles.chevIcon} />
          </div>
        </div>

        {open && (
          <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.user}>
              <div className={styles.avatar}>
                <span className={styles.initial}>
                  {user.name
                    ? user.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : "U"}
                </span>
              </div>
              <div>
                <p className={styles.name}>{user.name || "User"}</p>
                <p className={styles.email}>
                  {user.email || "email@example.com"}
                </p>
              </div>
            </div>
            <div className={styles.menu}>
              {dropdownMenu.map((item, idx) => (
                <div
                  key={idx}
                  className={styles.menuItem}
                  onClick={() => handleDropdownClick(item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
     
      <div className={styles.nav}>
        {/* {showAdminSidebar && (
          <div
            className={styles.navItem}
            onClick={() => {
              setShowAdminSidebar(false);
              navigate("/dashboard");
            }}
          >
            <div className={styles.icon}>
              <DashboardIcon />
            </div>
            <div className={styles.label}>Dashboard</div>
          </div>
        )} */}

        {(showAdminSidebar ? adminNavItems : navItems).map((item, index) => {
          if (item.label === "Feedback") {
            return (
              <div
                key={index}
                className={styles.navItem}
                onClick={() => setShowFeedbackPopup(true)}
              >
                <div className={styles.icon}>{item.icon}</div>
                <div className={styles.label}>{item.label}</div>
              </div>
            );
          }

          return (
            <NavLink
              to={item.path}
              key={index}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
              end
            >
              <div className={styles.icon}>{item.icon}</div>
              <div className={styles.label}>{item.label}</div>
            </NavLink>
          );
        })}

        {!showAdminSidebar && advisor_data?.account_status === "Free" && (
          <NavLink
            to="/account/pricing"
            className={({ isActive }) =>
              isActive
                ? `${styles.premium} ${styles.activePremium}`
                : styles.premium
            }
          >
            <div className={styles.icon}>
              <DiamondOutlinedIcon />
            </div>
            <div className={styles.label}>
              Get <br />
              Premium
            </div>
          </NavLink>
        )}
      </div>

      <Suspense fallback={null}>
        {showFeedbackPopup && (
          <FeedbackPopup
            handleClose={() => setShowFeedbackPopup(false)}
            showFeedbackPopup={showFeedbackPopup}
            onSuccess={() => {
              setToastText({
                text: "Thank you for your feedback ",
                show: true,
              });
            }}
          />
        )}
      </Suspense>
    </div>
  );
}

export default React.memo(Sidebar);
