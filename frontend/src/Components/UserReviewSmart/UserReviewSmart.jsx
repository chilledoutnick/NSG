import  { useState } from "react";
import $ from "jquery";
import Rating from "@mui/material/Rating";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import "./UserReviewSmart.scss";

const Reviews = [
  {
    public_review_id: 39,
    email: "avsxvizion@gmail.com",
    name: "Charles  Jenkins",
    ratings: 5,
    comments:
      "Very good product, very well thought out and the staff are truly amazing to work with. Thank you for such a great service.",
    create_date: "2025-06-02",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Charles%20%20Jenkins/9d55cba7.webp",
    company: "SC Home Service",
  },
  {
    public_review_id: 38,
    email: "rjhundal@gmail.com",
    name: "RAJA HUNDAL",
    ratings: 5,
    comments:
      "It’s so great app. I love collecting people contact information with just scan of bar code. \nIt helps me to organize with my network.",
    create_date: "2025-05-25",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Raja%20Hundal/0593d9f3.webp",
    company: "Self Employed",
  },
  {
    public_review_id: 31,
    email: "info@manifestwellness.us",
    name: "Linda Pinckney",
    ratings: 5,
    comments:
      "This app is very easy to use. I like the layout of the Profile Options. The Website, Video and Social Media links are easy to locate and share.",
    create_date: "2025-03-14",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Linda%20Pinckney/aae517b4.webp",
    company: "Manifest Wellness LLC",
  },
  {
    public_review_id: 30,
    email: "noblemediam@gmail.com",
    name: "Shirin Ganji",
    ratings: 5,
    comments:
      "An amazing app to keep all your contacts in one place, and easy to use and navigate. Clean interface and centralizes all your contact info for your business in one place. Highly recommend :)",
    create_date: "2025-02-01",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Shirin%20Ganji/cropped-image.webp",
    company: "Noble Media Marketing",
  },
  {
    public_review_id: 29,
    email: "d.laurin@collabhive.ca",
    name: "Danielle Laurin",
    ratings: 5,
    comments:
      "Very intuitive interface, and helpful introductory email - thank you!",
    create_date: "2024-10-29",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Danielle%20Laurin/cropped-image_5MAGfpq.webp",
    company: "CollabHive",
  },
  {
    public_review_id: 27,
    email: "shekinahalhatimy@gmail.com",
    name: "Shekinah Al-Hatimy",
    ratings: 5,
    comments: "I love using this product!",
    create_date: "2024-09-14",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/cropped-image.webp",
    company: "Blood Moon Empire",
  },
  {
    public_review_id: 25,
    email: "t.shoko@umliloenergy.com",
    name: "Tim Shoko",
    ratings: 5,
    comments: "Amazing app",
    create_date: "2024-08-22",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Timukudze%20Shoko/cropped-image.webp",
    company: "Umlilo Energy",
  },
  {
    public_review_id: 24,
    email: "info@novafilsep.ca",
    name: "Lalit",
    ratings: 5,
    comments:
      "very useful. zapier automation is the best feature very innovative",
    create_date: "2024-08-10",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Lalit/cropped-image.webp",
    company: "Water Treatment Consultant at Nova Filsep Canada",
  },
  {
    public_review_id: 23,
    email: "mainatire@gmail.com",
    name: "Abubakar A Maina",
    ratings: 5,
    comments:
      "Very good company to start your business card with them. Very loyal and respectful and  willing to help you as much as they can. they make everything easier for you.",
    create_date: "2024-07-08",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Abubakar%20A%20Maina/cropped-image_wOxQMiv.webp",
    company: "Maina home tire service ",
  },
  {
    public_review_id: 21,
    email: "vuyo@propela.co",
    name: "Vuyo Pakade",
    ratings: 4,
    comments:
      "Great product and love the business card. There’s some minor bugs under the contact section.",
    create_date: "2024-06-19",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Vuyo%20Pakade/rotated_image.webp",
    company: "Propela Labs",
  },
  {
    public_review_id: 20,
    email: "lorraine.andrew@gmail.com",
    name: "Lorraine West",
    ratings: 5,
    comments:
      "This is the best product love the schedule feature has everything you need to keep you on track with your business",
    create_date: "2024-06-13",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Lorraine%20West/rotated_image.webp",
    company: 'LC"s Custom Crates and Baskets',
  },
  {
    public_review_id: 19,
    email: "hireprosonly@gmail.com",
    name: "Fabricio Paul Welch",
    ratings: 5,
    comments:
      "NSG Business card empowers professionals worldwide, streamlining connections and boosting productivity. I am delighted with their product.",
    create_date: "2024-04-01",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Fabricio%20Paul%20Welch%20/Paul.webp",
    company: "Founder & CEO at HireProsOnly",
  },
  {
    public_review_id: 15,
    email: "SS@gmail.com",
    name: "Shweta Sharma",
    ratings: 4,
    comments:
      "NSG Business Website has taken my business to new heights, redefining how we operate. Their user-friendly scheduling and unwavering professionalism have made my work life so much smoother. With their dedication and honesty, NSG has earned my trust and become an indispensable partner. Thank you",
    create_date: "2023-10-21",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/NSG/user_profile_picture.png",
    company: "",
  },
  {
    public_review_id: 14,
    email: "bettyline.odimegwu@gmail.com",
    name: "Betty",
    ratings: 5,
    comments:
      "Truly, my partnering with NSG took my business to a different dimension. NSG gave my business a good standard of operation. It Built more convenient and easy way of scheduling meetings and getting them done at ease. I thank you for all the good work, your touch of professionalism, honesty and dedication to your work makes me to trust you always.",
    create_date: "2023-10-16",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/Betty/pic.jpeg",
    company: "Family Financial Doctor",
  },
  {
    public_review_id: 9,
    email: "sidharth_pawar@yahoo.com",
    name: "Sidharth Pawar",
    ratings: 4,
    comments:
      "Ever since I began using the nsg booking system, I've noticed a significant decrease in canceled and rescheduled meetings. It has genuinely enhanced my meeting experiences and significantly boosted my productivity at work.",
    create_date: "2023-06-17",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/NSG/user_profile_picture.png",
    company: "",
  },
  {
    public_review_id: 12,
    email: "rahulverma@gmail.com",
    name: "Rahul Verma",
    ratings: 5,
    comments:
      "Utilizing the nsg dashboard, I regularly send informative emails to both existing clients and prospects, offering them valuable tips to maximize their savings. This strategic approach not only fosters trust but also attracts repeat clients, ultimately benefiting my business.",
    create_date: "2023-06-17",
    profile_picture:
      "https://storage.googleapis.com/nsg-db-storage-public/media/img/NSG/user_profile_picture.png",
    company: "",
  },
];

