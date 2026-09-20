import prom from "./img/prom.png";
import prom2 from "./img/prom2.png";
import prom3 from "./img/prom3.png";
import "./OurPromise.scss";

function OurPromise() {
  const OurPromiseData = [
    {
      title: "Data Privacy",
      img: prom,
      desc: <>NSG is committed to consumer privacy</>,
    },
    {
      title: "Security",
      img: prom2,
      desc: "NSG does not store any credit or banking information",
    },
    {
      title: "24/7 Support",
      img: prom3,
      desc: "NSG hand holds clients through each step of the journey",
    },
  ];
  return (
    <div className="home-promise">
      <div className="home-promise-con">
        <p className="home-feature-txt2">Our Promises</p>
        <div className="home-promise-row">
          {OurPromiseData.map((item, index) => {
            return (
              <div className="btm-card-wrapper" key={index + "btm-card"}>
                <div className={"btm-card btm-card" + index}>
                  <img src={item.img} alt="NSG Promises" loading="lazy" />
                  <div className="btm-card-text">
                    <p>{item.title}</p>
                    <span>{item.desc}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OurPromise;
