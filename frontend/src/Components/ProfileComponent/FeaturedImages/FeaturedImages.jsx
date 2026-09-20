import React, { useState, useEffect, useRef } from "react";
import "./FeaturedImages.scss";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";
import BlurPopup from "../../../Components/BlurPopup/BlurPopup";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axios from "axios";
import toast from "react-hot-toast";

const deleteMUi =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/368d01e67faf4c96a52831ba7956a3d5.webp";

const ImagePreviewModal = ({
  isOpen,
  imageUrl,
  onClose,
  imageIndex,
  totalImages,
}) => {
  const [modalDimensions, setModalDimensions] = useState({
    width: 700,
    height: "80vh",
  });
  const [isImageLoading, setIsImageLoading] = useState(true);
  const imgRef = useRef(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const calculateModalDimensions = (naturalWidth, naturalHeight) => {
    const imageAspectRatio = naturalWidth / naturalHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = Math.min(900, viewportWidth * 0.9);
    const maxHeight = viewportHeight * 0.9;
    const minWidth = 400;
    const minHeight = 300;
    const uiSpaceHeight = 120;

    let calculatedWidth, calculatedHeight;

    if (imageAspectRatio > 1.5) {
      calculatedWidth = Math.min(maxWidth, Math.max(minWidth, 800));
      calculatedHeight = Math.min(
        maxHeight,
        Math.max(minHeight, calculatedWidth / imageAspectRatio + uiSpaceHeight)
      );
    } else if (imageAspectRatio < 0.7) {
      const availableHeight = maxHeight - uiSpaceHeight;
      calculatedHeight = Math.min(
        maxHeight,
        Math.max(minHeight + uiSpaceHeight, viewportHeight * 0.85)
      );
      calculatedWidth = Math.min(
        maxWidth,
        Math.max(
          minWidth,
          (calculatedHeight - uiSpaceHeight) * imageAspectRatio
        )
      );
    } else {
      const baseSize = Math.min(
        700,
        Math.min(maxWidth, maxHeight - uiSpaceHeight)
      );
      if (imageAspectRatio >= 1) {
        calculatedWidth = baseSize;
        calculatedHeight = baseSize / imageAspectRatio + uiSpaceHeight;
      } else {
        calculatedHeight = baseSize + uiSpaceHeight;
        calculatedWidth = baseSize * imageAspectRatio;
      }
    }

    return {
      width: Math.round(calculatedWidth),
      height: Math.round(calculatedHeight),
    };
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      const img = imgRef.current;
      const dimensions = calculateModalDimensions(
        img.naturalWidth,
        img.naturalHeight
      );
      setModalDimensions(dimensions);
      setIsImageLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setModalDimensions({ width: 700, height: "80vh" });
      setIsImageLoading(true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="image-preview-overlay" onClick={handleBackdropClick}>
      <div
        className={`image-preview-modal ${isImageLoading ? "loading" : ""}`}
        style={{
          width: `${modalDimensions.width}px`,
          height:
            typeof modalDimensions.height === "string"
              ? modalDimensions.height
              : `${modalDimensions.height}px`,
        }}
      >
        <button className="preview-close-btn" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 20, color: "white" }} />
        </button>
        <div className="preview-image-container">
          <img
            ref={imgRef}
            src={imageUrl}
            alt={`Featured Image ${imageIndex + 1}`}
            onLoad={handleImageLoad}
            style={{ opacity: isImageLoading ? 0 : 1 }}
          />
          {isImageLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  imageIndex,
  isDeleting,
}) => {
  if (!isOpen) return null;
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <BlurPopup
      className="delete-confirmation-overlay"
      onClick={handleBackdropClick}
    >
      <div className="delete-confirmation-dialog">
        <h3 className="dialog-title">Delete Image</h3>
        <p className="dialog-message">
          Are you sure you want to delete this featured image?
        </p>
        <p className="dialog-image-info">
          Image #{imageIndex !== null ? imageIndex + 1 : ""}
        </p>
        <div className="dialog-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </BlurPopup>
  );
};

const FeaturedImageEditDropdown = ({
  onReplace,
  onDelete,
  onDownload,
  hasImage,
  imageIndex,
  isReplacing,
}) => {
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

  if (!hasImage) return null;

  return (
    <div className="featured-image-edit-container" ref={dropdownRef}>
      <button
        className="featured-image-edit-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
        disabled={isReplacing}
      >
        <EditOutlinedIcon sx={{ fontSize: 20, color: "white" }} />
      </button>
      {isOpen && (
        <div className="featured-image-edit-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReplace(imageIndex);
              setIsOpen(false);
            }}
            type="button"
            className="dropdown-item"
            disabled={isReplacing}
          >
            <FileUploadOutlinedIcon sx={{ fontSize: 20, color: "#666666" }} />{" "}
            Replace
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(imageIndex);
              setIsOpen(false);
            }}
            type="button"
            className="dropdown-item"
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(imageIndex);
              setIsOpen(false);
            }}
            type="button"
            className="dropdown-item"
          >
            <GetAppIcon sx={{ fontSize: 20, color: "#666666" }} /> Download
          </button>
        </div>
      )}
    </div>
  );
};


