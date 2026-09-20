import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import swal from "sweetalert";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import CardBottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./Communication.scss";
import "./Responsive.scss";

function Communication() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState("");
  const [clientData, setClientData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortedClientData, setSortedClientData] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);
  const [selectedSortingItem, setSelectedSortingItem] = useState("all");
  const user_info = JSON.parse(localStorage.getItem("user_info"));

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    name: "",
    email: "",
    category: "",
  });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    searchClient();
  }, []);

  const searchClient = () => {
    const url = "api/contact/get_contacts/";
    const payload = {
      name: searchData,
    };

    axios
      .post(url, payload, config)
      .then((res) => {
        setClientData(res.data);
        setSortedClientData(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  const handleSubmit = () => {
    $("#preloader").css("display", "block");
    let emails = [];
    selectedClient.map((email) => {
      return emails.push(email.email);
    });
    const url = "api/user_profile/bulk_email/";
    const payload = {
      recipients: emails,
      message: formData.message,
      subject: formData.subject,
    };

    axios
      .post(url, payload, config)
      .then(() => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        $("#preloader").css("display", "none");
      })
      .catch((err) => $("#preloader").css("display", "none"));
  };

  const makeClient = () => {
    setLoading(true);
    const url = "api/contact/create_contact/";
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      category: "prospect",
      username: user_info.username,
    };

    axios
      .post(url, payload)
      .then((response) => {
        let data = {
          client_id: response.data.contact_id,
          category: formData.category,
          email: formData.email,
          name: formData.name,
        };
        setSelectedClient((prevObjects) => [...prevObjects, data]);
        handleClose();
        setLoading(false);
        searchClient();
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleClickOpen = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    formData[name] = value;
    setFormData({
      ...formData,
    });
  };

  const btnDisable =
    selectedClient.length === 0 || !formData.subject || !formData.message;

  return (
    <div className="communication-con">
      <Dialog open={showPopup} onClose={handleClose}>
        <DialogContent className="py-2 py-3">
          <h1 className="client-log-popup-header">Customer Details</h1>
          <TextField
            margin="dense"
            label="Name*"
            variant="outlined"
            fullWidth
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Email ID*"
            type="email"
            variant="outlined"
            fullWidth
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
          />
          <FormControl fullWidth className="my-2">
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formData.category || ""}
              label="Age"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  category: e.target.value,
                });
              }}
            >
              <MenuItem value={"prospect"}>Prospect</MenuItem>
              <MenuItem value={"client"}>Client</MenuItem>
              <MenuItem value={"team member"}>Team Member</MenuItem>
              <MenuItem value={"business partner"}>Business Partner</MenuItem>
            </Select>
          </FormControl>
          <div className="client-log-popup-btn-con">
            <button
              className={
                formData.name !== "" &&
                formData.category !== "" &&
                formData.email !== ""
                  ? "btn-primary"
                  : "btn-disabled"
              }
              disabled={
                formData.name !== "" ||
                formData.category !== "" ||
                formData.email !== ""
                  ? false
                  : true
              }
              onClick={makeClient}
            >
              {!loading ? (
                "Confirm"
              ) : (
                <ThreeDots
                  height="25"
                  width="60"
                  radius="9"
                  color="white"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  wrapperClassName=""
                  visible={true}
                />
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="communication-content-header-btn">
        <div>
          <button onClick={() => navigate("/client-logs")}>Contacts</button>
        </div>
      </div>
      <div className="communication-content-left-wrapper">
        <div className="communication-content-left">
          <div className="communication-content-left-send">
            <div className="communication-send-con">
              <span>To:</span>
              <input
                placeholder="Enter Recipient’s Email Address"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <button onClick={handleClickOpen}>
                <AddIcon fontSize="small" />
              </button>
            </div>
            <div className="communication-contact">
              {selectedClient.map((item, index) => {
                return (
                  <div
                    className="communication-contact-item"
                    key={"client" + index}
                  >
                    <span>{item.name}</span>
                    <button
                      onClick={() => {
                        let index = selectedClient.indexOf(item);
                        if (index > -1) {
                          selectedClient.splice(index, 1);
                          setSelectedClient(
                            JSON.parse(JSON.stringify(selectedClient))
                          );
                        }
                      }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="communication-search-con">
            <p className="communication-search-con-header">Select contacts</p>
            <div className="communication-search">
              <div className="communication-search-input">
                <input
                  placeholder="Search"
                  onChange={(e) => setSearchData(e.target.value)}
                />
                <div className="communication-search-input-wrapper">
                  <button onClick={searchClient}>
                    <SearchIcon />
                  </button>
                </div>
              </div>
              <div className="communication-search-client">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClientData.map((item, index) => {
                      return (
                        <tr key={index + "contact"}>
                          <td>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              value=""
                              id="flexCheckDefault"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClient((prevObjects) => [
                                    ...prevObjects,
                                    item,
                                  ]);
                                } else {
                                  selectedClient.splice(index, 1);
                                  setSelectedClient(
                                    JSON.parse(JSON.stringify(selectedClient))
                                  );
                                }
                              }}
                            />
                          </td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="communication-content-right">
          <div className="communication-content-right-email">
            <p className="communication-content-right-header">Subject</p>
            <textarea
              placeholder="Write subject of the message"
              className="communication-email-subject-input"
              value={formData.subject}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  subject: e.target.value,
                });
              }}
            />
            <p className="communication-content-right-header mt-3">Message</p>
            <p className="communication-content-right-header2">
              Hello [Recipient’s Name],
            </p>
            <textarea
              className="communication-email-message-input"
              placeholder="Message"
              value={formData.message}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  message: e.target.value,
                });
              }}
            />
          </div>
          <div className="communication-content-right-btn">
            <button
              disabled={btnDisable}
              onClick={handleSubmit}
              className={
                "me-3 " + (btnDisable ? "btn-disabled " : "btn-primary")
              }
            >
              Send
            </button>
            <button
              onClick={() => setFormData({ subject: "", message: "" })}
              className={
                formData.subject || formData.message
                  ? "btn-primary"
                  : "btn-disabled "
              }
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <CardBottomBar />
    </div>
  );
}

export default Communication;
