import axios from "axios";
import  { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import copy from "copy-to-clipboard";
import swal from "sweetalert";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./Gallery.scss";

function Gallery() {
  const [picture, setPicture] = useState();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const formData = new FormData();
  formData.append("picture", picture);

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/webp_gallery/save_img/";
    axios
      .post(url, formData)
      .then(() => {
        get_last_images();
        setLoading(false);
        swal({
          text: "Uploaded",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
      })
      .catch((err) => setLoading(false));
  };

  const get_last_images = () => {
    const url = "api/webp_gallery/get_last_images/";
    axios
      .post(url, { number: 200 })
      .then((res) => setImages(res.data.image_data))
      .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    get_last_images();
  }, []);

  const handleDelete = (id) => {
    const url = "api/webp_gallery/delete_img/";
    axios
      .post(url, { id: id })
      .then(() => {
        setLoading(false);
        get_last_images();
      })
      .catch((err) => setLoading(false));
  };

  return (
    <div className="gallery_con">
      <h1>Gallery</h1>
      <input type="file" onChange={(e) => setPicture(e.target.files[0])} />
      <button className="btn-primary" onClick={handleSubmit}>
        {!loading ? (
          "UPLOAD"
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
      <div className="gallery_img row">
        {images.map((img, index) => {
          return (
            <button
              className="col-3"
              key={index}
              onClick={() => {
                copy(img.webp_image_url);
                swal({
                  text: "Image url copied",
                  icon: "success",
                  timer: 2000,
                  buttons: false,
                });
              }}
            >
              <img src={img.webp_image_url} alt="img" />
              <button onClick={() => handleDelete(img.id)}>
                <DeleteForeverIcon />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Gallery;