function FeaturedImages({
  hasData,
  images,
  onUpdateImages,
  onAddImage,
  onMoveUp,
  onMoveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
  username,
  showInPreview: showInPreviewProp
}) {

  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteImageIndex, setDeleteImageIndex] = useState(null);
  const [previewImage, setPreviewImage] = useState({
    isOpen: false,
    url: "",
    index: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef(null);
  const imageContainerRef = useRef(null);

  const [showInPreview, setShowInPreview] = useState(false);
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
        is_feature_images: newValue, 
        username: username,
      };
  
      await axios.post("/api/profile/update_profile_settings/", payload, config);
  
      setShowInPreview(newValue);
  
      toast.success(
        `Feature Images ${newValue ? "visible" : "hidden"} in preview`
      );
    } catch (err) {
      console.error("Error updating preview setting:", err);
      toast.error("Failed to update preview setting.");
    }
  };

  const [gallery, setGallery] = useState([]);

  const getGallery = (username) => {
    return axios.post("/api/profile_gallery/get_gallery/", { username });
  };

  const uploadGalleryImage = (username,file,index) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("picture", file);
    if (index !== undefined) {
      const id=gallery[index].id
      formData.append("gallery_id", id);
    }

    return axios.post("/api/profile_gallery/create_update_gallery/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
    });
  };

  const deleteGalleryImage = (username, gallery_id) => {
    return axios.post(
      "/api/profile_gallery/delete_gallery/",
      { username, gallery_id },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      }
    );
  };

  useEffect(() => {
    const fetchGallery = async () => {
      if (!username) return;
      try {
        const res = await getGallery(username);
        setGallery(
          res.data.map((item, idx) => ({
            id: item.id,
            picture: item.profile_picture,
            column_number: item.column_number,
          }))
        );
      } catch (err) {
        console.error("Failed to load gallery:", err);
      }
    };

    fetchGallery();
  }, [username]);

  useEffect(() => {
    localStorage.setItem("featuredImagesShowInPreview", showInPreview);
  }, [showInPreview]);

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

  if (!hasData) {
    return null;
  }

  const totalImages = images ? images.length : 0;

  const getStepWidth = () => {
    const container = imageContainerRef.current;
    if (container && container.children.length > 1) {
      const firstCard = container.children[0];
      const secondCard = container.children[1];
      return secondCard.offsetLeft - firstCard.offsetLeft;
    }
    const cardElement = container?.querySelector(".featured_img_items");
    return (cardElement?.offsetWidth || 0) + 12;
  };

  const scrollLeft = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      imageContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (currentPage < totalImages) {
      const newPage = currentPage + 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      imageContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleMoveUp = () => {
    if (!isMoveUpDisabled && onMoveUp) onMoveUp();
    setShowDropdown(false);
  };

  const handleMoveDown = () => {
    if (!isMoveDownDisabled && onMoveDown) onMoveDown();
    setShowDropdown(false);
  };

  const handleImageClick = (imageUrl, index) => {
    setPreviewImage({ isOpen: true, url: imageUrl, index });
  };

  const closePreview = () => {
    setPreviewImage({ isOpen: false, url: "", index: 0 });
  };

  const handleReplaceImage = async (imageIndex) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const res = await uploadGalleryImage(username,file,imageIndex);
        const { picture } = res.data;
        const newList = [...images];
        newList[imageIndex] = picture;
        onUpdateImages(newList);
        setTimeout(() => {
          toast.success("Image replaced successfully!");
        }, 300);
      } catch (err) {
        console.error("Error uploading image:", err);
        setTimeout(() => {
          toast.error("Failed to replace image. Please try again.");
        }, 300);
      } finally {
        setReplacingIndex(null);
      }
    };

    input.click();
  };