function UserReviewSmart(props) {
  const [expanded, setExpanded] = useState(undefined);

  const scrollRight = () => {
    const containerWidth = $("#card_user_review_right").width();
    const scrollAmount = containerWidth * 1;
    $("#card_user_review_right").animate(
      {
        scrollLeft: `+=${scrollAmount}px`,
      },
      "slow"
    );
  };

  const scrollLeft = () => {
    const containerWidth = $("#card_user_review_right").width();
    const scrollAmount = containerWidth * 1;
    $("#card_user_review_right").animate(
      {
        scrollLeft: `-=${scrollAmount}px`,
      },
      "slow"
    );
  };

  return (
    <div className="card_user_review2" id="review">
      <div className="card_user_review_con">
        <div className="card_user_review_left">
          <h3>
            Hear it from
            <span>our Users</span>
          </h3>
          <p>
            {!props.hideDesc &&
              "Trusted by hundreds of professionals, businesses and their teams."}
          </p>
        </div>
        <div className="card_user_review_right" id="card_user_review_right">
          {Reviews.map((item, index) => {
            return (
              <button
                onClick={() => {
                  if (expanded !== index) {
                    setExpanded(index);
                  } else {
                    setExpanded(undefined);
                  }
                }}
                style={{ maxHeight: expanded === index ? "none" : "290px" }}
                className="user_review_item"
                key={"user_review" + index}
              >
                <div className="read_more_con">
                  <div className="rating_con">
                    <Rating
                      name="read-only"
                      value={item.ratings}
                      readOnly
                      className="rating_star"
                    />
                  </div>
                  <p>
                    {expanded === index
                      ? item.comments
                      : item.comments.slice(0, 130) +
                        (item.comments.length > 130 ? "..." : "")}
                  </p>
                  {item.comments.length > 130 && (
                    <p className="read-more-button">
                      {expanded === index ? "Read less" : "Read more.."}
                    </p>
                  )}
                </div>
                <div className="review_author">
                  <img
                    src={item.profile_picture}
                    alt="User"
                    loading="lazy"
                    decoding="async"
                    height="70"
                    width="70"
                    sizes="(max-width: 70px) 70px"
                  />
                  <div>
                    <h5>{item.name}</h5>
                    <span className="user_review_item_span">
                      {item.company}
                    </span>
                  </div>
                </div>
              </button>
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

export default UserReviewSmart;
