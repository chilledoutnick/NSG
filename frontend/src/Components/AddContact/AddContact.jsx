import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { ThreeDots } from "react-loader-spinner";
import CloseIcon from "@mui/icons-material/Close";
import InsertPhotoIcon from "@mui/icons-material/InsertPhotoOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import CallIcon from "@mui/icons-material/CallOutlined";
import CakeIcon from "@mui/icons-material/CakeOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import InsertLinkIcon from "@mui/icons-material/InsertLink";

import SellIcon from "@mui/icons-material/SellOutlined";
import BlurPopup from "../BlurPopup/BlurPopup";
import "./AddContact.scss";

const defaultContactData = {
  name: "",
  email: "",
  phone: "",
  is_profile_pic: false,
  birthday: null,
  address: "",
  about: "",
  designation: "",
  company: "",
  priority: "Medium",
  additional_email: "",
  additional_phone: "",
};

const mapInitialDataToForm = (initialData) => {
  const safeInitialData = initialData || {};

  return {
  ...defaultContactData,
    name: safeInitialData.name || safeInitialData.fullName || "",
    email: safeInitialData.email || "",
    phone: safeInitialData.phone || "",
    birthday: safeInitialData.birthday || null,
    address: safeInitialData.address || "",
    about: safeInitialData.about || "",
    designation: safeInitialData.designation || "",
    company: safeInitialData.company || "",
    priority: safeInitialData.priority || "Medium",
    additional_email: safeInitialData.additional_email || "",
    additional_phone: safeInitialData.additional_phone || "",
  };
};