const handleAddImage = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setIsAddingImage(true);
    setShowDropdown(false);

    try {
    
      await uploadGalleryImage(username, file);

      const refreshed = await getGallery(username);
      const refreshedGallery = Array.isArray(refreshed.data)
        ? refreshed.data
        : refreshed.data || [];

      setGallery(refreshedGallery);

      onUpdateImages(
        refreshedGallery.map((item) => item.profile_picture || item.picture)
      );

      toast.success("Image added successfully!");
    } catch (err) {
      console.error("Error adding image:", err);
      toast.error("Failed to add image. Please try again.");
    } finally {
      setIsUploading(false);
      setIsAddingImage(false);
    }
  };

  input.click();
};



  const handleDeleteImage = (imageIndex) => {
    setDeleteImageIndex(imageIndex);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteImageIndex === null) return;

    setIsDeleting(true);

    try {
      const galleryItem = gallery[deleteImageIndex];
    
      await deleteGalleryImage(username, galleryItem.id);

      const newGallery = gallery.filter((_, idx) => idx !== deleteImageIndex);
      setGallery(newGallery);
      onUpdateImages(newGallery.map((item) => item.picture));

      cancelDelete();

      setTimeout(() => {
        toast.success("Image deleted successfully!");
      }, 300);
    } catch (err) {
      console.error("Failed to delete image:", err);
      cancelDelete();

      setTimeout(() => {
        toast.error("Failed to delete image. Please try again.");
      }, 300);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteImageIndex(null);
  };

  const handleDownloadImage = (imageIndex) => {
    const imageUrl = images[imageIndex];
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `featured-image-${imageIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => window.open(imageUrl, "_blank"));
  };

  const handleMenuAction = (action) => {
    if (action === "Add an Image") {
      handleAddImage();
    } else if (action === "Toggle Preview") {
      updatePreviewSetting(); 
    }
  };

  return (
    <div className="featured_img_con">
      <div className="featured-images-header-container">
        <h2>Featured Images</h2>
        {!showInPreview && (
          <div className="hidden-tag">
            <VisibilityOffIcon style={{ fontSize: 20 }} />
            <span>Hidden in Preview</span>
          </div>
        )}
      </div>
      <h5>
        A picture speaks a thousand words. Adding max. 4 stunning visuals
        immensely improves credibility of your profile.
      </h5>
      <button
        className="profile_edit_menu_btn"
        onClick={toggleDropdown}
        style={{ background: showDropdown ? "#afafaf" : "#e7e7e7" }}
        disabled={isDeleting || replacingIndex !== null || isAddingImage}
      >
        <MoreHorizOutlinedIcon />
      </button>

      {showDropdown && (
        <div className="service-dropdown" ref={dropdownRef}>
          <button
            className={`dropdown-item ${
              images.length >= 4 || isAddingImage ? "disabled" : ""
            }`}
            onClick={() => handleMenuAction("Add an Image")}
            disabled={images.length >= 4 || isAddingImage}
          >
            <div className="dropdown-icon">
              <AddIcon style={{ fontSize: 20 }} />
            </div>{" "}
            {isAddingImage ? "Adding..." : "Add an Image"}
          </button>

          <button
            className={`dropdown-item ${isMoveUpDisabled ? "disabled" : ""}`}
            onClick={handleMoveUp}
            disabled={isMoveUpDisabled}
          >
            <div className="dropdown-icon">
              <ArrowUpwardOutlinedIcon style={{ fontSize: 20 }} />
            </div>{" "}
            Move up
          </button>

          <button
            className={`dropdown-item ${isMoveDownDisabled ? "disabled" : ""}`}
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

      <div
        className={`featured_img_item ${
          images.length === 1 ? "single" : "multiple"
        }`}
        ref={imageContainerRef}
      >
        {images.map((item, index) => (
          <div key={`image-${index}`} className="featured_img_items">
            {replacingIndex === index ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Replacing...
              </div>
            ) : (
              <>
                <img
                  src={item}
                  alt={`Featured ${index + 1}`}
                  onClick={() => handleImageClick(item, index)}
                  style={{ cursor: "pointer" }}
                />
                <FeaturedImageEditDropdown
                  hasImage={!!item}
                  imageIndex={index}
                  onReplace={handleReplaceImage}
                  onDelete={handleDeleteImage}
                  onDownload={handleDownloadImage}
                  isReplacing={replacingIndex === index}
                />
              </>
            )}
          </div>
        ))}

        {isAddingImage && (
          <div className="featured_img_items">
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#666",
                gap: "8px",
              }}
            >
              <div
                className="spinner"
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid #e0e0e0",
                  borderTop: "3px solid #666",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              Adding image...
            </div>
          </div>
        )}
      </div>

      <div className="profile_nav">
        <span>{totalImages > 0 ? `${currentPage}/${totalImages}` : ""}</span>

        <div>
          <button onClick={scrollLeft} disabled={currentPage === 1}>
            <KeyboardArrowLeftIcon />
          </button>
          <button onClick={scrollRight} disabled={currentPage === totalImages}>
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="upload-overlay">
          <div className="upload-overlay-content">
            <div className="upload-spinner"></div>
            <p>Uploading image...</p>
          </div>
        </div>
      )}

      <ImagePreviewModal
        isOpen={previewImage.isOpen}
        imageUrl={previewImage.url}
        onClose={closePreview}
        imageIndex={previewImage.index}
        totalImages={totalImages}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        imageIndex={deleteImageIndex}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default FeaturedImages;