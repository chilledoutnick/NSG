import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import "./Networking.scss";
const img =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1321316165_a1tnia_png.webp";
const img_mobile =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_312_krx0cd_png.webp";

function Networking(props) {
  const isMobile = window.innerWidth <= 576;
  const [marginAuto, setMarginAuto] = useState(0);

  useEffect(() => {
    $(document).ready(function () {
      let margin_left = $(".header_con_wrapper").css("margin-left");
      setMarginAuto(margin_left);
    });
  }, []);

  return (
    <div className="networking_con_v2">
      <div className="networking_con_v2_wrapper">
        <div className="networking_con_img_con">
          <LazyLoadImage
            src={isMobile ? props.imgMb : props.img}
            effect="blur"
            wrapperClassName="networking_con_img"
            alt={props.alt}
          />
        </div>

        <div className="networking_con_text">
          <h2>{props.title}</h2>
          <p>{props.desc}</p>
          <Link to="/signup/metasignup">
            Get Started For Free
            <ArrowRightAltIcon className="icon" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Networking;
