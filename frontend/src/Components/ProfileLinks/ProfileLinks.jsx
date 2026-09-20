import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import "../Service/Service.scss";

import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
const linksIcon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/expand-window-2--expand-small-bigger-retract-smaller-big_png.webp";

function ProfileLinks(props) {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;
  const [loading, setLoading] = useState(false);
  const [AllLinks, setAllLinks] = useState([]);
  const [error, setError] = useState("");
  const [ShowPopup, setShowPopup] = useState(false);
  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${props_token}`,
    },
  };

  const [LinksData, setLinksData] = useState({
    link: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    getLinks();
  }, []);

  const getLinks = () => {
    const url = "api/user/get_links/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setAllLinks(res.data.links);
      })
      .catch(() => console.log("err"));
  };

  const handleLinks = () => {
    setLoading(true);
    const url = "api/user/add_link/";
    const payload = {
      link: `https://${LinksData.link}`,
      title: LinksData.title,
      description: LinksData.description,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        // setShowPopup(false);
        setLoading(false);
        getLinks();
        setError("");
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setLinksData({
          link: "",
          title: "",
          description: "",
        });
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;

    // If the field is 'link', clean the value
    const cleanedValue =
      name === "link"
        ? value.replace(/^(https:\/\/)+/, "").replace(/^(https:\/\/)/, "")
        : value;

    setLinksData((prevData) => ({
      ...prevData,
      [name]: cleanedValue,
    }));
  };

  const handleDelete = (id) => {
    const url = "api/user/delete_link/";
    axios
      .post(url, { link_id: id }, config)
      .then(() => {
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        getLinks();
      })
      .catch((err) => console.log("err", err));
  };

  const handleLinkDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedLinks = Array.from(AllLinks);
    const [reorderedItem] = reorderedLinks.splice(result.source.index, 1);
    reorderedLinks.splice(result.destination.index, 0, reorderedItem);
    const updatedLinks = reorderedLinks.map((link, index) => ({
      ...link,
      sorting_id: index + 1,
    }));
    setAllLinks(updatedLinks);
    const updatedSorting = updatedLinks.map((link) => ({
      link_id: link.link_id,
      sorting_id: link.sorting_id,
    }));
    handleSorting(updatedSorting);
  };

  const handleSorting = (updatedSorting) => {
    const url = "api/user/user_link_sorting/";
    axios
      .post(url, updatedSorting, config)
      .then(() => {
        console.log("Sorting order updated successfully.");
      })
      .catch((err) => console.log("Error updating sorting order:", err));
  };

  return (
    <div className="tm3-links">
      <h3>
        Links
        <button className="tm_edit_btn" onClick={() => setShowPopup(true)}>
          {AllLinks.length > 0 ? "Edit" : "Add"}
        </button>
      </h3>
      <div className="links-con">
        {AllLinks.map((item, index) => {
          return (
            <button
              key={index + "links"}
              onClick={() => window.open(item.link)}
            >
              <img src={linksIcon} alt="links" loading="lazy" />
              <div>
                <h5>{item.title}</h5>
              </div>
            </button>
          );
        })}
      </div>
      <Dialog
        open={ShowPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopup(false)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Links</h4>
          </div>
          <div className="edit_info_form">
            <label htmlFor="About">Title</label>
            <input
              type="text"
              name="title"
              value={LinksData.title}
              placeholder="Add Title"
              onChange={handleLinkChange}
            />
            <label htmlFor="About">Insert URL here</label>
            <input
              type="text"
              name="link"
              value={LinksData.link ? `https://${LinksData.link}` : ""}
              placeholder="Enter the HTTPS link (e.g., https://example.com)."
              onChange={handleLinkChange}
              className="mb-0"
            />
          </div>
          <div className="edit_info_btn">
            {error && (
              <p className="error mb-3" style={{ marginTop: "-20px" }}>
                {error}
              </p>
            )}
            <button
              disabled={LinksData.title === "" || LinksData.link === ""}
              onClick={handleLinks}
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
          <div className="service-con-right">
            <DragDropContext onDragEnd={handleLinkDragEnd}>
              <Droppable droppableId="links">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="service-list"
                  >
                    {AllLinks.map((item, index) => (
                      <Draggable
                        key={item.link_id}
                        draggableId={item.link_id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="service-item"
                          >
                            <div className="service-details">
                              <h3>{item.title}</h3>
                              <p>{item.link}</p>
                            </div>
                            <button
                              onClick={() => handleDelete(item.link_id)}
                              className="service-actions"
                            >
                              <DeleteForeverRoundedIcon />
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfileLinks;
