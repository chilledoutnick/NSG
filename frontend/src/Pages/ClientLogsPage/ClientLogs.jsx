import axios from "axios";
import  { useState, useRef, useEffect, lazy } from "react";
import { CSVLink } from "react-csv"; 
import { ThreeDots } from "react-loader-spinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import $ from "jquery";
import swal from "sweetalert";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CallIcon from "@mui/icons-material/Call";
import EditIcon from "@mui/icons-material/Edit";
import ClientSkeleton from "./Skeleton/ClientSkeleton";
import "./ClientLogs.scss";
import "./Responsive.scss";

const CardProfileMenu = lazy(() =>
  import("../../Components/CardProfileMenu/CardProfileMenu")
);
const CardBottomBar = lazy(() =>
  import("../../Components/CardProfileBottomBar/BottomBar")
);

function ClientLogs() {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDotMenu, setShowDotMenu] = useState(false);
  const [showSortingItem, setShowSortingItem] = useState(false);
  const [showSortingDate, setShowSortingDate] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSortingItem, setSelectedSortingItem] = useState("all");
  const [loading, setLoading] = useState(false);
  const [all_clear, setAll_clear] = useState(false);
  const [email, setEmail] = useState("");
  const [sortByItem, setSortByItem] = useState(1);
  const [errorMsg, setErrorMSg] = useState("");
  const [errorMsgClientLog, setMsgClientLog] = useState("");
  const [searchValue, setSearchValue] = useState();
  const [clientId, setClientId] = useState();
  const [SelectedClientId, setSelectedClientId] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [clientLogsData, setClientLogsData] = useState([]);
  const [total_pages, setTotal_pages] = useState(0);
  const [total_data, setTotal_data] = useState(0);
  const [page_number, setPage_number] = useState(1);
  const [contactStartNumber, setContactStartNumber] = useState(1);
  const [sortedClientLogsData, setSortedClientLogsData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showSidebarCard, setShowSidebarCard] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_info"))

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "prospect",
    service: "",
    comment: "",
    clientExist: false,
  });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });

    if (name === "email") {
      const isExist =
        clientLogsData &&
        clientLogsData.some((client) => client.email === value);
      setFormData({
        ...formData,
        clientExist: isExist,
      });
    }
  };

  useEffect(() => {
    get_client_log(page_number);
  }, []);

  const makeClient = () => {
    setLoading(true);
    const url = "api/contact/create_contact/";
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.service,
      comment: formData.comment,
      category: formData.category,
      address: formData.address,
      username: user_info.username,
    };

    axios
      .post(url, payload)
      .then(() => {
        handleClose();
        get_client_log(page_number);
        setLoading(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          category: "prospect",
          service: "",
          comment: "",
        });
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
      })
      .catch((err) => {
        setErrorMSg(err.response.data.message);
        setLoading(false);
      });
  };
  
  console.log("formData", formData);

  const updateClient = () => {
    setLoading(true);
    const url = "api/contact/update_contact/";
    let payload = {};
    if (formData.email !== email) {
      payload = {
        contact_id: clientId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        message: formData.service,
        category: formData.category,
        comment: formData.comment,
      };
    } else {
      payload = {
        contact_id: clientId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        message: formData.service,
        category: formData.category,
        comment: formData.comment,
      };
    }
    axios
      .post(url, payload, config)
      .then((res) => {
        setLoading(false);
        handleClose();
        get_client_log(page_number);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
      })
      .catch((err) => {
        setLoading(false);
        setErrorMSg(err.response.data.message);
      });
  };

  const isAdminClient = window.location.pathname === "/admin-client-logs";

  
  const get_client_log = (page_number) => {
    const url = "/api/contact/get_contact_log/";
    const urlTeam = "/api/team_admin/get_team_contact_log/";
    const finalPath = isAdminClient ? urlTeam : url;
    const payload = {
      page_size: 50,
      page_number: page_number,
    };
    axios
      .post(finalPath, payload, config)
      .then((res) => {
        setTotal_pages(res.data.total_pages);
        setTotal_data(res.data.total_data);
        setClientLogsData(res.data.contacts_data);
        setSortedClientLogsData(res.data.contacts_data);
        setContactStartNumber(res.data.contact_start_number);
        setTeamMembers(res.data.team_member);
        setMsgClientLog("");
        setInitialLoading(false);
      })
      .catch(() => {
        setMsgClientLog("There is no data or try to refresh the page");
        setInitialLoading(false);
      });
  };

  const handleClickOpen = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
    setErrorMSg("");
    setIsUpdate(false);
    if (isUpdate) {
      setFormData({
        ...formData,
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "prospect",
        service: "",
        comment: "",
        clientExist: false,
      });
    }
  };

  const get_client_by_last_interaction = () => {
    $("#preloader").css("display", "block");
    const url = "/api/contact/get_contact_by_last_interaction/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setTotal_pages(res.data.total_pages);
        setTotal_data(res.data.total_data);
        setClientLogsData(res.data.contacts_data);
        setSortedClientLogsData(res.data.contacts_data);
        setContactStartNumber(res.data.contact_start_number);
        setTeamMembers(res.data.team_member);
        setMsgClientLog("");
        $("#preloader").css("display", "none");
      })
      .catch((err) => $("#preloader").css("display", "none"));
  };
  const get_client_by_last_month = () => {
    $("#preloader").css("display", "block");
    const url = "/api/contact/get_contact_by_last_month/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setTotal_pages(res.data.total_pages);
        setTotal_data(res.data.total_data);
        setClientLogsData(res.data.contacts_data);
        setSortedClientLogsData(res.data.contacts_data);
        setContactStartNumber(res.data.contact_start_number);
        setTeamMembers(res.data.team_member);
        setMsgClientLog("");
        $("#preloader").css("display", "none");
      })
      .catch((err) => $("#preloader").css("display", "none"));
  };
  const get_client_by_previous_previous_month = () => {
    $("#preloader").css("display", "block");
    const url = "/api/contact/get_contact_by_previous_previous_month/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setTotal_pages(res.data.total_pages);
        setTotal_data(res.data.total_data);
        setClientLogsData(res.data.contacts_data);
        setSortedClientLogsData(res.data.contacts_data);
        setContactStartNumber(res.data.contact_start_number);
        setTeamMembers(res.data.team_member);
        setMsgClientLog("");
        $("#preloader").css("display", "none");
      })
      .catch((err) => $("#preloader").css("display", "none"));
  };

  const get_client_by_date_created = () => {
    $("#preloader").css("display", "block");
   
    const url = "/api/contact/get_contact_by_date_created/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setTotal_pages(res.data.total_pages);
        setTotal_data(res.data.total_data);
        setClientLogsData(res.data.contacts_data);
        setSortedClientLogsData(res.data.contacts_data);
        setContactStartNumber(res.data.contact_start_number);
        setTeamMembers(res.data.team_member);
        setMsgClientLog("");
        $("#preloader").css("display", "none");
      })
      .catch((err) => $("#preloader").css("display", "none"));
  };
  
  const get_client_by_master_search = () => {
    $("#preloader").css("display", "block");
    if (searchValue !== undefined) {
      const url = "api/contact/get_contact_by_master_search/";
      const paylaod = {
        search: searchValue,
      };
      axios
        .post(url, paylaod, config)
        .then((res) => {
          setTotal_pages(res.data.total_pages);
          setTotal_data(res.data.total_data);
          setClientLogsData(res.data.contacts_data);
          setSortedClientLogsData(res.data.contacts_data);
          setContactStartNumber(res.data.contact_start_number);
          setTeamMembers(res.data.team_member);
          setMsgClientLog("");
          $("#preloader").css("display", "none");
        })
        .catch((err) => {
          $("#preloader").css("display", "none");
        });
    }
  };

  const handleDelete = () => {
    $("#preloader").css("display", "block");
    const url = "api/contact/delete_contact/";
    const payload = {
      all_clear: all_clear,
      contact_id: SelectedClientId,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        get_client_log(page_number);
        setSelectedClientId([]);
        setAll_clear(false);
        $('input[type="checkbox"]').prop("checked", false);
        $("#preloader").css("display", "none");
      })
      .catch((err) => console.log("err", err));
  };

  const handleSidebarClose = () => {
    setShowSidebarCard(false);
  };

  const { errors } = formData;

  const isDisable =
    formData.name === "" ||
    loading === true ||
    formData.category === "" ||
    formData.clientExist ||
    formData.email === "";

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      get_client_by_master_search();
    }
  };

  return (
    <div className="client-logs-container">
      <div className="client-logs-wrapper">
        <>
          {!initialLoading && (
            <div className="client-logs-content">
              {showSidebarCard && (
                <CardProfileMenu handleSidebarClose={handleSidebarClose} />
              )}
              <div className="client-log-sorting-header">
                <div className="client-log-sorting-con">
                  {SelectedClientId.length > 0 || all_clear === true ? (
                    <button
                      className="client-delete-btn"
                      onClick={handleDelete}
                    >
                      <DeleteForeverRoundedIcon fontSize="small" />
                    </button>
                  ) : (
                    ""
                  )}
                  
                  {!isAdminClient ? (
                    <div className="client-log-sorting-down">
                      <select
                        className="client-log-sorting-date"
                        value={sortByItem || ""}
                        onChange={(e) => {
                          setSortByItem(JSON.parse(e.target.value));
                          if (JSON.parse(e.target.value) === 1) {
                            get_client_by_date_created();
                          } else if (JSON.parse(e.target.value) === 2) {
                            get_client_by_last_interaction();
                          } else if (JSON.parse(e.target.value) === 3) {
                            get_client_by_last_month();
                          } else if (JSON.parse(e.target.value) === 4) {
                            get_client_by_previous_previous_month();
                          }
                        }}
                        name="cars"
                        id="cars"
                      >
                        <option value={1}>Date created</option>
                        <option value={2}>Last interacted</option>
                        <option value={3}>Last 30 days</option>
                        <option value={4}>Last 31-60 days</option>
                      </select>
                    </div>
                  ) : (
                    teamMembers.length > 0 && (
                      <div className="client-log-sorting-down">
                        <select
                          style={{ width: 180 }}
                          value={selectedSortingItem || ""}
                          onChange={(e) => {
                            let value = e.target.value;
                            setSelectedSortingItem(value);
                            if (value === "all") {
                              setClientLogsData(sortedClientLogsData);
                            } else {
                              const clientData = sortedClientLogsData.filter(
                                (item) => {
                                  return item.advisor_name === value;
                                }
                              );
                              setClientLogsData(clientData);
                            }
                          }}
                          name="cars"
                          id="cars"
                        >
                          <option value="all">Filter by team member</option>
                          {teamMembers.map((item, index) => {
                            return (
                              <option key={index + "team"} value={item}>
                                {item}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )
                  )}
                  {!isAdminClient && (
                    <div className="client-log-search-input">
                      <button
                        onClick={get_client_by_master_search}
                        className="client-log-search-icon"
                      >
                        <SearchRoundedIcon className="search-icon" />
                      </button>

                      <input
                        placeholder="Search..."
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                    </div>
                  )}
                </div>
                <div className="d-flex">
                  <button
                    onClick={(e) => {
                      handleClickOpen();
                    }}
                    className="add-client-button"
                  >
                    + Add Client/Prospects
                  </button>
                  <button
                    onClick={() => {
                      setShowDotMenu(true);
                      setShowSortingDate(false);
                      setShowSortingItem(false);
                    }}
                    className="dot-btn"
                  >
                    <MoreVertIcon className="icon" />
                  </button>
                </div>

                {showDotMenu && (
                  <ClickAwayListener onClickAway={() => setShowDotMenu(false)}>
                    <div className="sorting-popup">
                      <div className="sorting-all">
                        <button
                          onClick={() => {
                            setShowSortingItem(!showSortingItem);
                            setShowSortingDate(false);
                          }}
                          className="main-btn"
                        >
                          Filter by Category
                          <span>
                            {showSortingItem ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </span>
                        </button>
                        {showSortingItem && (
                          <div className="inside">
                            <button
                              onClick={() => {
                                setClientLogsData(sortedClientLogsData);
                                setShowDotMenu(false);
                              }}
                            >
                              All
                            </button>
                            <button
                              onClick={() => {
                                const clientData = sortedClientLogsData.filter(
                                  (item) => {
                                    return item.category === "prospect";
                                  }
                                );
                                setClientLogsData(clientData);
                                setShowDotMenu(false);
                              }}
                            >
                              Prospect
                            </button>
                            <button
                              onClick={() => {
                                const clientData = sortedClientLogsData.filter(
                                  (item) => {
                                    return item.category === "client";
                                  }
                                );
                                setClientLogsData(clientData);
                                setShowDotMenu(false);
                              }}
                            >
                              Client
                            </button>
                            <button
                              onClick={() => {
                                const clientData = sortedClientLogsData.filter(
                                  (item) => {
                                    return item.category === "team member";
                                  }
                                );
                                setClientLogsData(clientData);
                                setShowDotMenu(false);
                              }}
                            >
                              Team Member
                            </button>
                            <button
                              onClick={() => {
                                const clientData = sortedClientLogsData.filter(
                                  (item) => {
                                    return item.category === "Exchange Contact";
                                  }
                                );
                                setClientLogsData(clientData);
                                setShowDotMenu(false);
                              }}
                            >
                              Exchange Contact
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="sorting-all">
                        <button
                          className="main-btn"
                          onClick={() => {
                            setShowSortingDate(!showSortingDate);
                            setShowSortingItem(false);
                          }}
                        >
                          Sort by
                          <span>
                            {showSortingDate ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </span>
                        </button>
                        {showSortingDate && (
                          <div className="inside">
                            <button
                              onClick={() => {
                                get_client_by_date_created();
                                setShowDotMenu(false);
                              }}
                            >
                              Date created
                            </button>
                            <button
                              onClick={() => {
                                get_client_by_last_interaction();
                                setShowDotMenu(false);
                              }}
                            >
                              Last interacted
                            </button>
                            <button
                              onClick={() => {
                                get_client_by_last_month();
                                setShowDotMenu(false);
                              }}
                            >
                              Last 30 days
                            </button>
                            <button
                              onClick={() => {
                                get_client_by_previous_previous_month();
                                setShowDotMenu(false);
                              }}
                            >
                              Last 31-60 days
                            </button>
                          </div>
                        )}
                      </div>
                      {clientLogsData !== undefined && (
                        <CSVLink
                          className="main-btn csv-download"
                          data={clientLogsData}
                          target="_blank"
                        >
                          Download list (csv)
                        </CSVLink>
                      )}
                    </div>
                  </ClickAwayListener>
                )}
              </div>
            </div>
          )}
          {initialLoading ? (
            <ClientSkeleton />
          ) : clientLogsData && clientLogsData.length > 0 ? (
            <>
              <div className="data-grid-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <input
                          onChange={(e) => {
                            if (e.target.checked === true) {
                              $('input[type="checkbox"]').prop("checked", true);
                              setAll_clear(true);
                              setSelectedClientId([]);
                            } else {
                              $('input[type="checkbox"]').prop(
                                "checked",
                                false
                              );
                              setSelectedClientId([]);
                              setAll_clear(false);
                            }
                          }}
                          type="checkbox"
                        />
                      </th>
                      <th>#</th>
                      <th>Name</th>
                      {isAdminClient && <th>Team Member</th>}
                      <th>Activity</th>
                      {!isMobile && (
                        <>
                          <th>Location</th>
                          <th>Upcoming Events</th>
                        </>
                      )}
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientLogsData && clientLogsData.length > 0
                      ? clientLogsData.map((item, index) => {
                          return (
                            <tr key={"client" + index}>
                              <td style={{ width: "4%" }} className="px-3">
                                <input
                                  type="checkbox"
                                  id="myCheckbox"
                                  style={{ cursor: "pointer" }}
                                  onChange={(e) => {
                                    let index = SelectedClientId.indexOf(
                                      item.id
                                    );
                                    if (e.target.checked === true) {
                                      setSelectedClientId((current) => [
                                        ...current,
                                        item.contact_id,
                                      ]);
                                    } else {
                                      SelectedClientId.splice(index, 1);
                                      setSelectedClientId(
                                        JSON.parse(
                                          JSON.stringify(SelectedClientId)
                                        )
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td style={{ width: "4%" }}>
                                {contactStartNumber + index}
                              </td>
                              <td
                                onClick={() => {
                                  setIsUpdate(true);
                                  handleClickOpen();
                                  setEmail(item.email);
                                  setClientId(item.contact_id);
                                  setFormData({
                                    ...formData,
                                    name: item.name,
                                    email: item.email,
                                    phone: item.phone,
                                    address: item.address,
                                    category: item.category,
                                    service: item.message,
                                    comment: item.comment,
                                  });
                                }}
                                className="td-name"
                              >
                                <p>{item.name}</p>
                                <p style={{ textTransform: "capitalize" }}>
                                  {item.category[0]}
                                </p>
                              </td>
                              {isAdminClient && (
                                <td
                                  className="td-name"
                                  style={{ width: "10%" }}
                                >
                                  <p>{item.user_name}</p>
                                </td>
                              )}

                              <td
                                style={{ width: "6%" }}
                                className="td-activity"
                              >
                                <Tooltip title={item.phone}>
                                  <a href={"tel:" + item.phone}>
                                    <CallIcon
                                      sx={
                                        isMobile
                                          ? { fontSize: 14 }
                                          : { fontSize: 18 }
                                      }
                                    />
                                  </a>
                                </Tooltip>
                                <Tooltip title={item.email}>
                                  <a href={"mailto:" + item.email}>
                                    <EmailRoundedIcon
                                      sx={
                                        isMobile
                                          ? { fontSize: 14 }
                                          : { fontSize: 18 }
                                      }
                                    />
                                  </a>
                                </Tooltip>
                              </td>

                              {!isMobile && (
                                <>
                                  <td className="address-td">
                                    {item.address !== "" ? (
                                      item.address
                                    ) : (
                                      <p>Address..</p>
                                    )}
                                  </td>
                                  
                                  <td className="td-event">
                                    <button>
                                      <p>
                                        {item.upcoming_appointment
                                          .appointment_date !== null
                                          ? moment(
                                              item.upcoming_appointment
                                                .appointment_date +
                                                ", " +
                                                item.upcoming_appointment
                                                  .appointment_time
                                            ).format("LL")
                                          : ""}
                                      </p>
                                      <p>
                                        {item.upcoming_appointment
                                          .appointment_time !== null ? (
                                          moment(
                                            item.upcoming_appointment
                                              .appointment_time,
                                            "HH:mm:ss"
                                          ).format("LT")
                                        ) : (
                                          <span className="td-event-add">
                                            No Appointments
                                          </span>
                                        )}
                                      </p>
                                    </button>
                                  </td>
                                 
                                </>
                              )}

                              <td style={{ width: "4%" }}>
                                <Tooltip title="Edit">
                                  <button
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                    }}
                                    onClick={() => {
                                      setIsUpdate(true);
                                      handleClickOpen();
                                      setEmail(item.email);
                                      setClientId(item.contact_id);
                                      setFormData({
                                        ...formData,
                                        name: item.name,
                                        email: item.email,
                                        phone: item.phone,
                                        address: item.address,
                                        category: item.category,
                                        service: item.message,
                                        comment: item.comment,
                                      });
                                    }}
                                  >
                                    <EditIcon
                                      sx={
                                        isMobile
                                          ? { fontSize: 14 }
                                          : { fontSize: 18 }
                                      }
                                    />
                                  </button>
                                </Tooltip>
                              </td>
                            </tr>
                          );
                        })
                      : ""}
                  </tbody>
                </table>
                {errorMsgClientLog !== "" ? (
                  <div>
                    <p>{errorMsgClientLog}</p>
                    <button
                      className="btn-primary mt-1"
                      onClick={get_client_log(page_number)}
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="client-log-pagination">
                <p className="pagination-left-text">
                  {contactStartNumber}-
                  {(page_number - 1) * 50 + clientLogsData.length} of{" "}
                  {total_data}
                 
                </p>
                <div className="pagination-btn">
                  <div className="pagination-select">
                    <p>Page: {page_number}</p>
                  </div>
                  <div className="pagination-nav">
                    <button
                      onClick={() => {
                        if (page_number > 1) {
                          setPage_number(page_number - 1);
                          get_client_log(page_number - 1);
                        }
                      }}
                    >
                      <KeyboardArrowLeftIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => {
                        if (page_number < total_pages) {
                          setPage_number(page_number + 1);
                          get_client_log(page_number + 1);
                        }
                      }}
                    >
                      <KeyboardArrowRightIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no_data_found_con">
              <LazyLoadImage
                alt="bgImage"
                src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/IM_LEa_png.webp"
                effect="blur"
                className="bg_img"
              />
              <p>Connect with prospects & grow</p>
            </div>
          )}
        </>
      </div>
      
      <Dialog
        open={showPopup}
        onClose={handleClose}
        fullScreen={isMobile ? true : false}
      >
        <DialogContent className="client-log-popup">
          <div className="popup-top">
            <button onClick={handleClose}>
              <ArrowBackIcon />
            </button>
            <h4 className="client-log-popup-header">Customer Details</h4>
            <button
              className={"save-btn " + (isDisable ? "ds" : "")}
              disabled={isDisable}
              onClick={() => {
                if (isUpdate) {
                  updateClient();
                } else {
                  makeClient();
                }
              }}
            >
              {!loading ? (
                "Save"
              ) : (
                <ThreeDots
                  height="25"
                  width="30"
                  radius="9"
                  color="black"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  wrapperClassName=""
                  visible={true}
                />
              )}
            </button>
          </div>

          <div className="popup-bottom">
            <p className="text-danger">{errorMsg}</p>
            <label>Name*</label>
            <input name="name" value={formData.name} onChange={handleChange} />
            {errors?.has("name") && (
              <p className="error">{errors.first("name")}</p>
            )}
            <label>Email ID*</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <p className="error mt-0 mb-2">
              {formData.clientExist && "The contact already exists."}
            </p>
            {errors?.has("email") && (
              <p className="error">{errors.first("email")}</p>
            )}
            <label>Contact Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <label>Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </DialogContent>
      </Dialog>
      <CardBottomBar />
    </div>
  );
}

export default ClientLogs;
