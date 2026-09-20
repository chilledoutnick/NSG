import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import ImageEditor from "../ImageEditor/ImageEditor";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import "./FeaturesGallery.scss";

const imgPlaceholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/plc_png.webp";

function FeaturesGallery(props) {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${props_token}`,
    },
  };

  const [loading, setLoading] = useState(false);
  const [ShowPopup, setShowPopup] = useState(false);
  const [Column_number, setColumn_number] = useState(0);
  const [Photo1, setPhoto1] = useState(false);
  const [Photo2, setPhoto2] = useState(false);
  const [Photo3, setPhoto3] = useState(false);
  const [Gallery1, setGallery1] = useState(undefined);
  const [Gallery2, setGallery2] = useState(undefined);
  const [Gallery3, setGallery3] = useState(undefined);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGallery = () => {
    // const url = "api/advisor_gallery/get_gallery/";
    const url = "api/user_gallery/get_gallery/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setGallery1(undefined);
        setGallery2(undefined);
        setGallery3(undefined);
        res.data.forEach((item) => {
          if (item.column_number === 1) {
            setGallery1(item);
          } else if (item.column_number === 2) {
            setGallery2(item);
          } else if (item.column_number === 3) {
            setGallery3(item);
          }
        });
      })
      .catch((err) => console.log("err", err));
  };

  const delete_gallery = (id) => {
    // const url = "api/advisor_gallery/delete_gallery/";
    const url = "api/user_gallery/delete_gallery/";
    axios
      .post(url, { gallery_id: id }, config)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Seleted successfully",
          showConfirmButton: false,
          timer: 3000,
        });
        getGallery();
        setPhoto1(false);
        setPhoto2(false);
        setPhoto3(false);
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Oops",
          text: "something went wrong.",
          showConfirmButton: false,
          timer: 3000,
        });
        console.log("err", err);
      });
  };

  const handleUpload = (editedImage) => {
    setLoading(true);
    // const url = "api/advisor_gallery/create_update_gallery/";
    const url = "api/user_gallery/create_update_gallery/";
    const formDatas = new FormData();
    formDatas.append("picture", editedImage);
    formDatas.append("column_number", Column_number);
    axios
      .post(url, formDatas, config)
      .then(() => {
        setPhoto1(false);
        setPhoto2(false);
        setPhoto3(false);
        setLoading(false);
        getGallery();
      })
      .catch((err) => setLoading(false));
  };

  const openImage = (src) => {
    setSelectedImage(src);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="tm3-gallery">
      <h3>
        Featured Images
        <button onClick={() => setShowPopup(true)} className="tm_edit_btn">
          {Gallery1 !== undefined ? "Edit" : "Add"}
        </button>
      </h3>
      {Gallery1 !== undefined &&
      Gallery2 !== undefined &&
      Gallery3 !== undefined ? (
        <div className="card_gallery_con">
          <img
            className="img1"
            src={Gallery1.profile_picture}
            alt="gallery"
            loading="lazy"
            onClick={() => openImage(Gallery1.profile_picture)}
          />
          <div className="gallery_con_right">
            <img
              className="img2"
              src={Gallery2.profile_picture}
              alt="gallery"
              loading="lazy"
              onClick={() => openImage(Gallery2.profile_picture)}
            />
            <img
              className="img3"
              src={Gallery3.profile_picture}
              alt="gallery"
              loading="lazy"
              onClick={() => openImage(Gallery3.profile_picture)}
            />
          </div>
        </div>
      ) : (
        ""
      )}
      {selectedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeImage}>
              <CloseIcon fontSize="small" />
            </button>
            <img src={selectedImage} alt="enlarged" />
          </div>
        </div>
      )}

      <Dialog
        open={ShowPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button
              onClick={() => {
                setShowPopup(false);
              }}
            >
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Featured Images</h4>
          </div>
          <div className="features_gallery_con">
            <div className="edit_info_form">
              <label htmlFor="About">
                Add some images of your service, product, and culture
              </label>
              <div className="card_gallery_con_edit mt-3">
                {Photo1 && (
                  <BlurPopup
                    onClose={() => setPhoto1(false)}
                    openState={Photo1}
                  >
                    <div className="blurpopup_con_wrapper">
                      <ImageEditor
                        title="Add Featured Image"
                        onImageEdited={handleUpload}
                        handleClose={() => setPhoto1(false)}
                        image={
                          Gallery1 !== undefined
                            ? Gallery1.profile_picture
                            : imgPlaceholder
                        }
                        onDelete={() =>
                          Gallery1 !== undefined &&
                          delete_gallery(Gallery1.team_gallery_id)
                        }
                      />
                      <p className="card_gallery_note card_gallery_note2">
                        Note: You need to select all three images to show them
                        to the gallery.
                      </p>
                    </div>
                  </BlurPopup>
                )}
                {Photo2 && (
                  <BlurPopup
                    onClose={() => setPhoto2(false)}
                    openState={Photo2}
                  >
                    <div className="blurpopup_con_wrapper">
                      <ImageEditor
                        title="Add Featured Image"
                        onImageEdited={handleUpload}
                        handleClose={() => setPhoto2(false)}
                        image={
                          Gallery2 !== undefined
                            ? Gallery2.profile_picture
                            : imgPlaceholder
                        }
                        onDelete={() =>
                          (Gallery2 !== undefined) &
                          delete_gallery(Gallery2.team_gallery_id)
                        }
                      />
                      <p className="card_gallery_note card_gallery_note2">
                        Note: You need to select all three images to show them
                        to the gallery.
                      </p>
                    </div>
                  </BlurPopup>
                )}
                {Photo3 && (
                  <BlurPopup
                    onClose={() => setPhoto3(false)}
                    openState={Photo3}
                  >
                    <div className="blurpopup_con_wrapper">
                      <ImageEditor
                        title="Add Featured Image"
                        onImageEdited={handleUpload}
                        handleClose={() => setPhoto3(false)}
                        image={
                          Gallery3 !== undefined
                            ? Gallery3.profile_picture
                            : imgPlaceholder
                        }
                        onDelete={() =>
                          Gallery3 !== undefined &&
                          delete_gallery(Gallery3.team_gallery_id)
                        }
                      />
                      <p className="card_gallery_note card_gallery_note2">
                        Note: You need to select all three images to show them
                        to the gallery.
                      </p>
                    </div>
                  </BlurPopup>
                )}
                <div
                  onClick={() => {
                    setPhoto1(true);
                    setColumn_number(1);
                  }}
                  className="img1"
                >
                  <img
                    src={
                      Gallery1 !== undefined
                        ? Gallery1.profile_picture
                        : imgPlaceholder
                    }
                    alt="gallery"
                    loading="lazy"
                  />
                </div>
                <div className="gallery_con_right">
                  <div
                    onClick={() => {
                      setPhoto2(true);
                      setColumn_number(2);
                    }}
                    className="img2"
                  >
                    <img
                      src={
                        Gallery2 !== undefined
                          ? Gallery2.profile_picture
                          : imgPlaceholder
                      }
                      alt="gallery"
                      loading="lazy"
                    />
                  </div>
                  <div
                    onClick={() => {
                      setPhoto3(true);
                      setColumn_number(3);
                    }}
                    className="img3"
                  >
                    <img
                      src={
                        Gallery3 !== undefined
                          ? Gallery3.profile_picture
                          : imgPlaceholder
                      }
                      alt="gallery"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <p className="card_gallery_note">
                Note: You need to select all three images to show them to the
                gallery.
              </p>
            </div>
            <div className="edit_info_btn">
              <button
                disabled={
                  Gallery1 === undefined ||
                  Gallery2 === undefined ||
                  Gallery3 === undefined
                }
                onClick={() => {
                  getGallery();
                  Swal.fire({
                    icon: "success",
                    title: "Success",
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  setShowPopup(false);
                }}
              >
                {!loading ? (
                  "Save"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeaturesGallery;
