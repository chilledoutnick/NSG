import React, { useState, useEffect, useRef } from "react";
import "./OtherLinks.scss";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import DragHandleOutlinedIcon from "@mui/icons-material/DragHandleOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BlurPopup from "../../../Components/BlurPopup/BlurPopup";
import toast from "react-hot-toast";
import axios from "axios";

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  linkUrl,
  loading,
}) => {
  if (!isOpen) return null;
  return (
    <BlurPopup
      className="delete-confirmation-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="delete-confirmation-dialog">
        <h3 className="dialog-title">Remove Link</h3>
        <p className="dialog-message">
          Are you sure you want to remove this link?
        </p>
        <p className="dialog-link">{linkUrl}</p>
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

function OtherLinks({
  hasData,
  links,
  onUpdateLinks,
  isModalOpen,
  onCloseModal,
  onOpenModal,
  onMoveUp,
  onMoveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
  username,
  showInPreview: showInPreviewProp,
  refreshLinks,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: "", link: "" });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [titleError, setTitleError] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const [showInPreview, setShowInPreview] = useState(false);

  
  const MAX_LINKS = 10;
  const hasReachedLimit = links.length >= MAX_LINKS;

  useEffect(() => {
    if (typeof showInPreviewProp === "boolean") {
      setShowInPreview(showInPreviewProp);
    }
  }, [showInPreviewProp]);

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  const updatePreviewSetting = async () => {
    try {
      const newValue = !showInPreview;
      const payload = {
        is_links: newValue,
        username: username,
      };

      await axios.post("/api/profile/update_profile_settings/", payload, config);

      setShowInPreview(newValue);

      toast.success(
        `OtherLink ${newValue ? "visible" : "hidden"} in preview`
      );
    } catch (err) {
      console.error("Error updating preview setting:", err);
      toast.error("Failed to update preview setting.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  if (!hasData && !isModalOpen) return null;

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleMoveUp = () => {
    if (!isMoveUpDisabled && onMoveUp) onMoveUp();
    setShowDropdown(false);
  };

  const handleMoveDown = () => {
    if (!isMoveDownDisabled && onMoveDown) onMoveDown();
    setShowDropdown(false);
  };

  const handleMenuAction = (action) => {
    if (action === "Add a Link") {

      if (hasReachedLimit) {
        toast.error("You can only add up to 10 links");
        setShowDropdown(false);
        return;
      }
      setEditingItem(null);
      setFormData({ title: "", link: "" });
      setTitleError(false);
      if (onOpenModal) onOpenModal();
    } else if (action === "Toggle Preview") {
      updatePreviewSetting();
    }
    setShowDropdown(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title") {
      setTitleError(value.length > 25);
    }
  };

  const closeModalAndReset = () => {
    if (onCloseModal) onCloseModal();
    setEditingItem(null);
    setFormData({ title: "", link: "" });
    setTitleError(false);
    setLoading(false);
  };

  const createOtherLink = async (data) => {
    try {
      const response = await axios.post("/api/profile/add_link/", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error("Error creating link:", err);
      throw err;
    }
  };

  const updateOtherLink = async (data) => {
    try {
      const response = await axios.post(`/api/profile/update_link/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error("Error updating link:", err);
      throw err;
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.link.trim()) return;


    if (!editingItem && hasReachedLimit) {
      toast.error("You can only add up to 10 links");
      return;
    }

    let finalLink = formData.link.trim();
    if (!/^https?:\/\//i.test(finalLink)) {
      finalLink = `https://${finalLink}`;
    }

    setLoading(true);
    let saveSuccess = false;
    let saveMessage = "";

    try {
      if (editingItem) {
        const updated = await updateOtherLink({
          link_id: editingItem.link_id,
          title: formData.title.trim(),
          link: finalLink,
          username,
        });

        const updatedLinks = links.map((item) =>
          item.link_id === editingItem.link_id ? { ...item, ...updated } : item
        );
        onUpdateLinks([...updatedLinks]);
        saveSuccess = true;
        saveMessage = "Link updated successfully!";
      } else {
        const response = await createOtherLink({
          title: formData.title.trim(),
          link: finalLink,
          username,
        });

        const newLink = response.links || response;
        await refreshLinks();

        saveSuccess = true;
        saveMessage = "Link added successfully!";
      }
    } catch (err) {
      console.error("Error saving link:", err);
      saveSuccess = false;
      saveMessage = "Failed to save link";
    } finally {
      closeModalAndReset();
      setTimeout(() => {
        saveSuccess ? toast.success(saveMessage) : toast.error(saveMessage);
      }, 250);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.name, link: item.link, link_id: item.link_id });
    setTitleError(item.name.length > 25);
    if (onOpenModal) onOpenModal();
  };

  const handleDeleteClick = (item) => {
    setDeleteItem(item);
    setShowDeleteDialog(true);
  };

  const deleteOtherLink = async (id) => {
    try {
      const response = await axios.post(
        "/api/profile/delete_link/",
        {
          link_id: id,
          username: username,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      console.log("Delete link response:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error deleting link:", err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setLoading(true);
    let deleteSuccess = false;
    let deleteMessage = "";

    try {
      console.log("Deleting link with ID:", deleteItem);
      await deleteOtherLink(deleteItem.link_id);
      const updatedLinks = links.filter(
        (data) => data.link_id !== deleteItem.link_id
      );
      await refreshLinks();
      deleteSuccess = true;
      deleteMessage = "Link deleted successfully!";
    } catch (err) {
      console.error("Error deleting link:", err);
      deleteSuccess = false;
      deleteMessage = "Failed to delete link";
    } finally {
      cancelDelete();
      setTimeout(() => {
        deleteSuccess
          ? toast.success(deleteMessage)
          : toast.error(deleteMessage);
      }, 250);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteItem(null);
    setLoading(false);
  };

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.link);
      toast.success("Copied successfully!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleOpenLink = (link) => {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.target.closest("tr").classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDragOverIndex(null);
    e.target.closest("tr").classList.remove("dragging");
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => setDragOverIndex(null);

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem && draggedItem.index !== dropIndex) {
      const newData = [...links];
      const draggedItemData = newData.splice(draggedItem.index, 1)[0];
      newData.splice(dropIndex, 0, draggedItemData);

      onUpdateLinks(newData);

      try {
        await axios.post(
          "/api/profile/sort_links/",
          {
            username,
            link_id: draggedItemData.link_id,
            new_sorting_id: dropIndex,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
          }
        );

        console.log("✅ Order updated successfully on server");
        toast.success("Link order updated!");
      } catch (error) {
        console.error("Failed to update order:", error);
        toast.error("Failed to update order");
      }
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const isSaveDisabled =
    !formData.title.trim() || !formData.link.trim() || titleError || loading;

  return (
    <div className="social_links_con">
      {hasData && (
        <>
          <div className="other-links-header-container">
            <h2>Other Links</h2>
            {!showInPreview && (
              <div className="hidden-tag">
                <VisibilityOffIcon style={{ fontSize: 20 }} />
                <span>Hidden in Preview</span>
              </div>
            )}
          </div>
          <h5>
            Add maximum of 10 links of your work OR digital media presence to
            back your profile credibility.
          </h5>
          <button
            className="profile_edit_menu_btn"
            onClick={toggleDropdown}
            style={{ background: showDropdown ? "#afafaf" : "#e7e7e7" }}
          >
            <MoreHorizOutlinedIcon />
          </button>

          {showDropdown && (
            <div className="service-dropdown" ref={dropdownRef}>
              <button
                className={`dropdown-item ${hasReachedLimit ? "disabled" : ""}`}
                onClick={() => handleMenuAction("Add a Link")}
                disabled={hasReachedLimit}
                style={{
                  opacity: hasReachedLimit ? 0.5 : 1,
                  cursor: hasReachedLimit ? 'not-allowed' : 'pointer'
                }}
              >
                <div className="dropdown-icon">
                  <AddIcon style={{ fontSize: 20 }} />
                </div>{" "}
                Add a Link 
              </button>
              <button
                className={`dropdown-item ${
                  isMoveUpDisabled ? "disabled" : ""
                }`}
                onClick={handleMoveUp}
                disabled={isMoveUpDisabled}
              >
                <div className="dropdown-icon">
                  <ArrowUpwardOutlinedIcon style={{ fontSize: 20 }} />
                </div>{" "}
                Move up
              </button>
              <button
                className={`dropdown-item ${
                  isMoveDownDisabled ? "disabled" : ""
                }`}
                onClick={handleMoveDown}
                disabled={isMoveDownDisabled}
              >
                <div className="dropdown-icon">
                  <ArrowDownwardOutlinedIcon style={{ fontSize: 20 }} />
                </div>{" "}
                Move down
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleMenuAction("Toggle Preview")}
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
          )}

          <table>
            <thead>
              <tr>
                <th>Title ({links.length}/{MAX_LINKS})</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${dragOverIndex === index ? "drag-over" : ""} ${
                    draggedItem && draggedItem.index === index ? "dragging" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <td>{item.name}</td>
                  <td className="link-cell">
                    <span className="link-text">{item.link}</span>
                  </td>
                  <td className="table_action">
                    <button
                      onClick={() => handleOpenLink(item.link)}
                      title="Open Link"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </button>
                    <button onClick={() => handleCopy(item)} title="Copy Link">
                      <ContentCopyIcon fontSize="small" />
                    </button>

                    <button onClick={() => handleEdit(item)} title="Edit Link">
                      <ModeEditOutlineOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      title="Delete Link"
                    >
                      <RemoveCircleOutlineIcon
                        fontSize="small"
                        style={{ color: "red" }}
                      />
                    </button>
                    <button
                      className="drag-handle"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, item, index)}
                      onDragEnd={handleDragEnd}
                      title="Drag to reorder"
                      style={{ cursor: "grab" }}
                    >
                      <DragHandleOutlinedIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {isModalOpen && (
        <BlurPopup onClose={closeModalAndReset} openState={isModalOpen}>
          <div className="blurpopup_con_wrapper profile_edit_popup">
            <h2>{editingItem ? "Edit Link" : "Add Link"}</h2>
            <h4 className="welcome_msg_text">
              {editingItem ? "Edit your link..." : "Add links of your work..."}
            </h4>

            <label htmlFor="linkTitle">Title (Max. 25 characters) *</label>
            <div className="input-with-counter">
              <input
                id="linkTitle"
                type="text"
                placeholder=" Add a Website"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={titleError ? "input-error" : ""}
                maxLength={26}
              />
              <span className="char-count">{formData.title.length}/25</span>
            </div>
            {titleError && (
              <p className="error-msg">Limit exceeded: max 25 characters</p>
            )}

            <label htmlFor="linkUrl">Enter link*</label>
            <input
              id="linkUrl"
              type="text"
              placeholder="e.g. YouTube link, Vimeo link, etc."
              value={formData.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
            />
            <div className="modal-buttons">
              <button
                onClick={closeModalAndReset}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={isSaveDisabled}
              >
                {loading
                  ? editingItem
                    ? "Updating..."
                    : "Saving..."
                  : editingItem
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
        linkUrl={deleteItem ? deleteItem.link : ""}
        loading={loading}
      />
    </div>
  );
}

export default OtherLinks;