import React, { useState, useEffect, useRef } from "react";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Rating from "@mui/material/Rating";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import "./ProfileReview.scss";
import BlurPopup from "../../BlurPopup/BlurPopup";
import axios from "axios";
import toast from "react-hot-toast";

const deleteMUi =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/368d01e67faf4c96a52831ba7956a3d5.webp";

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  reviewName,
  isDeleting,
}) => {
  if (!isOpen) return null;
  return (
    <BlurPopup
      className="delete-confirmation-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="delete-confirmation-dialog">
        <h3 className="dialog-title">Remove Review</h3>
        <p className="dialog-message">
          Are you sure you want to remove this review?
        </p>
        <p className="dialog-link">{reviewName}</p>
        <div className="dialog-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.6 : 1,
            }}
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

const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text;
};

function ProfileReview({
  hasData,
  reviews,
  onUpdateReviews,
  isModalOpen,
  onCloseModal,
  onOpenModal,
  onMoveUp,
  onMoveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
  username,
  showInPreview: showInPreviewProp,
}) {
  const [rating, setRating] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const [isCharLimitExceeded, setIsCharLimitExceeded] = useState(false);
  const reviewContainerRef = useRef(null);
  const messageRef = useRef(null);
  const [expandedReview, setExpandedReview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [reviews]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.style.height = "auto";
      messageRef.current.style.height = `${messageRef.current.scrollHeight}px`;
    }
  }, [message]);

  const [showInPreview, setShowInPreview] = useState(false);

  useEffect(() => {
    if (typeof showInPreviewProp === "boolean") {
      setShowInPreview(showInPreviewProp);
    }
  }, [showInPreviewProp]);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const total = reviews.reduce(
        (sum, item) => sum + (item?.ratings || 0),
        0
      );
      const avg = total / reviews.length;
      setRating(avg);
    } else {
      setRating(0);
    }
  }, [reviews]);

  const updatePreviewSetting = async () => {
    try {
      const newValue = !showInPreview;
      const payload = {
        is_reviews: newValue,
        username: username,
      };

      await axios.post(
        "/api/profile/update_profile_settings/",
        payload,
        config
      );

      setShowInPreview(newValue);

      toast.success(`Reviews ${newValue ? "visible" : "hidden"} in preview`);
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

  if (!hasData && !isModalOpen) {
    return null;
  }

  const totalReviews = reviews ? reviews.length : 0;
  const getStepWidth = () => {
    const container = reviewContainerRef.current;
    if (container && container.children.length > 1) {
      const firstCard = container.children[0];
      const secondCard = container.children[1];
      return secondCard.offsetLeft - firstCard.offsetLeft;
    }
    return 300 + 12;
  };

  const scrollRight = () => {
    if (currentPage < totalReviews) {
      const newPage = currentPage + 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      reviewContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const itemWidth = getStepWidth();
      const newScrollLeft = (newPage - 1) * itemWidth;

      setCurrentPage(newPage);
      reviewContainerRef.current.scrollTo({
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

  const handleMenuAction = (action) => {
    if (action === "Request a Review") {
      if (onOpenModal) onOpenModal();
    } else if (action === "Toggle Preview") {
      updatePreviewSetting();
    }
  };

  const handleDeleteClick = (reviewIndex) => {
    setDeleteIndex(reviewIndex);
    setShowDeleteDialog(true);
  };

  const deleteReview = async (reviewId) => {
    const payload = {
      review_id: reviewId,
      username: username,
    };
    return axios.post("/api/profile_review/delete_review/", payload, config);
  };

  const confirmDelete = async () => {
    if (deleteIndex !== null) {
      const reviewToDelete = reviews[deleteIndex];

      console.log("Review to delete:", reviewToDelete);

      const reviewId = reviewToDelete?.review_id;

      if (!reviewId) {
        const updatedReviews = reviews.filter((_, i) => i !== deleteIndex);
        onUpdateReviews(updatedReviews);
        toast.success("Review deleted successfully");
        cancelDelete();
        return;
      }

      setIsDeleting(true);

      try {
        const response = await deleteReview(reviewId);

        console.log("Delete response:", response);

        const updatedReviews = reviews.filter((_, i) => i !== deleteIndex);
        onUpdateReviews(updatedReviews);

        cancelDelete();
      } catch (err) {
        console.error("Delete error:", err);
        console.error("Error response:", err?.response);
        cancelDelete();
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete review"
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteIndex(null);
  };

  const handleModalClose = () => {
    if (onCloseModal) onCloseModal();
    setShowSuccess(false);
    setEmail("");
    setMessage("");
    setCharCount(0);
    setEmailError("");
    setMessageError("");
    setIsLoading(false);
  };

  const askForReview = (payload) => {
    return axios.post("/api/profile_review/ask_for_review/", payload, config);
  };

  const handleSendReview = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError("Invalid Email ID");
      hasError = true;
    }
    if (!message.trim()) {
      setMessageError("Message is required");
      hasError = true;
    } else if (message.length > 300) {
      setMessageError("Message cannot exceed 300 characters.");
      hasError = true;
    }
    if (hasError) return;

    setIsSending(true);
    setMessageError("");
    setEmailError("");

    try {
      const payload = {
        username,
        name: "Reviewer",
        email,
        message,
      };
      const res = await askForReview(payload);

      setIsSending(false);
      setShowSuccess(true);
    } catch (err) {
      setIsSending(false);

      setEmail("");
      setMessage("");
      setCharCount(0);
      setEmailError("");
      setMessageError("");

      if (onCloseModal) onCloseModal();

      setTimeout(() => {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send review request."
        );
      }, 250);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
    const isExceeded = value.length > 300;
    setIsCharLimitExceeded(isExceeded);

    if (isExceeded) {
      setMessageError("Message cannot exceed 300 characters.");
    } else {
      setMessageError("");
    }
  };

  const handleExpandReview = (review) => {
    setExpandedReview(review);
  };

  const handleCloseExpanded = () => {
    setExpandedReview(null);
  };

  const isFormDisabled = isLoading || isCharLimitExceeded;

  return (
    <div className="profile_review_con">
      {hasData && (
        <>
          <div className="review-header-container">
            <h2>Reviews</h2>
            {!showInPreview && (
              <div className="hidden-tag">
                <VisibilityOffIcon style={{ fontSize: 20 }} />
                <span>Hidden in Preview</span>
              </div>
            )}
          </div>
          <h5>
            Your clients relate more to the voices of your previous customers.
            Gather reviews from them.
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
                className="dropdown-item"
                onClick={() => handleMenuAction("Request a Review")}
              >
                <div className="dropdown-icon">
                  <AddIcon style={{ fontSize: 20 }} />
                </div>{" "}
                Request a Review
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

          <div className="profile_review_text">
            {/* <h3>
              {rating}
              <span>{reviews.length} reviews</span>
            </h3>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
            /> */}
            <h3>
              {rating.toFixed(1)} <span>{reviews.length} reviews</span>
            </h3>
            <Rating name="rating" value={rating} readOnly precision={0.1} />
          </div>

          <div className="profile_review_items" ref={reviewContainerRef}>
            {reviews &&
              Array.isArray(reviews) &&
              reviews.map((item, id) => (
                <div key={id} className="profile_review_item">
                  <h4>{item?.name || "Anonymous"}</h4>

                  <Rating
                    name="rating-read-only"
                    size="small"
                    value={item?.ratings || 0}
                    readOnly
                  />

                  <p style={{ margin: 0 }}>
                    {item?.comments &&
                    item.comments.length > (isMobile ? 50 : 130) &&
                    expandedReview !== item ? (
                      <>
                        {item.comments.slice(0, isMobile ? 50 : 130).trim()}
                        <span
                          style={{
                            color: "black",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginLeft: 4,
                          }}
                          onClick={() => handleExpandReview(item)}
                        >
                          ...more
                        </span>
                      </>
                    ) : (
                      item?.comments || ""
                    )}
                  </p>

                  <button onClick={() => handleDeleteClick(id)}>
                    <img src={deleteMUi} className="icon" alt="Delete icon" />
                  </button>
                </div>
              ))}
          </div>

          <div className="profile_nav">
            <span>
              {reviews?.length ? `${currentPage}/${reviews.length}` : ""}
            </span>

            <div>
              <button onClick={scrollLeft} disabled={currentPage === 1}>
                <KeyboardArrowLeftIcon />
              </button>
              <button
                onClick={scrollRight}
                disabled={currentPage === totalReviews}
              >
                <KeyboardArrowRightIcon />
              </button>
            </div>
          </div>
        </>
      )}

      {expandedReview && (
        <div className="review-modal-overlay" onClick={handleCloseExpanded}>
          <div
            className="review-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="review-modal-close"
              onClick={handleCloseExpanded}
            >
              ×
            </button>
            <div className="review-modal-body">
              <h3 className="review-modal-title">{expandedReview.name}</h3>
              <Rating
                name="expanded-rating"
                size="small"
                value={expandedReview.ratings}
                readOnly
                style={{ marginBottom: "16px" }}
              />
              <p className="review-modal-text">{expandedReview.comments}</p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <BlurPopup className="modal-overlay" onClose={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!showSuccess ? (
              <>
                <h2>Ask for a review</h2>
                <p>Reach out to those who have enjoyed your service...</p>
                <div className="form-group">
                  <label>Enter Email ID of reviewer*</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="john@gmail.com"
                    className={emailError ? "error" : ""}
                    disabled={isLoading}
                  />
                  {emailError && (
                    <span className="error-text">{emailError}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Request by sending a message (optional)</label>
                  <textarea
                    ref={messageRef}
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Hi John, Hope you are doing great..."
                    className={`${isCharLimitExceeded ? "limit-error" : ""}`}
                    maxLength={301}
                    disabled={isLoading}
                  />
                  {messageError && (
                    <span className="error-text">{messageError}</span>
                  )}
                  <div
                    className={`char-count ${
                      isCharLimitExceeded ? "limit-error" : ""
                    }`}
                  >
                    {charCount} / 300 Characters
                  </div>
                </div>
                <div className="info-text">
                  <strong>How it works:</strong>
                  <p>
                    Recipient will get a link in the email to fill the review...
                  </p>
                </div>
                <div className="modal-buttons">
                  <button
                    className="cancel-btn"
                    onClick={handleModalClose}
                    disabled={isSending}
                    style={{
                      backgroundColor: isSending ? "#ccc" : undefined,
                      cursor: isSending ? "not-allowed" : "pointer",
                      opacity: isSending ? 0.6 : 1,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="send-btn"
                    onClick={handleSendReview}
                    disabled={isSending || isCharLimitExceeded}
                    style={{
                      backgroundColor:
                        isSending || isCharLimitExceeded ? "#ccc" : undefined,
                      cursor:
                        isSending || isCharLimitExceeded
                          ? "not-allowed"
                          : "pointer",
                      opacity: isSending || isCharLimitExceeded ? 0.6 : 1,
                    }}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            ) : (
              <div className="success-content">
                <div className="success-icon">
                  <CheckCircleIcon />
                </div>
                <h2>Request sent!</h2>
                <p>
                  Recipient will get a link in the email to fill the review...
                </p>
                <div className="success-actions">
                  <button className="close-btn" onClick={handleModalClose}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </BlurPopup>
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        reviewName={deleteIndex !== null ? reviews[deleteIndex]?.name : ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default ProfileReview;
