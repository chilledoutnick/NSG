import { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import { ThreeDots } from "react-loader-spinner";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CollectionsIcon from "@mui/icons-material/Collections";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import "cropperjs/dist/cropper.css";
import "./ImageEditor.scss";

const placeholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Left_grey_png.webp";

function ImageEditor(props) {
  const cropperRef = useRef(null);

  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [DeleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);

  useEffect(() => {
    if (props.image) {
      setImageSrc(props.image);
      setOriginalFile(props.imageFile);
    }
  }, [props.image, props.imageFile]);

  useEffect(() => {
    setIsEdit(false);
    setLoading(false);
    if (props.isProgress) {
      props.handleCompleted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isCompleted]);

  const onSelectFile = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
        setIsEdit(true);
        if (props.isProgress) {
          props.hideControll();
        }
      };
    }
  };

  const rotateLeft = () => {
    if (cropperRef.current) {
      cropperRef.current.cropper.rotate(-90);
    }
  };

  const rotateRight = () => {
    if (cropperRef.current) {
      cropperRef.current.cropper.rotate(90);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    if (isEdit && cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      cropper.getCroppedCanvas().toBlob((blob) => {
        const croppedFile = new File([blob], "cropped-image.png", {
          type: "image/png",
        });
        props.onImageEdited(croppedFile);
      }, "image/png");
    } else if (originalFile) {
      props.onImageEdited(originalFile);
    } else {
      console.error("No image file available for upload.");
    }
  };

  return (
    <>
      {!props.hideNav && !isDelete && (
        <div className="edit_info_popup_header mb-4">
          <button onClick={props.handleClose}>
            <KeyboardBackspaceIcon />
          </button>
          <h4>{props.title}</h4>
        </div>
      )}
      {isDelete ? (
        <div className="profile_delete_popup">
          <h3>
            {DeleteConfirm
              ? "Successfully deleted!"
              : "Do you want to delete your profile picture?"}
          </h3>
          {DeleteConfirm && (
            <p>
              We are sad that you chose to delete your profile picture! Please
              add one to make your profile stand out.
            </p>
          )}
          <img
            width={220}
            loading="lazy"
            className="delete_img m-0"
            alt="Photos"
            style={{ height: "auto" }}
            src={imageSrc}
          />
          <div className="delete_btns">
            {!DeleteConfirm ? (
              <>
                <button
                  onClick={() => {
                    setIsDelete(false);
                    if (props.isProgress) {
                      props.showControll();
                    }
                  }}
                  className="btn-outline"
                >
                  No
                </button>
                <button
                  disabled={DeleteConfirm}
                  onClick={() => {
                    props.onDelete();
                    setDeleteConfirm(true);
                  }}
                  className="btn-primary"
                >
                  Yes, delete
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  setIsDelete(false);
                  if (props.isProgress) {
                    props.showControll();
                  }
                }}
                className="btn-primary"
              >
                <ThumbUpIcon /> Done
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="upload_profile_wrapper ">
          <div className="upload_profile_wrapper_img">
            {isEdit && imageSrc ? (
              <Cropper
                src={imageSrc}
                guides={true}
                style={{ width: 220 }}
                ref={cropperRef}
                zoomable={true}
              />
            ) : imageSrc !== null ? (
              <img
                width={220}
                height={220}
                loading="lazy"
                className="preview_img m-0"
                alt="Photos"
                src={imageSrc}
              />
            ) : (
              <p>No image has been added yet.</p>
            )}
          </div>
          <div className="upload_profile_btns ">
            {isEdit && (
              <div className="rotate_btn_con">
                <button
                  onClick={() => {
                    if (props.isProgress) {
                      props.showControll();
                    }
                    setIsEdit(false);
                  }}
                  className="me-2"
                >
                  <KeyboardBackspaceIcon />
                </button>
              </div>
            )}
            {isEdit ? (
              <div className="rotate_btn_con">
                <button className="border-0" onClick={rotateLeft}>
                  <Rotate90DegreesCcwIcon />
                </button>
                <button className="border-0 rotate_icon" onClick={rotateRight}>
                  <Rotate90DegreesCcwIcon />
                </button>
              </div>
            ) : (
              <div className="upload_profile_btns_edit">
                <div className="upload_profile_btns_edit_wrapper">
                  <button className="acitve">
                    <div className="upload_btn_con">
                      <CollectionsIcon className="icon" />
                    </div>
                    <span>Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                    />
                  </button>
                  <button
                    className={
                      props.onDelete !== undefined && imageSrc !== placeholder
                        ? "acitve"
                        : ""
                    }
                    disabled={
                      props.onDelete === undefined || imageSrc === placeholder
                    }
                    onClick={() => {
                      setIsDelete(true);
                      if (props.isProgress) {
                        props.hideControll();
                      }
                    }}
                  >
                    <div className="upload_btn_con">
                      <DeleteForeverIcon className="icon" />
                    </div>
                    <span>Delete</span>
                  </button>
                  <button
                    className={
                      imageSrc && imageSrc !== placeholder ? "acitve" : ""
                    }
                    disabled={!imageSrc || imageSrc === placeholder}
                    onClick={() => {
                      if (props.isProgress) {
                        props.hideControll();
                      }
                      setIsEdit(true);
                    }}
                  >
                    <div className="upload_btn_con">
                      <EditIcon className="icon" />
                    </div>
                    <span>Edit</span>
                  </button>
                  {/* {props.onDelete !== undefined && (
                <button onClick={props.onDelete}>
                  <DeleteForeverIcon /> <span>Delete</span>
                </button>
              )} */}

                  {/* {imageSrc && (
                  <button onClick={() => setIsEdit(true)}>
                    <EditIcon /> <span>Edit</span>
                  </button>
                )} */}
                </div>
              </div>
            )}
            {imageSrc && isEdit && (
              <button
                style={{ padding: "12px 25px" }}
                className="btn-primary"
                onClick={handleSubmit}
              >
                {!loading ? (
                  <>
                    <ThumbUpIcon fontSize="small" />
                    Done
                  </>
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
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ImageEditor;
