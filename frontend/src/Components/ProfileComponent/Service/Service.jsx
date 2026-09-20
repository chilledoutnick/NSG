import "./Service.scss";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import $ from "jquery";
import React, { useState, useEffect, useRef } from "react";
import BlurPopup from "../../../Components/BlurPopup/BlurPopup";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import toast from "react-hot-toast";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axios from "axios";

const deleteMUi =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/368d01e67faf4c96a52831ba7956a3d5.webp";



const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  loading,
}) => {
  if (!isOpen) return null;
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (!loading) onClose();
    }
  };
  return (
    <BlurPopup
      className="delete-confirmation-overlay"
      onClick={handleBackdropClick}
    >
      <div className="delete-confirmation-dialog">
        <h3 className="dialog-title">Delete Service</h3>
        <p className="dialog-message">
          Are you sure you want to delete this service?
        </p>
        <p className="dialog-service-name">{serviceName}</p>
        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </BlurPopup>
  );
};

const ServiceImageDropdown = ({ onReplace, onDelete, hasImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleReplace = () => {
    onReplace();
    setIsOpen(false);
  };
  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };
  if (!hasImage) return null;
  return (
    <div
      className="three-dot-dropdown-container"
      ref={dropdownRef}
      style={{ position: "absolute", top: "12px", right: "12px", zIndex: 9999 }}
    >
      <button
        className="three-dot-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#535353",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: "0",
        }}
      >
        <EditOutlinedIcon sx={{ fontSize: 20, color: "white" }} />
      </button>
      {isOpen && (
        <div
          style={{
            padding: "20px",
            gap: 8,
            position: "absolute",
            top: "calc(100% + 7px)",
            right: "0px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "rgba(0, 0, 0, 0.12) 0px 4px 16px",
            border: "1px solid rgb(240, 240, 240)",
            minWidth: "180px",
            zIndex: 10000,
          }}
        >
          <button
            onClick={handleReplace}
            type="button"
            style={{
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: "white",
              fontFamily: "var(--font-popins) !important",
              fontSize: "16px",
              color: "#333333",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#EEEEEE")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
          >
            <FileUploadOutlinedIcon sx={{ fontSize: 20, color: "#666666" }} />{" "}
            Replace
          </button>
          <button
            onClick={handleDelete}
            type="button"
            style={{
              width: "100%",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: "white",
              color: "#333333",
              fontFamily: "var(--font-popins)",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#EEEEEE")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
          >
            <img
              src={deleteMUi}
              style={{
                width: "20px",
                height: "20px",
                filter:
                  "brightness(0) saturate(100%) invert(40%) sepia(4%) saturate(316%) hue-rotate(203deg) brightness(96%) contrast(90%)",
              }}
              alt="Delete Icon"
            />{" "}
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ServiceDropdown = ({
  isOpen,
  onClose,
  buttonRef,
  onAddService,
  onMoveUp,
  onMoveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
  showInPreview,
  updatePreviewSetting
}) => {
  const dropdownRef = useRef(null);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, buttonRef]);

  if (!isOpen) return null;

  return (
    <div className="service-dropdown" ref={dropdownRef}>
      <button
        onClick={() => {
          onAddService();
          onClose();
        }}
        className="dropdown-item"
      >
        <div className="dropdown-icon">
          <AddIcon style={{ fontSize: 20 }} />
        </div>{" "}
        Add a Service
      </button>

      <button
        className={`dropdown-item ${isMoveUpDisabled ? "disabled" : ""}`}
        onClick={!isMoveUpDisabled ? onMoveUp : undefined}
        disabled={isMoveUpDisabled}
      >
        <div className="dropdown-icon">
          <ArrowUpwardOutlinedIcon style={{ fontSize: 20 }} />
        </div>{" "}
        Move up
      </button>

      <button
        className={`dropdown-item ${isMoveDownDisabled ? "disabled" : ""}`}
        onClick={!isMoveDownDisabled ? onMoveDown : undefined}
        disabled={isMoveDownDisabled}
      >
        <div className="dropdown-icon">
          <ArrowDownwardOutlinedIcon style={{ fontSize: 20 }} />
        </div>{" "}
        Move down
      </button>

      <button
  onClick={updatePreviewSetting}
  className="dropdown-item"
>

        <div className="dropdown-icon">
          {showInPreview ? (
            <VisibilityOffIcon style={{ fontSize: 20 }} />
          ) : (
            <VisibilityIcon style={{ fontSize: 20 }} />
          )}
        </div>
        {showInPreview ? "Hide in Preview" : "Show in Preview"}
      </button>
    </div>
  );
};

const ServiceCardDropdown = ({
  isOpen,
  onClose,
  serviceIndex,
  onEditService,
  onDeleteService,
  onMoveLeft,
  onMoveRight,
  pencilIconRef,
  canMoveLeft,
  canMoveRight,
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        pencilIconRef.current &&
        !pencilIconRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, pencilIconRef]);
  if (!isOpen) return null;
  return (
    <div className="service-dropdown service-card-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-item"
        onClick={() => {
          onEditService(serviceIndex);
          onClose();
        }}
      >
        <div className="dropdown-icon">
          <EditOutlinedIcon style={{ fontSize: 20 }} />
        </div>{" "}
        Edit service
      </button>
      <button
        className={`dropdown-item ${!canMoveRight ? "disabled" : ""}`}
        onClick={() => {
          if (canMoveRight) {
            onMoveRight(serviceIndex);
            onClose();
          }
        }}
        disabled={!canMoveRight}
      >
        <div className="dropdown-icon">
          <KeyboardArrowRightIcon style={{ fontSize: 20 }} />
        </div>{" "}
        Move to right
      </button>
      <button
        className={`dropdown-item ${!canMoveLeft ? "disabled" : ""}`}
        onClick={() => {
          if (canMoveLeft) {
            onMoveLeft(serviceIndex);
            onClose();
          }
        }}
        disabled={!canMoveLeft}
      >
        <div className="dropdown-icon">
          <KeyboardArrowLeftIcon style={{ fontSize: 20 }} />
        </div>{" "}
        Move to left
      </button>
      <button
        className="dropdown-item"
        onClick={() => {
          onDeleteService(serviceIndex);
          onClose();
        }}
      >
        <div className="dropdown-icon">
          <img
            src={deleteMUi}
            style={{
              width: "20px",
              height: "20px",
              filter:
                "brightness(0) saturate(100%) invert(40%) sepia(4%) saturate(316%) hue-rotate(203deg) brightness(96%) contrast(90%)",
            }}
            alt="Delete icon"
          />
        </div>{" "}
        Delete
      </button>
    </div>
  );
};

function Service({
  hasData,
  services,
  props,
  username,
  onUpdateServices,
  isModalOpen,
  onCloseModal,
  onOpenModal,
  onMoveUp,
  onMoveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
  showInPreview: showInPreviewProp,
  fetchServices,
}) {

  const [showDropdown, setShowDropdown] = useState(false);
  const [serviceDropdowns, setServiceDropdowns] = useState({});
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    link: "",
    img: null,
    imgPreview: null,
  });

  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteServiceIndex, setDeleteServiceIndex] = useState(null);
  const buttonRef = useRef(null);
  const pencilIconRefs = useRef({});
  const servicesRef = useRef(null);
  const [linkError, setLinkError] = useState(false);
  const [showInPreview, setShowInPreview] = useState(false);
   
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };
   const updatePreviewSetting = async () => {
  try {
    const newValue = !showInPreview; 
    const payload = {
      is_service: newValue, 
      username: username,
    };

    await axios.post("/api/profile/update_profile_settings/", payload, config);

    setShowInPreview(newValue);

    toast.success(
      `Service section ${newValue ? "visible" : "hidden"} in preview`
    );
  } catch (err) {
    console.error("Error updating preview setting:", err);
    toast.error("Failed to update preview setting.");
  }
};
useEffect(() => {
  if (typeof showInPreviewProp === "boolean") {
    setShowInPreview(showInPreviewProp);
  }
}, [showInPreviewProp]);


  useEffect(() => {
    const isValid =
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.img !== "" &&
      !errors.title &&
      !errors.description;
    setIsFormValid(isValid);
  }, [formData, errors]);

  useEffect(() => {
    const isValid =
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.img !== "" &&
      !errors.title &&
      !errors.description &&
      !linkError;
    setIsFormValid(isValid);
  }, [formData, errors, linkError]);

  if (!hasData && !isModalOpen) {
    return null;
  }

  const totalServices = services ? services.length : 0;

  const getScrollDistance = () => {
    if (window.innerWidth <= 576) {
      return 264 + 13;
    }
    return 400 + 16;
  };

  const isValidUrl = (url) => {
    if (!url) return true; 
    
    return /^(https?:\/\/)?(www\.)?[\w-]+\.[\w-]+[^\s]*$/.test(url.trim());
  };

  const scrollRight = () => {
    if (currentPage < totalServices) {
      const itemWidth = getScrollDistance();
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const newScrollLeft = (newPage - 1) * itemWidth;
      $("#service_items").animate({ scrollLeft: newScrollLeft }, 300);
    }
  };

  const scrollLeft = () => {
    if (currentPage > 1) {
      const itemWidth = getScrollDistance();
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const newScrollLeft = (newPage - 1) * itemWidth;
      $("#service_items").animate({ scrollLeft: newScrollLeft }, 300);
    }
  };

  const handleAddService = () => {
    if (services.length >= 10) {
      toast.error("You can add a maximum of 10 services only.");
      return;
    }
    setEditingService(null);
    setFormData({ title: "", description: "", link: "", img: null });
    setErrors({ title: false, description: false });
    if (onOpenModal) onOpenModal();
  };

  const handleEditService = (serviceIndex) => {
    const serviceToEdit = services[serviceIndex];
    setEditingService(serviceIndex);
    setFormData({
      id: serviceToEdit.service_id ?? serviceToEdit.id,
      title: serviceToEdit.name,
      description: serviceToEdit.desc,
      link: serviceToEdit.url,
      img: null,
      imgPreview: serviceToEdit.service_img,
    });
    setErrors({
      title: serviceToEdit.name.length > 20,
      description: serviceToEdit.desc.length > 100,
    });
    if (onOpenModal) onOpenModal();
  };

  const handleDeleteService = (serviceIndex) => {
    setDeleteServiceIndex(serviceIndex);
    setShowDeleteDialog(true);
  };

  const delete_service = (id) => {
    const payload = {
      service_id: id,
      username: username,
    };
    return axios.post(
      "/api/profile_service/delete_service_new/",
      payload,
      config
    );
  };

  


  const confirmDelete = async () => {
  if (deleteServiceIndex === null) return;
  setLoading(true);
  try {
    const serviceToDelete = services[deleteServiceIndex];
    const id = serviceToDelete.service_id ?? serviceToDelete.id;
    if (!id) {
      toast.error("Service ID not found!");
      setLoading(false);
      return;
    }
    await delete_service(id);

    const updatedServices = services.filter(
      (_, index) => index !== deleteServiceIndex
    );
    onUpdateServices(updatedServices);
    toast.success("Service deleted!");
    await fetchServices();
  } catch (err) {
    console.error("Error deleting service:", err);
    toast.error("Failed to delete service.");
  } finally {
    setShowDeleteDialog(false);
    setDeleteServiceIndex(null);
    setLoading(false);
  }
};


  const cancelDelete = () => {
    if (!loading) {
      setShowDeleteDialog(false);
      setDeleteServiceIndex(null);
    }
  };

  const post_service_sorting = (username, sortingList) => {
    const data = {
      username: username,
      sorting_list: sortingList,
    };
    return axios.post("/api/service/post_service_sorting_new/", data);
  };

  const handleMoveServiceLeft = async (serviceIndex) => {
    if (serviceIndex > 0) {
      const newServices = [...services];
      [newServices[serviceIndex], newServices[serviceIndex - 1]] = [
        newServices[serviceIndex - 1],
        newServices[serviceIndex],
      ];
      onUpdateServices(newServices);

      try {

        const sortingPayload = newServices.map((s, index) => ({
          service_id: s.service_id,
          sorting_id: index,
        }));
        await post_service_sorting(username, sortingPayload);
        toast.success("Service moved to the left.");
      } catch (err) {
        console.error("Error updating sorting:", err);
        toast.error("Failed to update service order.");
      }
    }
  };

  const handleMoveServiceRight = async (serviceIndex) => {
    if (serviceIndex < services.length - 1) {
      const newServices = [...services];
      [newServices[serviceIndex], newServices[serviceIndex + 1]] = [
        newServices[serviceIndex + 1],
        newServices[serviceIndex],
      ];
      onUpdateServices(newServices);

      try {
        const sortingPayload = newServices.map((s, index) => ({
          service_id: s.service_id,
          sorting_id: index,
        }));
        await post_service_sorting(username, sortingPayload);
        toast.success("Service moved to the right.");
      } catch (err) {
        console.error("Error updating sorting:", err);
        toast.error("Failed to update service order.");
      }
    }
  };

  const toggleServiceDropdown = (serviceIndex, event) => {
    event.stopPropagation();
    setServiceDropdowns((prev) => ({
      ...prev,
      [serviceIndex]: !prev[serviceIndex],
    }));
  };

  const closeServiceDropdown = (serviceIndex) => {
    setServiceDropdowns((prev) => ({ ...prev, [serviceIndex]: false }));
  };

  const handleInputChange = (field, value) => {
    let hasError = false;
    if (field === "title" && value.length > 20) {
      hasError = true;
    }
    if (field === "description" && value.length > 100) {
      hasError = true;
    }
    if (field === "link") {
      setLinkError(!!value && !isValidUrl(value));
    }
    setErrors((prev) => ({ ...prev, [field]: hasError }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    if (!loading) {
      if (onCloseModal) onCloseModal();
      setEditingService(null);
      setFormData({
        id: null,
        title: "",
        description: "",
        link: "",
        img: null,
        imgPreview: "",
      });
      setErrors({ title: false, description: false });
    }
  };

  const create_service = async (payload) => {
    const url = "api/profile_service/create_services_new/";
    try {
      const res = await axios.post(url, payload, config);
      return res;
    } catch (err) {
      
      throw err;
    }
  };

  const update_service = async (id, payload) => {
    payload.append("service_id", id);
    const url = "api/profile_service/update_services_new/";
    try {
      const res = await axios.post(url, payload, config);
      return res;
    } catch (err) {
      
      toast.error("Failed to update service.");
      throw err;
    }
  };

  const handleSave = async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    setLoading(true);
    try {
      let response;
      const data = new FormData();
      data.append("username", username);
      data.append("name", formData.title.trim());
      data.append("desc", formData.description.trim());
      data.append("url", formData.link.trim());

      if (formData.img instanceof File) {
        data.append("service_img", formData.img);
      }

      if (editingService !== null) {
        response = await update_service(formData.id, data);
        
        const updatedServices = [...services];
        updatedServices[editingService] = {
          ...updatedServices[editingService],
          ...response.data.updated_field,
        };

        onUpdateServices(updatedServices);
        toast.success("Service updated successfully!");
      } else {
        response = await create_service(data);
        const newService = response.data;
        onUpdateServices([...services, newService]);
        toast.success("Service created successfully!");
      }
      await fetchServices();
      closeModal();
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Failed to save service.");
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          img: file,
          imgPreview: URL.createObjectURL(file),
        }));
      }
    }
  };

  const handleReplaceImage = () => {
    document.getElementById("serviceImageInput").click();
  };

  const handleDeleteImage = () => {
    setFormData((prev) => ({ ...prev, img: "" }));
  };

  const handleOpenLink = (link) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="service_con">
      {hasData && (
        <>
          <div className="service-header-container">
            <h2>Services</h2>
            {!showInPreview && (
              <div className="hidden-tag">
                <VisibilityOffIcon style={{ fontSize: 20 }} />
                <span>Hidden in Preview</span>
              </div>
            )}
          </div>
          <h5>
            Adding services improves lead generation by ~33%. Make sure you
            provide a maximum of 10 services with solid visual, description, and
            link.
          </h5>
          <button
            ref={buttonRef}
            onClick={() => setShowDropdown(!showDropdown)}
            className="profile_edit_menu_btn"
          >
            <MoreHorizOutlinedIcon />
          </button>
          <ServiceDropdown
            isOpen={showDropdown}
            onClose={() => setShowDropdown(false)}
            buttonRef={buttonRef}
            onAddService={handleAddService}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isMoveUpDisabled={isMoveUpDisabled}
            isMoveDownDisabled={isMoveDownDisabled}
            showInPreview={showInPreview}
            updatePreviewSetting={updatePreviewSetting}
          />
          <div className="service_items" id="service_items" ref={servicesRef}>
            {services.map((item, id) => (
              <div key={`service-${id}`} className="service_item">
                
                <div
                  className="service_item_img_container"
                  style={{ position: "relative" }}
                >
                  {item.service_img &&(
                    <img src={item.service_img} alt={`${item.name} service`} />
                )}
                  
                  <div
                    className="pencil-icon"
                    ref={(ref) => (pencilIconRefs.current[id] = ref)}
                    onClick={(event) => toggleServiceDropdown(id, event)}
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#535353",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 999,
                    }}
                  >
                    <EditOutlinedIcon
                      style={{ fontSize: 20, color: "white" }}
                    />
                  </div>
                </div>
                <div className="service_item_text">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <button
                    onClick={() => handleOpenLink(item.url)}
                    disabled={!item.url}
                    style={{
                      opacity: item.url ? 1 : 0.5,
                      cursor: item.url ? "pointer" : "not-allowed",
                    }}
                  >
                    Open Link <OpenInNewIcon />
                  </button>
                </div>
                <ServiceCardDropdown
                  isOpen={serviceDropdowns[id] || false}
                  onClose={() => closeServiceDropdown(id)}
                  serviceIndex={id}
                  onEditService={handleEditService}
                  onDeleteService={handleDeleteService}
                  onMoveLeft={handleMoveServiceLeft}
                  onMoveRight={handleMoveServiceRight}
                  pencilIconRef={{ current: pencilIconRefs.current[id] }}
                  canMoveLeft={id > 0}
                  canMoveRight={id < totalServices - 1}
                />
              </div>
            ))}
          </div>
          <div className="profile_nav">
            <span>
              {totalServices > 0 ? `${currentPage}/${totalServices}` : ""}
            </span>
            <div>
              <button onClick={scrollLeft} disabled={currentPage === 1}>
                <KeyboardArrowLeftIcon />
              </button>
              <button
                onClick={scrollRight}
                disabled={currentPage === totalServices}
              >
                <KeyboardArrowRightIcon />
              </button>
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <BlurPopup onClose={closeModal} openState={isModalOpen}>
          <div className="blurpopup_con_wrapper profile_edit_popup">
            <h2>
              {editingService !== null ? "Edit Service" : "Add a Service"}
            </h2>
            <h4 className="welcome_msg_text">
              Provide an image, description, and link to your services.
            </h4>
            <div className="service_img_upload_container">
              {formData.imgPreview ? (
                <div className="service_img_con">
                  <img src={formData.imgPreview} alt="Service preview" />
                  <ServiceImageDropdown
                    hasImage={!!formData.imgPreview}
                    onReplace={handleReplaceImage}
                    onDelete={handleDeleteImage}
                  />
                </div>
              ) : (
                <div
                  className="service_img_placeholder"
                  onClick={() =>
                    document.getElementById("serviceImageInput").click()
                  }
                >
                  <div className="add_icon_circle">
                    <AddOutlinedIcon className="add_circle_icon" />
                  </div>
                  <span className="add_image_text">Add an Image *</span>
                </div>
              )}
              <input
                id="serviceImageInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>

            <label htmlFor="serviceTitle">
              Title of your service (Max. 20 characters) *
            </label>
            <input
              id="serviceTitle"
              type="text"
              placeholder="Electrician"
              value={formData.title}
              maxLength={21}
              onChange={(e) => handleInputChange("title", e.target.value)}
              style={{ borderColor: errors.title ? "red" : "", overflow: "unset" }}
            />
            {errors.title && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 20 characters
              </span>
            )}
            <span
              style={{
                fontSize: "12px",
                color: errors.title ? "red" : "inherit",
                textAlign: "right",
                width: "100%",
                marginTop: "4px",
              }}
            >
              {formData.title.length}/20
            </span>

            <label htmlFor="serviceDescription">
              Description (Max. 100 characters) *
            </label>
            <textarea
              id="serviceDescription"
              className="add_input"
              style={{
                ...(errors.description ? { borderColor: "red" } : {}),
                minHeight: 58,
              }}
              placeholder="Licensed electrician..."
              value={formData.description}
              maxLength={101}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <span className="error-message" style={{ color: "red" }}>
                Limit exceeded: 100 characters
              </span>
            )}
            <span
              style={{
                fontSize: "12px",
                color: errors.description ? "red" : "inherit",
                textAlign: "right",
                width: "100%",
                marginTop: "4px",
              }}
            >
              {formData.description.length}/100
            </span>

            <label htmlFor="serviceLink">Enter link (Optional)</label>
            <input
              id="serviceLink"
              type="url"
              placeholder="https://www.xyz.com/about"
              value={formData.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
              style={{ borderColor: linkError ? "red" : undefined }}
            />
            {linkError && (
              <span style={{ color: "red", fontSize: "12px" }}>
                Please enter a valid URL (http/https/www).
              </span>
            )}

            <div className="profile_btn">
              <button
                onClick={closeModal}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-save"
                disabled={!isFormValid || loading}
              >
                {loading
                  ? editingService !== null
                    ? "Updating..."
                    : "Saving..."
                  : editingService !== null
                  ? "Update"
                  : "Save"}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        serviceName={
          deleteServiceIndex !== null && services[deleteServiceIndex]
            ? services[deleteServiceIndex].name
            : ""
        }
        loading={loading}
      />
    </div>
  );
}

export default Service;
