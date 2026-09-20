import { Link, useNavigate } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

import logo from "./img/Logo.png";
import "./ResFooter.scss";
import "./Responsive.scss";

function ResFooter() {
  const navigate = useNavigate();

  return (
    <div className="meta_footer_con">
      <div className="meta_footer_con_wrapper">
        <div className="res-footer-right-top">
          <div>
            <Link
              to="https://www.linkedin.com/company/nsg/?viewAsMember=true"
              target="_blank"
              className="footer-social-btn"
            >
              <LinkedInIcon />
            </Link>
            <Link
              to="https://m.facebook.com/people/NSG/100089010861110/"
              target="_blank"
              className="footer-social-btn"
            >
              <FacebookIcon />
            </Link>
            <Link
              to="https://www.instagram.com/nsg.co/"
              target="_blank"
              className="footer-social-btn"
            >
              <InstagramIcon />
            </Link>
          </div>
          <p className="Copyright">
            Copyright © 2025 NSG. All rights reserved.
          </p>
        </div>
        <button
          className="res-footer-right-bottom"
          onClick={() => navigate("/")}
        >
          <img
            loading="lazy"
            alt="logo"
            className="res-footer-right-logo"
            src={logo}
          />
        </button>
      </div>
    </div>
  );
}

export default ResFooter;
