import { useRef } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import HeaderLogin from "../HeaderLogin/HeaderLogin";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./LoginSlider.scss";

const placeholderSrc =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/web_development___website_webpage_browser_ad_advertisement_man_people_mljidi_png.webp";
const placeholderSrcMobile =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/01_jqlfho_png.webp";

// const Gallery = [
//   {
//     url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/web_development___website_webpage_browser_ad_advertisement_man_people_png.webp",
//     title: "Get your professional web profile",
//     desc: "Customize your professional web profile with services, social media links, images, and videos.",
//   },
//   {
//     url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/finance_e-commerce___purchase_payment_credit_card_monitor_computer_man_people_png.webp",
//     title: "Get your digital business card",
//     desc: "Easily create and customize your NFC business card to share contact details effortlessly with a tap.",
//   },
//   {
//     url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/web_development___tasks_teamwork_team_working_together_website_webpage_people_png.webp",
//     title: "Schedule meetings in one place",
//     desc: "Integrate your calendar and set up a booking system to allow contacts to schedule meetings directly with you.",
//   },
//   {
//     url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/04_png.webp",
//     title: "Nurture client relationships",
//     desc: "Capture potential clients' contact information and nurture relationships with built-in relationship management features for client engagement.",
//   },
//   {
//     url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/weather___hot_summer_sun_sunny_heat_vacation_holiday_season_leisure_png.webp",
//     title: "Exciting referral program",
//     desc: "Enjoy the exciting referral program by earning a free month of NSG’s subscription by referring to your friends & teammates.",
//   },
// ];

const Gallery = [
  {
    url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/image_314_png.webp",
    title: "Build Your Personal Brand",
    desc: "NSG’s Virtual Business Card profile empowers you to take control of your personal brand with a dynamic and customizable solution.",
    link: "/virtual-business-card",
  },
  {
    url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/131412_png.webp",
    title: "Digital Business Card",
    desc: "Exchange your professional details with ease using our Digital Business Card. Enhance your in-person networking efforts with a dynamic profile.",
    link: "/digital-business-card",
  },
  {
    url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/2422fs3_png.webp",
    title: "Effortlessly Manage Your Contacts",
    desc: "Organize and manage all your professional contacts in one place. Keep track of who matters most with detailed histories and notes.",
    link: "/smart-contact-management",
  },
  {
    url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/4wdwfwf_png.webp",
    title: "Integrate all your tools",
    desc: "Connect your email, calendar, CRM, and meeting tools to manage every interaction in one unified place, keeping you focused and productive.",
    link: "",
  },
  {
    url: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/wfawfwf5_png.webp",
    title: "Stay Ahead with Smart Insights",
    desc: "Ensure important relationships never slip through the cracks. Use insights to set follow ups and reminders to always stay prepared.",
    link: "",
  },
];

function LoginSlider(props) {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    lazyLoad: true,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <div className="login_slider_con">
      <div className="login_slider_con_header">
        <HeaderLogin title={props.title} />
      </div>
      <div className="login_con_right_slider">
        <Slider {...settings}>
          {Gallery.map((item, index) => (
            <div className="login_con_right_slider_item" key={index}>
              <LazyLoadImage
                alt="fadeImage"
                src={item.url}
                effect="blur"
                wrapperClassName="login_right_slider_img"
                placeholderSrc={
                  isMobile ? placeholderSrcMobile : placeholderSrc
                }
              />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <Link target="_blank" to={item.link}>
                {item.link && "Learn more"}
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default LoginSlider;
