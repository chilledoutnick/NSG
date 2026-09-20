import $ from "jquery";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import "./TrustedCompany.scss";
const images = [
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_342_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_3t3t45_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/imagewfwf_109_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/gwagwagw_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_wwag114_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_1svw11_png.webp",
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/imawfwge_115_png.webp",
];

function TrustedCompany(props) {
  const scrollRight = () => {
    const containerWidth = $("#trusted_company_item").width();
    const scrollAmount = containerWidth * 1.09;
    $("#trusted_company_item").animate(
      {
        scrollLeft: `+=${scrollAmount}px`,
      },
      "slow"
    );
  };

  const scrollLeft = () => {
    const containerWidth = $("#trusted_company_item").width();
    const scrollAmount = containerWidth * 1.09;
    $("#trusted_company_item").animate(
      {
        scrollLeft: `-=${scrollAmount}px`,
      },
      "slow"
    );
  };

  return (
    <div className="trusted_company">
      <div className="trusted_company_con">
        {props.title ? (
          <h3>{props.title}</h3>
        ) : (
          <h2>Trusted by 1500+ Professionals At</h2>
        )}
        <br />
        <div className="trusted_company_imgs" id="trusted_company_item">
          {images.map((item, index) => {
            return (
              <div className="trusted_company_img_item" key={index}>
                <img src={item} alt={"company" + index} loading="lazy" />
              </div>
            );
          })}
        </div>
        <div className="use_cases_nav">
          <button onClick={scrollLeft}>
            <KeyboardArrowLeftIcon fontSize="large" />
          </button>
          <button onClick={scrollRight}>
            <KeyboardArrowRightIcon fontSize="large" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrustedCompany;