function AddContact(props) {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const [isAddMore, setIsAddMore] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [isAddTag, setIsAddTag] = useState(false);
  const [isAddMoreEmail, setIsAddMoreEmail] = useState(false);
  const [isAddMorePhone, setIsAddMorePhone] = useState(false);
  const [errorMsg, setErrorMSg] = useState("");
  const [SocialInputCount, setSocialInputCount] = useState(1);
  const [Picture, setPicture] = useState("");
  const [TagList, setTagList] = useState([]);
  const [selectedTags, setSelectedTags] = useState(["Manually Added"]);
  const [selectedSocial_links, setSelectedSocial_links] = useState([]);
  const [tag, setTag] = useState({
    tag: "",
    color: "",
  });
  const [Data, setData] = useState(() => mapInitialDataToForm(props.initialData));
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const formData = new FormData();
  formData.append("name", Data.name);
  formData.append("email", Data.email);
  formData.append("phone", Data.phone);
  formData.append("pictures", Picture);
  formData.append("is_profile_pic", Data.is_profile_pic);
  formData.append("birthday", Data.birthday);
  formData.append("address", Data.address);
  formData.append("tags", selectedTags);
  formData.append("about", Data.about);
  formData.append("designation", Data.designation);
  formData.append("company", Data.company);
  formData.append("priority", Data.priority);
  formData.append("social_links", selectedSocial_links);
  formData.append("additional_email", Data.additional_email);
  formData.append("additional_phone", Data.additional_phone);
  if (props.isEdit && props.selectedPeople) {
    formData.append("contact_id", props.selectedPeople.contact_id);
  }
  const colors = ["#A9CD08", "#4A35ED", "#EDB935", "#FFA794", "#58CCBE"];

  useEffect(() => {
    get_tags();
    if (props.isEdit) {
      setIsAddMore(true);
      setIsAddMoreEmail(true);
      setIsAddMorePhone(true);
      if (props.selectedPeople) {
        get_contact_data(props.selectedPeople.contact_id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.isEdit || !props.initialData) return;

    const mappedData = mapInitialDataToForm(props.initialData);
    setData(mappedData);
    setSelectedSocial_links(
      props.initialData.website ? [props.initialData.website] : [],
    );
    setSocialInputCount(props.initialData.website ? 1 : 1);
    setSelectedTags(["Manually Added"]);
    setTouchedFields({
      name: false,
      email: false,
      phone: false,
    });

    const hasAdditionalDetails = Boolean(
      mappedData.designation ||
        mappedData.company ||
        mappedData.address ||
        mappedData.about ||
        props.initialData.website,
    );
    setIsAddMore(hasAdditionalDetails);
    setIsAddMoreEmail(Boolean(mappedData.additional_email));
    setIsAddMorePhone(Boolean(mappedData.additional_phone));
  }, [props.initialData, props.isEdit]);

  const handleInputChange = (index, value) => {
    const updatedLinks = [...selectedSocial_links];
    updatedLinks[index] = value;
    setSelectedSocial_links(updatedLinks);
  };

  const addInput = () => {
    setSocialInputCount(SocialInputCount + 1);
    setSelectedSocial_links([...selectedSocial_links, ""]);
  };

  const create_contact = () => {
    setLoading(true);
    const url = "api/contact/create_contact/";
    axios
      .post(url, formData, config)
      .then((res) => {
        if (res.data.message === "Contact already exists") {
          setErrorMSg("Contact already exists");
          Swal.fire({
            icon: "warning",
            title: "Contact already exists",
            showConfirmButton: true,
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Contact added successfully",
            showConfirmButton: false,
            timer: 3000,
          });
          props.handleCLose();
          props.handleAddContact(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMSg(err.response.data.message);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  const update_contact = () => {
    setLoading(true);
    const url = "api/contact/update_contact/";
    axios
      .post(url, formData, config)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Contact added successfully",
          showConfirmButton: false,
          timer: 3000,
        });
        setErrorMSg("");
        props.handleCLose();
        props.handleUpdateContact(res.data.data[0]);
        setLoading(false);
        if (props.handleTimelineRefresh) {
          props.handleTimelineRefresh();
        }
      })
      .catch((err) => {
        setErrorMSg(err.response.data.message);
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...Data,
      [name]:
        name === "email" || name === "phone"
          ? value.replace(/\s+/g, "")
          : value,
    });

    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const get_contact_data = (contact_id) => {
    const url = "api/contact/get_contact_data/";
    const payload = {
      contact_id: contact_id,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        let data = res.data;
        setData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          is_profile_pic: data.is_profile_pic,
          birthday: data.birthday,
          address: data.address,
          about: data.about,
          designation: data.designation,
          company: data.company,
          priority: data.priority,
          additional_email: data.additional_email,
          additional_phone: data.additional_phone,
        });
        setSelectedSocial_links(data.social_links);
        setSocialInputCount(data.social_links.length);
        setPicture(data.image);
        setSelectedTags([]);
        data.tags.map((tag) => {
          return setSelectedTags((prev) => [...prev, tag.name]);
        });
      })
      .catch((err) => console.log("res", err));
  };

  const get_tags = () => {
    const url = "api/contact/get_tags/";
    axios
      .post(url, {}, config)
      .then((res) => setTagList(res.data.data))
      .catch((err) => console.log("err", err));
  };

  const add_tag = () => {
    const url = "api/contact/add_tag/";
    axios
      .post(url, tag, config)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Tag added successfully",
          showConfirmButton: false,
          timer: 3000,
        });
        get_tags();
        setIsAddTag(false);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "something went wrong.",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const isValidSubmission = () => {
    return Data.name.trim() && Data.email.trim() && Data.phone.trim();
  };

  return (
    <div className="add_contact_con">
      <div className="add_contact_wrapper">
        <button onClick={() => props.handleCLose()} className="close_btn">
          <CloseIcon />
        </button>
        <h5>{`${props.isEdit ? "Update contact" : "Add a new contact"}`}</h5>
        <div className="add_contact_input">
          <PersonOutlineIcon fontSize="small" className="input_icon" />
          <input
            name="name"
            type="text"
            placeholder="Name*"
            value={Data.name}
            onChange={handleChange}
          />
          {touchedFields.name && !Data.name.trim() && (
            <p className="error-text">*Name is required.</p>
          )}
        </div>
        <div className="add_contact_input">
          <EmailIcon fontSize="small" className="input_icon" />
          <input
            name="email"
            value={Data.email}
            onChange={handleChange}
            type="text"
            placeholder="Email ID*"
          />
          {touchedFields.email && !Data.email.trim() && (
            <p className="error-text">*Email is required.</p>
          )}
          {isAddMore && !isAddMoreEmail && (
            <button
              onClick={() => setIsAddMoreEmail(true)}
              className="add_more_btn"
            >
              Add more
            </button>
          )}
        </div>
        {isAddMoreEmail && (
          <div className="add_contact_input">
            <EmailIcon fontSize="small" className="input_icon" />
            <input
              name="additional_email"
              value={Data.additional_email}
              onChange={handleChange}
              type="text"
              placeholder="Additional email ID"
            />
            <button
              onClick={() => setIsAddMoreEmail(false)}
              className="add_more_btn"
            >
              Remove
            </button>
          </div>
        )}
        <div className="add_contact_input">
          <CallIcon fontSize="small" className="input_icon" />
          <input
            name="phone"
            type="text"
            placeholder="Phone no. (+1 XXX XXXXXXX)"
            value={Data.phone}
            onChange={handleChange}
          />
          {touchedFields.phone && !Data.phone.trim() && (
            <p className="error-text">*Phone number is required.</p>
          )}
          {isAddMore && !isAddMorePhone && (
            <button
              onClick={() => setIsAddMorePhone(true)}
              className="add_more_btn"
            >
              Add more
            </button>
          )}
        </div>

        {isAddMorePhone && (
          <div className="add_contact_input">
            <CallIcon fontSize="small" className="input_icon" />
            <input
              name="additional_phone"
              type="text"
              placeholder="Phone no. (+1 XXX XXXXXXX)"
              value={Data.additional_phone}
              onChange={handleChange}
            />
            <button
              onClick={() => setIsAddMorePhone(false)}
              className="add_more_btn"
            >
              Remove
            </button>
          </div>
        )}
        {Picture ? (
          <div className="add_contact_img">
            <img
              src={Picture.name ? URL.createObjectURL(Picture) : Picture}
              alt="Profile"
              loading="lazy"
            />
            <input
              type="file"
              onChange={(e) => setPicture(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="add_contact_input_img">
            <div className="InsertPhotoIcon">
              <InsertPhotoIcon className="icon" />
            </div>
            <p>
              If you falling short of time, quickly take a picture of your
              contact’s business card for now.
            </p>
            <input
              type="file"
              onChange={(e) => setPicture(e.target.files[0])}
            />
          </div>
        )}

        <div className="add_contact_input_checkbox">
          <input
            type="checkbox"
            checked={Data.is_profile_pic}
            onChange={(e) => {
              if (e.target.checked) {
                setData({
                  ...Data,
                  is_profile_pic: true,
                });
              } else {
                setData({
                  ...Data,
                  is_profile_pic: false,
                });
              }
            }}
          />
          <span>Add this as a display picture</span>
        </div>
        {!isAddMore ? (
          <button
            onClick={() => setIsAddMore(true)}
            className="add_more_details_btn"
          >
            <AddCircleOutlineIcon fontSize="small" /> Add more details
          </button>
        ) : (
          <>
            <label>Set a priority label</label>
            <div className="add_contact_input_priority">
              <div>
                <input
                  type="radio"
                  checked={Data.priority === "High"}
                  onChange={(e) => {
                    setData({
                      ...Data,
                      priority: "High",
                    });
                  }}
                />
                <span
                  onClick={() => {
                    setData({
                      ...Data,
                      priority: "High",
                    });
                  }}
                >
                  High
                </span>
              </div>
              <div>
                <input
                  type="radio"
                  checked={Data.priority === "Medium"}
                  onChange={(e) => {
                    setData({
                      ...Data,
                      priority: "Medium",
                    });
                  }}
                />
                <span
                  onClick={() => {
                    setData({
                      ...Data,
                      priority: "Medium",
                    });
                  }}
                >
                  Medium
                </span>
              </div>
              <div>
                <input
                  type="radio"
                  checked={Data.priority === "Low"}
                  onChange={(e) => {
                    setData({
                      ...Data,
                      priority: "Low",
                    });
                  }}
                />
                <span
                  onClick={() => {
                    setData({
                      ...Data,
                      priority: "Low",
                    });
                  }}
                >
                  Low
                </span>
              </div>
            </div>
            <label>Additional details</label>
            <div className="add_contact_input">
              <CakeIcon fontSize="small" className="input_icon" />
              <input
                value={Data.birthday}
                onChange={(e) => {
                  setData({
                    ...Data,
                    birthday: e.target.value,
                  });
                }}
                type="date"
                placeholder="Birthday"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="add_contact_input">
              <HomeIcon fontSize="small" className="input_icon" />
              <input
                name="address"
                type="text"
                placeholder="Address"
                value={Data.address}
                onChange={handleChange}
              />
            </div>
            <div className="add_contact_input">
              <EditNoteIcon fontSize="small" className="input_icon" />
              <input
                name="about"
                type="text"
                placeholder="About"
                value={Data.about}
                onChange={handleChange}
              />
            </div>
            <label>Work</label>
            <div className="add_contact_input">
              <AccountCircleIcon fontSize="small" className="input_icon" />
              <input
                name="designation"
                type="text"
                placeholder="Designation"
                value={Data.designation}
                onChange={handleChange}
              />
            </div>
            <div className="add_contact_input">
              <BusinessIcon fontSize="small" className="input_icon" />
              <input
                name="company"
                type="text"
                placeholder="Company"
                value={Data.company}
                onChange={handleChange}
              />
            </div>
            <label>Add links</label>
            {Array.from({ length: SocialInputCount }).map((_, index) => (
              <div className="add_contact_input">
                <InsertLinkIcon fontSize="small" className="input_icon" />
                <input
                  type="text"
                  placeholder="Social media, websites, etc"
                  key={index}
                  value={
                    selectedSocial_links ? selectedSocial_links[index] : ""
                  }
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
                <button onClick={addInput} className="add_more_btn">
                  Add more
                </button>
              </div>
            ))}

            <label>Add a tag</label>
            <div className="add_contact_input_tags">
              {/* {TagList.map((tag, id) => {
                return (
                  <div key={id + "tag"} className="contact_tag">
                    <input
                      type="checkbox"
                      placeholder="Social media, websites, etc"
                      checked={selectedTags.includes(tag.name)} */}
                      {TagList.map((tag, id) => {
  const userTags = selectedTags.filter(
    t => t !== "Manually Added" && t !== "Business Card" && t !== "Added from Schedule"
  );
  const atMax = userTags.length >= 3 && !selectedTags.includes(tag.name);
  
  return (
    <div 
      key={id + "tag"} 
      className={"contact_tag " + (atMax ? "contact_tag_disabled" : "")}
    >
      <input
        type="checkbox"
        disabled={atMax}
        placeholder="Social media, websites, etc"
        checked={selectedTags.includes(tag.name)}
                      // onChange={(e) => {
                      //   if (e.target.checked) {
                      //     setSelectedTags((prev) => [...prev, tag.name]);
                      //   } else {
                      //     setSelectedTags((prev) =>
                      //       prev.filter((item) => item !== tag.name)
                      //     );
                      //   }
                      // }}

                      onChange={(e) => {
  if (e.target.checked) {
    // System tags count mein mat lo
    const userTags = selectedTags.filter(
      t => t !== "Manually Added" && t !== "Business Card" && t !== "Added from Schedule"
    );
    if (userTags.length >= 3) return; // MAX 3 limit
    setSelectedTags((prev) => [...prev, tag.name]);
  } else {
    setSelectedTags((prev) =>
      prev.filter((item) => item !== tag.name)
    );
  }
}}
                    />
                    <label
                      style={{
                        backgroundColor: `${tag.color}1A`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </label>
                  </div>
                );
              })}
            </div>
            {(() => {
  const userTagCount = selectedTags.filter(
    t => t !== "Manually Added" && t !== "Business Card" && t !== "Added from Schedule"
  ).length;
  return userTagCount >= 3 ? (
    <p style={{ fontSize: 12, color: "#f59e0b", margin: "4px 0 8px" }}>
      Maximum 3 tags allowed
    </p>
  ) : null;
})()}
            <button
            
              onClick={() => setIsAddTag(true)}
              className="add_contact_tag"
            >
              <AddCircleOutlineIcon fontSize="small" /> Create a tag
            </button>
            {isAddTag && (
              <BlurPopup
                onClose={() => setIsAddTag(false)}
                openState={isAddTag}
              >
                <div className="blurpopup_con_wrapper add_contact_tag_content">
                  <h3>
                    <SellIcon /> Create a tag
                  </h3>
                  <input
                    type="text"
                    placeholder="Add a name for your tag"
                    onChange={(e) =>
                      setTag({
                        ...tag,
                        tag: e.target.value,
                      })
                    }
                  />
                  {tag.tag && (
                    <>
                      <p>Choose a colour for your tag</p>
                      <div className="tag_colors">
                        {colors.map((item, index) => {
                          return (
                            <button
                              style={{ backgroundColor: item }}
                              key={index}
                              onClick={() => {
                                setTag({
                                  ...tag,
                                  color: item,
                                });
                              }}
                              className={tag.color === item ? "active" : ""}
                            ></button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <div className="add_contact_tag_btns">
                    <button
                      onClick={() => props.handleCLose()}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={tag.color === "" || tag.name === ""}
                      onClick={add_tag}
                      className="btn-primary"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </BlurPopup>
            )}
          </>
        )}
      </div>
      {errorMsg && (
        <p className="error" style={{ marginLeft: 24, textAlign: "center" }}>
          {errorMsg}
        </p>
      )}
      <div className="add_contact_btns">
        <button onClick={() => props.handleCLose()} className="btn-outline">
          Cancel
        </button>
        <button
          disabled={!isValidSubmission()}
          onClick={() => {
            if (props.isEdit) {
              update_contact();
            } else {
              create_contact();
            }
          }}
          className="btn-primary"
        >
          {!Loading ? (
            props.isEdit ? (
              "Update"
            ) : (
              "Add to list"
            )
          ) : (
            <ThreeDots
              height="25"
              width="60"
              radius="9"
              color="white"
              ariaLabel="three-dots-loading"
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default AddContact;
