import axios from "axios";
import { useState, useEffect } from "react";
import "./ServiceList.scss";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import $ from "jquery";

function Service(props) {
  const [services, setServices] = useState([]);
  useEffect(() => {
    if (props.advisor.user_id !== undefined) {
      get_services();
    }
  }, [props.advisor.user_id]);
  const getScrollDistance = () => {
    if (window.innerWidth <= 576) {
      return 264 + 13;
    }
    return 400 + 16;
  };
  const totalServices = services ? services.length : 0;
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRight = () => {
    if (currentPage < totalServices) {
      const itemWidth = getScrollDistance();
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const newScrollLeft = (newPage - 1) * itemWidth;
      $("#service_items").animate({ scrollLeft: newScrollLeft }, 300);
    }
  };

  const scrollLeft = () => {
    if (currentPage > 1) {
      const itemWidth = getScrollDistance();
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const newScrollLeft = (newPage - 1) * itemWidth;
      $("#service_items").animate({ scrollLeft: newScrollLeft }, 300);
    }
  };

  const get_services = () => {
    axios

      .post("/api/profile_service/get_services_new/", {
        username: props.username,
      })
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => console.log(err));
  };
  const handleOpenLink = (link) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {services.length > 0 && (
        <div className="profile-service-list-con">
          <h2 className="profile-service-title">Services</h2>
          <div className="profile-service-card">
            <div className="row w-100">
              <div className="col-12">
                <div className="row profile-service-card-item-wr" id="service_items">
                  {services.map((item, index) => {
                    return (
                      <div
                        className="col-4 profile-service-card-item-main"
                        key={"it" + index}
                      >
                        <div className="profile-service-card-item">
                          <div className="profile-service-card-item-wrapper">

                  {item.service_img && (
                    <img className="service-card-img" src={item.service_img} alt="service" />
                  )}
                            <div className="service-card-content">
                            <h3 className="service-card-name">{item.name}</h3>
                            <p className="service-card-desc">{item.desc}</p>
                         
                            <button
                              onClick={() => handleOpenLink(item.url)}
                              disabled={!item.url}
                              style={{
                                opacity: item.url ? 1 : 0.5,
                                cursor: item.url ? "pointer" : "not-allowed",
                              }}
                            >
                              Open Link <OpenInNewIcon />
                            </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="profile_nav">
        <span>
          {totalServices > 0 ? `${currentPage}/${totalServices}` : ""}
        </span>
        <div>
          <button onClick={scrollLeft} disabled={currentPage === 1}>
            <KeyboardArrowLeftIcon />
          </button>
          <button
            onClick={scrollRight}
            disabled={currentPage === totalServices}
          >
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>
        </div>
      )}
      
    </>
  );
}

export default Service;
