import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Toast from "../../../Components/Toast/Toast";
import "./MetaSignup3.scss";

function MetaCoupon() {
  const navigate = useNavigate();
  const location = useLocation();
  let local_signup_info = JSON.parse(
    sessionStorage.getItem("local_signup_info")
  );
  let fullName = local_signup_info?.name.split(" ");
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });

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

  const handleClick = () => {
    if (location.pathname !== "/metasignup2/metademo") {
      navigate("/metasignup2/metademo");
    }
  };

  return (
    <div className="meta_signup3_received">
      {ToastText.show && <Toast text={ToastText.text} />}
      <div className="meta_signup3_button">
        <button
  type="button"
  className="cta-btn"
  onClick={() => navigate("/bookdemo")}
>
  Book A Demo
</button>

      </div>
      <img
        src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1_png_DSjkWEw.webp"
        alt="NSG"
        className="meta_logo"
        loading="lazy"
      />
      <h3>
        <span>Hey {fullName && fullName[0]}!</span> 👋
      </h3>
      <p style={{ marginBottom: 49 }}>
        {/* Welcome to NSG! As <br /> promised, your exclusive NSG <br />{" "}
        offer is included below */}
        Welcome to NSG! As  <br /> promised, your exclusive NSG  <br /> offer is included below
      </p>
      {/* <p>
        But before you dive in, let's check if
        <br /> NSG is the right fit for you in
        <br /> three simple steps
      </p> */}
      <p>
      Before you dive in, let’s schedule a 30- <br />
      minute demo to see if NSG is <br /> the right fit for your business.
      </p>
      <div className="meta_signup3_coupon">
        <div className="meta_signup3_coupon_wrapper">
          <img
            src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/discount-coupon_png.webp"
            alt="coupon"
          />
          <div>
            {/* <h5>50OFFNSG</h5>
            <span>Code to unlock 50% off</span> */}
            
            <span>Unlock 50% off</span>
<h5>50OFFNSG</h5>
          </div>
        </div>
        {/* <h4>Will be auto-applied at checkout</h4> */}
        <h4>Automatically applied during your demo</h4>
      </div>
    </div>
  );
}

export default MetaCoupon;
