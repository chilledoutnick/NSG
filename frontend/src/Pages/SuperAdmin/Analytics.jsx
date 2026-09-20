import axios from "axios";
import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import moment from "moment"
import Layout from "../../Components/Layout/Layout";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./UserInfo.scss";
import "./Responsive.scss";

function Analytics() {
  const [info, setInfo] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(moment().month());

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  useEffect(() => {
    contact_sales();
  }, []);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const contact_sales = () => {
    $("#preloader").css("display", "block");
    const url = "api/contact_sales/get_contact_sales/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setInfo(res.data);
        $("#preloader").css("display", "none");
      })
      .catch((err) => $("#preloader").css("display", "none"));
  };

  
  return (
    <Layout>
      <div className="table-con">
        <div className="table-con-header">
          <h3>Analytics</h3>
          <select
            id="monthSelect"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        <div className="analytics_client_count_wraper">
          <div className="analytics_client_count">
            <div>
              <p>Total Contacts Added</p>
              <h4>40,689</h4>
            </div>
            <LazyLoadImage
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_png.webp"
              effect="blur"
              alt="Contact"
              height={60}
              width={60}
            />
          </div>
          <div className="analytics_client_count">
            <div>
              <p>Profile Traffic</p>
              <h4>$89,000</h4>
            </div>
            <LazyLoadImage
              src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_1_png.webp"
              effect="blur"
              alt="Contact"
              height={60}
              width={60}
            />
          </div>
        </div>
        <div className="table_con_wrapper">
          <h5>Contact Details</h5>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">First name</th>
                <th scope="col">Last name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
              </tr>
            </thead>
            <tbody>
              {info.map((item, index) => {
                return (
                  <tr key={"item" + index}>
                    <td>{item.first_name}</td>
                    <td>{item.last_name}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <BottomBar />
      </div>
    </Layout>
  );
}

export default Analytics;
