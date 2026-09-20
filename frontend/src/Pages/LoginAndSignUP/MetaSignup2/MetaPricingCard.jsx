import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Pricing = [
  {
    id: "quarterly",
    title: "3 months",
    save: "SAVE 30%",
    discount: (
      <>
        <span style={{ marginRight: 5 }}>$45 </span>$30
      </>
    ),
    price: 33,
  },
  {
    id: "yearly",
    title: "12 months",
    save: "SAVE 50%",
    discount: (
      <>
        <span style={{ marginRight: 5 }}>$180 </span>$90
      </>
    ),
    price: 25,
  },
  {
    id: "lifetime",
    title: "Lifetime",
    save: "SAVE 30%",
    discount: (
      <>
        <span style={{ marginRight: 5 }}>$315</span> $220
      </>
    ),
    price: 12,
  },
];
function MetaPricingCard() {
  const [activePlan, setActivePlan] = useState("yearly");

  useEffect(() => {
    sessionStorage.setItem("meta_plan", "yearly");
  }, []);

  return (
    <div className="meta_prricing_card">
      <h2>
        <span>Choose your plan</span>
      </h2>
      <div className="meta_prricing_card_item">
        {Pricing.map((item, index) => {
          return (
            <button
              key={index}
              className={
                "prricing_card_item " +
                (index === 1 ? "prricing_card_item_mid " : " ") +
                (activePlan === item.id ? "prricing_card_item_active" : "")
              }
              onClick={() => {
                setActivePlan(item.id);
                sessionStorage.setItem("meta_plan", item.id);
              }}
            >
              {index === 1 && (
                <p className="prricing_card_popular">MOST POPULAR</p>
              )}

              <div className="prricing_card_item_left">
                <h5>{item.title}</h5>
                <p>{item.save}</p>
                <span>{item.discount}</span>
              </div>
              <div className="prricing_card_item_right">
                <div className="prricing_card_item_right_price">
                  <span>$</span>
                  <span>0</span>
                  <span>.{item.price}</span>
                </div>
                <p>PER DAY</p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="meta_prricing_card_link">
        Have questions before starting your <br />  trial?{" "}
        <Link
          onClick={() =>
            window.location.assign("/nikhilpawar/booking")
          }
          to="#"
        >
          Talk to an expert
        </Link>
      </p>
    </div>
  );
}

export default MetaPricingCard;
