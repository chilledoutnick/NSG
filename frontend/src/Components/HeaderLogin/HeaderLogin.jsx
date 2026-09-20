// import { LazyLoadImage } from "react-lazy-load-image-component";
// import "./HeaderLogin.scss";

// const NSGLogo =
//   "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1_png_DSjkWEw.webp";

// function HeaderLogin(props) {
//   return (
//     <button
//       className="header_login_con"
//       onClick={() => {
//         if (props.Redirect) {
//           window.location.assign("/");
//         }
//       }}
//     >
//       <LazyLoadImage
//         alt="User"
//         effect="blur"
//         src={NSGLogo}
//         wrapperClassName="login_left_logo"
//       />
//       <h4>{props.title}</h4>
//     </button>
//   );
// }

// export default HeaderLogin;

import { LazyLoadImage } from "react-lazy-load-image-component";
import "./HeaderLogin.scss";

const NSGLogo =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1_png_DSjkWEw.webp";

function HeaderLogin({ title, Redirect = true, disableRedirect = false }) {
  return (
    <div
      className="header_login_con"
      onClick={() => {
        if (Redirect && !disableRedirect) {
          window.location.assign("/");
        }
      }}
      style={{ cursor: disableRedirect ? "default" : "pointer" }}
    >
      <LazyLoadImage
        alt="NSG logo"
        effect="blur"
        src={NSGLogo}
        wrapperClassName="login_left_logo"
      />
      <h4>{title}</h4>
    </div>
  );
}

export default HeaderLogin;
