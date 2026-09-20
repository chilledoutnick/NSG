// import React from "react";
// import "./footernew.scss";

// const Footer = () => {
//   return (
//     <footer className="nsg-footer">
//       <div className="footer-container">
//         {/* Top Section - Two Columns */}
//         <div className="footer-top">
//           {/* Left Column - Social Media */}
//           <div className="footer-column">
//             <h3 className="footer-heading">Social Media</h3>
//             <ul className="footer-links">
//               <li>
//                 <a
//                   href="https://instagram.com/nsg"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Instagram
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="https://linkedin.com/company/nsg"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Linkedin
//                 </a>
//               </li>
//               <li>
//                 <a
//                   href="https://facebook.com/nsg"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   Facebook
//                 </a>
//               </li>
//             </ul>
//           </div>
//           {/* Right Column - Contact */}
//           <div className="footer-column">
//             <h3 className="footer-heading">Contact</h3>
//             <ul className="footer-links">
//               <li>
//                 <a href="mailto:team@nsgcrm.com">team@nsgcrm.com</a>
//               </li>
//               <li>
//                 <a href="tel:+16056050394">+1 605-605-0394</a>
//               </li>
//             </ul>
//           </div>
//         </div>

//         {/* Bottom Section - Logo & Copyright */}
//         <div className="footer-bottom">
//           <div className="footer-logo">
//             {/* Person/figure icon matching Figma design */}
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <circle cx="12" cy="7" r="4" fill="currentColor" />
//               <path
//                 d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//               />
//             </svg>
//             <span className="footer-brand-name">NSG</span>
//           </div>
//           <p className="footer-copyright">
//             Copyright © 2026 NSG. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";
import "./footernew.scss";

const Footer = () => {
  return (
    <footer className="nsg-footer">
      <div className="footer-container">
        {/* LEFT — Social Media + Contact + Copyright */}
        <div className="footer-left">
          <div className="footer-top">
            {/* Social Media */}
            <div className="footer-column">
              <h3 className="footer-heading">Social Media</h3>
              <ul className="footer-links">
                <li>
                  <a
                    href="https://www.instagram.com/nsg.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/nsg/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Linkedin
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/people/NSG/100089010861110/?_rdr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h3 className="footer-heading">Contact</h3>
              <ul className="footer-links">
                <li>
                  <a href="mailto:team@nsgcrm.com">team@nsgcrm.com</a>
                </li>
                <li>
                  <a href="tel:+16056050394">+1 605-605-0394</a>
                </li>
              </ul>
            </div>
          </div>

          <p className="footer-copyright desktopp">
            Copyright © 2026 NSG. All rights reserved.
          </p>
        </div>

        {/* RIGHT — Logo only */}
        <div className="footer-right">
          <div className="footer-logo">
            <img
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Logo_png.webp"
              alt=""
            />
          </div>
          <p className="footer-copyright mobilee">
            Copyright © 2026 NSG. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
