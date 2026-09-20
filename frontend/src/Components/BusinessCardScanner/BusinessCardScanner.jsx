import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import BlurPopup from "../BlurPopup/BlurPopup";
import "./BusinessCardScanner.scss";

const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

function BusinessCardScanner(props) {
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    }),
    [],
  );

  const previewUrl = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetState = () => {
    setSelectedFile(null);
    setLoading(false);
    setError("");
  };

  const handleClose = () => {
    resetState();
    props.onClose();
  };

  const validateFile = (file) => {
    if (!file) return "Please select an image first.";
    if (!allowedFileTypes.includes(file.type)) {
      return "Only JPG, PNG or WEBP images are supported.";
    }
    if (file.size > 12 * 1024 * 1024) {
      return "Image size must be under 12 MB.";
    }
    return "";
  };

  const applyFile = (file) => {
    const validationMessage = validateFile(file);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setSelectedFile(file);
    setError("");
    handleScan(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    applyFile(file);
  };

  const handleScan = async (fileToScan = selectedFile) => {
    const validationMessage = validateFile(fileToScan);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", fileToScan);
      formData.append("is_demo", "false");

      const response = await axios.post(
        "api/digital_card/extract_contact/",
        formData,
        config,
      );

      const extractedData =
        response.data?.contact_data ||
        response.data?.data ||
        response.data?.contact ||
        null;

      if (!extractedData) {
        throw new Error(
          response.data?.error ||
            response.data?.message ||
            "Could not extract data from this card.",
        );
      }

      props.onScanSuccess(extractedData);
      handleClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Could not extract data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurPopup
      onClose={handleClose}
      openState={props.openState}
      ComponentClass={
        props.isMobile
          ? "business_card_scanner_sheet"
          : "business_card_scanner_popup"
      }
    >
      <div className="blurpopup_con_wrapper business_card_scanner_wrapper">
        <div className="business_card_scanner">
          <button className="business_card_scanner_close" onClick={handleClose}>
            <CloseIcon />
          </button>

          <div className="business_card_scanner_header">
            <span className="business_card_scanner_badge">New</span>
            <h3>Scan business card</h3>
            <p>
              Add a clear photo of the card and we&apos;ll fill in the contact
              details for you.
            </p>
          </div>

          <div
            className={
              "business_card_scanner_dropzone " +
              (dragActive ? "business_card_scanner_dropzone_active" : "") +
              (selectedFile ? " business_card_scanner_dropzone_filled" : "")
            }
            onClick={() => !loading && uploadInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                !loading &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                uploadInputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(false);
            }}
            onDrop={handleDrop}
          >
            {selectedFile && previewUrl ? (
              <div className="business_card_scanner_preview">
                <img src={previewUrl} alt="Business card preview" />
                {loading && (
                  <div className="business_card_scanner_preview_state">
                    <ThreeDots height="24" width="48" radius="8" color="#fff" />
                    <p>Scanning card...</p>
                  </div>
                )}
                {!loading && (
                  <div className="business_card_scanner_preview_hint">
                    Tap here to choose a different image
                  </div>
                )}
              </div>
            ) : (
              <div className="business_card_scanner_empty">
                <div className="business_card_scanner_icon">
                  <DocumentScannerOutlinedIcon />
                </div>
                <h4>Upload a business card</h4>
                <p>
                  For best results, keep the card flat, bright and easy to read.
                </p>
              </div>
            )}
          </div>

          <div className="business_card_scanner_actions">
            <button
              className="business_card_scanner_secondary"
              onClick={() => cameraInputRef.current?.click()}
              disabled={loading}
            >
              <CameraAltOutlinedIcon />
              Capture photo
            </button>
            {selectedFile && (
              <button
                className="business_card_scanner_text"
                onClick={resetState}
                disabled={loading}
              >
                <ReplayOutlinedIcon />
                Use a different photo
              </button>
            )}
          </div>

          <input
            ref={uploadInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => applyFile(event.target.files?.[0])}
            hidden
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => applyFile(event.target.files?.[0])}
            hidden
          />

          {error && <p className="business_card_scanner_error">{error}</p>}
        </div>
      </div>
    </BlurPopup>
  );
}

export default BusinessCardScanner;
