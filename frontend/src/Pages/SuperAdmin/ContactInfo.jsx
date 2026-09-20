import axios from "axios";
import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import swal from "sweetalert";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./UserInfo.scss";

function ContactInfo() {
  const [info, setInfo] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null); 

  useEffect(() => {
    contact_sales();
  }, []);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const contact_sales = () => {
    $("#preloader").css("display", "block");
    const url = "api/contact_sales/get_contact_sales/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setInfo(res.data);
        setFilteredInfo(res.data);
        $("#preloader").css("display", "none");
      })
      .catch(() => $("#preloader").css("display", "none"));
  };

  const handleDelete = (item) => {
    $("#preloader").css("display", "block");
    const url = "api/contact_sales/delete_sales_contact/";
    axios
      .post(url, { contact_sales_id: item.contact_sales_id }, config)
      .then(() => {
        swal({
          text: "Deleted",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        $("#preloader").css("display", "none");
        contact_sales(); 
      })
      .catch(() => $("#preloader").css("display", "none"));
  };

 
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();

      if (!query) {
        setFilteredInfo(info);
      } else {
        const filtered = info.filter((item) =>
          `${item.first_name} ${item.last_name} ${item.email} ${item.phone} ${item.business} ${item.postal_code}`
            .toLowerCase()
            .includes(query)
        );
        setFilteredInfo(filtered);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, info]);

  return (
    <div className="table-con">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">First name</th>
            <th scope="col">Last name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">Business name</th>
            <th scope="col">Postal Code</th>
            <th scope="col">Message</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredInfo.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                style={{ textAlign: "center", padding: "1rem", color: "gray" }}
              >
                No results found.
              </td>
            </tr>
          ) : (
            filteredInfo.map((item, index) => (
              <tr key={"item" + index}>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.business}</td>
                <td>{item.postal_code}</td>
                <td>{item.message}</td>
                <td>
                  <button
                    className="delete_btn"
                    onClick={() => handleDelete(item)}
                  >
                    <DeleteForeverRoundedIcon />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <BottomBar />
    </div>
  );
}

export default ContactInfo;
