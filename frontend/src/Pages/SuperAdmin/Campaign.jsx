import axios from "axios";
import { useState, useEffect } from "react";
import $ from "jquery";
import moment from "moment";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./Responsive.scss";
import "./UserInfo.scss"; 

function Campaign() {
  const [User, setUser] = useState([]);
  const [PageNumber, setPageNumber] = useState(1);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(query);
      setPageNumber(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);


  useEffect(() => {
    $("#preloader").css("display", "block");
    get_user_info();
  }, [PageNumber, searchQuery]);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const get_user_info = () => {
    const url = "api/campain_card/get_all_campain_card/";
    const payload = {
      page: PageNumber,
      page_size: 40,
      search: searchQuery, 
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setUser(res.data);
        $("#preloader").css("display", "none");
      })
      .catch((err) => {
        $("#preloader").css("display", "none");
      });
  };

  return (
    <div className="table-con pt-3">
      
      <div className="contact-style-search ">
        <input
          type="text"
          placeholder="Search by name, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="table_scroll">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Name</th>
              <th scope="col">Company</th>
              <th scope="col">Email</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
            {User?.data?.length > 0 ? (
              User.data.map((pkg, index) => (
                <tr key={index}>
                  <td>{pkg.id}</td>
                  <td>{pkg.firstname + " " + pkg.lastname}</td>
                  <td>{pkg.company}</td>
                  <td>{pkg.emailid}</td>
                  <td>{moment(pkg.timestamp).format("DD MMMM YYYY")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-found">
                   No results found for your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="blog_pagination">
        <div className="blog_pagination_wrapper">
          <button
            className={PageNumber > 1 ? "active_pagination" : ""}
            onClick={() => {
              if (PageNumber > 1) {
                setPageNumber(PageNumber - 1);
              }
            }}
          >
            <KeyboardArrowLeftIcon /> Previous
          </button>
          <span></span>
          <button
            onClick={() => {
              setPageNumber(PageNumber + 1);
            }}
            className="active_pagination"
          >
            Next
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}

export default Campaign;
