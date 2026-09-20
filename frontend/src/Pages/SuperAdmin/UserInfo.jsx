import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import URLLinkUp from "./URLLinkUp";
import swal from "sweetalert";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./Responsive.scss";
import "./UserInfo.scss";

function UserInfo() {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [PackageId, setPackageId] = useState(1);
  const [AdminUsers, setAdminUsers] = useState([]);
  const [Users, setUsers] = useState({});
  const [User, setUser] = useState();
  const [deleteInput, setDeleteInput] = useState("");
  const [PageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const debounceRef = useRef(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
  }, [searchQuery]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedQuery]);

  useEffect(() => {
    fetchData();
  }, [PageNumber, debouncedQuery, showTeam]);

  const fetchData = () => {
    $("#preloader").css("display", "block");
    if (showTeam) {
      admin_package();
    } else {
      get_user_info();
    }
  };

  const get_user_info = async () => {
    const url = "api/package/user_package/";
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    };
    const payload = {
      page: PageNumber,
      page_size: 20,
      ...(debouncedQuery.trim() && { search: debouncedQuery.trim() }),
    };
    try {
      const res = await axios.post(url, payload, config);
      setUsers(res.data);
    } catch (err) {
      console.error("User fetch failed", err);
    } finally {
      $("#preloader").css("display", "none");
    }
  };

  const admin_package = () => {
    const url = "api/package/admin_package/";
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    };
    const payload = {
      page: PageNumber,
      page_size: 20,
      ...(debouncedQuery.trim() && { search: debouncedQuery.trim() }),
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setAdminUsers(res.data.data || []);
        $("#preloader").css("display", "none");
      })
      .catch(() => $("#preloader").css("display", "none"));
  };

  const delete_user = () => {
    const url = "api/user/delete_user_profile/";
    const payload = { user_id: User.user_id };
    setLoading(true);
    axios
      .post(url, payload)
      .then(() => {
        swal({
          text: "Advisor Deleted",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        fetchData();
        setLoading(false);
        setIsDelete(false);
        setDeleteInput("");
      })
      .catch(() => {
        setDeleteInput("");
        setLoading(false);
      });
  };

  const handleClose = () => {
    setIsOpen(false);
    fetchData();
  };

  const getPackageLabel = (pkg) => {
    if (pkg === 4 || pkg === "4") return "Pro (4)";
    if (pkg === 5 || pkg === "5") return "Free (5)";
    if (pkg === 6 || pkg === "6") return "Team (6)";
    return `Unknown (${pkg})`;
  };

  const getFilteredUsers = () => {
    if (!Users || Object.keys(Users).length === 0) return [];

    if (debouncedQuery.trim()) {
      const lower = debouncedQuery.toLowerCase();
      let allUsers = [];
      Object.entries(Users).forEach(([pkgId, pkgBlock]) => {
        const key = Object.keys(pkgBlock)[0];
        const list = pkgBlock[key];
        const filtered = list.filter((pkg) =>
          `${pkg.name} ${pkg.email} ${pkg.username} ${pkg.custom_username}`
            .toLowerCase()
            .includes(lower)
        );
        filtered.forEach((user) => (user.packageId = pkgId));
        allUsers.push(...filtered);
      });
      return allUsers;
    }

    if (!Users[PackageId]) return [];
    const key = Object.keys(Users[PackageId])[0];
    return Users[PackageId][key];
  };

  const getFilteredAdmins = () => {
    if (!AdminUsers) return [];
    if (!debouncedQuery.trim()) return AdminUsers;

    const lower = debouncedQuery.toLowerCase();
    return AdminUsers.filter((user) =>
      `${user.name} ${user.email} ${user.username} ${user.custom_username}`
        .toLowerCase()
        .includes(lower)
    );
  };

  return (
    <div className="table-con user_info pt-4">
      <div className="table_btns">
        <h3 className="mb-0">Active User</h3>
        <div className="table_btns_wrapper">
          <button
            className={showTeam ? "btn-primary" : "btn-primary deactive"}
            onClick={() => {
              setShowTeam(!showTeam);
              setPageNumber(1);
              setSearchQuery("");
            }}
          >
            Team Admin
          </button>
          <select
            style={{ width: 200 }}
            className="form-select search-input"
            value={PackageId}
            onChange={(e) => setPackageId(JSON.parse(e.target.value))}
          >
            <option value={1}>Pro (Package 4)</option>
            <option value={2}>Free (Package 5)</option>
            <option value={3}>Team (Package 6)</option>
          </select>
          <input
            type="text"
            placeholder="Search by name, email, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control search-input"
            style={{ width: 300, marginLeft: 10 }}
          />
        </div>
      </div>

      {!showTeam ? (
        <div className="table_scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Username</th>
                <th>Custom Username</th>
                <th>Package ID</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredUsers().length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-3">
                    No results found
                  </td>
                </tr>
              ) : (
                getFilteredUsers().map((pkg, index) => (
                  <tr key={index}>
                    <td>{pkg.name}</td>
                    <td>{pkg.email}</td>
                    <td>{pkg.is_active ? "Active" : "Deactive"}</td>
                    <td>{pkg.username}</td>
                    <td>{pkg.custom_username}</td>
                    <td>{getPackageLabel(pkg.package)}</td>
                    <td>
                      <button
                        className="basic_btn"
                        onClick={() => {
                          setIsOpen(true);
                          setUser(pkg);
                        }}
                      >
                        <EditIcon />
                      </button>
                    </td>
                    <td>
                      <button
                        className="delete-adisor"
                        onClick={() => {
                          setIsDelete(true);
                          setUser(pkg);
                        }}
                      >
                        <DeleteForeverIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table_scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Username</th>
                <th>Custom Username</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAdmins().length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    No results found
                  </td>
                </tr>
              ) : (
                getFilteredAdmins().map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.is_active ? "Active" : "Deactive"}</td>
                    <td>{user.username}</td>
                    <td>{user.custom_username}</td>
                    <td>
                      <button
                        className="basic_btn"
                        onClick={() => {
                          setIsOpen(true);
                          setUser(user);
                        }}
                      >
                        <EditIcon />
                      </button>
                    </td>
                    <td>
                      <button
                        className="delete-adisor"
                        onClick={() => {
                          setIsDelete(true);
                          setUser(user);
                        }}
                      >
                        <DeleteForeverIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
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
              if (PageNumber !== 0) {
                setPageNumber(PageNumber + 1);
              }
            }}
            className="active_pagination"
          >
            Next
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>

      <BottomBar />

      {isOpen && (
        <BlurPopup onClose={() => setIsOpen(false)} openState={isOpen}>
          <div className="blurpopup_con_wrapper">
            <URLLinkUp User={User} handleClose={handleClose} />
          </div>
        </BlurPopup>
      )}

      {isDelete && (
        <BlurPopup
          onClose={() => {
            setIsDelete(false);
            setDeleteInput("");
          }}
          openState={isDelete}
        >
          <div className="blurpopup_con_wrapper">
            <p>Are you sure you want to delete {User.name}'s account?</p>
            <label>Type DELETE to confirm</label>
            <input
              value={deleteInput}
              type="text"
              placeholder="DELETE"
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div
              className="mt-4"
              style={{ display: "flex", alignItems: "center", gap: "20px" }}
            >
              <button
                disabled={deleteInput !== "DELETE"}
                className="btn-primary w-25"
                onClick={delete_user}
              >
                {!loading ? (
                  "DELETE"
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    radius="9"
                    color="white"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                )}
              </button>
              <button
                onClick={() => setIsDelete(false)}
                className="btn_sec w-25"
              >
                Cancel
              </button>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default UserInfo;
