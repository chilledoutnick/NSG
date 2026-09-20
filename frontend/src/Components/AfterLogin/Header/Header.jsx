import logo from "./img/logo.png";
import logoShort from "./img/logoShort.png";
import "./Header.scss";

function Header() {
  return (
    <div className="header-con">
      <div className="header-con-wrapper">
        <button onClick={() => window.location.assign("/")}>
          <img loading="lazy" className="header-logo" alt="logo" src={logo} />
          <div className="header-con-mobile">
            <img loading="lazy" alt="logo" src={logoShort} />
            <h1>NSG</h1>
            <div></div>
          </div>
        </button>
      </div>
    </div>
  );
}
export default Header;
