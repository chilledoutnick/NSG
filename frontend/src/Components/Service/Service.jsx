import axios from "axios";
import  { useState, useEffect, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";
import swal from "sweetalert";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import "./Service.scss";

function Service(props) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [editSelectedService, setEditSelectedService] = useState();
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
  });
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;

  let props_token =
    props.token !== undefined ? props.token : localStorage.getItem("jwt");
  const config = {
    headers: {
      Authorization: `Bearer ${props_token}`,
    },
  };

  useEffect(() => {
    if (props.advisor.user_id !== undefined) {
      getServices();
    }
  }, [props.advisor.user_id]);

  const getServices = () => {
    axios
      .post("/api/service/get_services/", {
        user_id: props.advisor.user_id,
      })
      .then((res) => {
        const updatedServices = res.data.map((service, index) => ({
          ...service,
          sorting_id: index + 1,
        }));
        setServices(updatedServices);
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    const url = "api/service/create_services/";
    const payload = {
      name: formData.name,
      desc: formData.desc,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setLoading(false);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setFormData({
          name: "",
          desc: "",
        });
        getServices();
      })
      .catch((err) => setLoading(false));
  };

  const handleEditSubmit = () => {
    setLoading(true);
    const url = "api/service/update_services/";
    const payload = {
      service_id: formData.service_id,
      name: formData.name,
      desc: formData.desc,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setLoading(false);
        swal({
          text: "Success",
          icon: "success",
          timer: 2000,
          buttons: false,
        });
        setFormData({
          name: "",
          desc: "",
        });
        setEditSelectedService({});
        getServices();
      })
      .catch((err) => setLoading(false));
  }

  const handleDelete = (id) => {
    const url = "api/service/delete_service/";
    axios
      .post(url, { service_id: id })
      .then(() => {
        getServices();
      })
      .catch((err) => console.log("err", err));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedServices = Array.from(services);
    const [reorderedItem] = reorderedServices.splice(result.source.index, 1);
    reorderedServices.splice(result.destination.index, 0, reorderedItem);

    const updatedServices = reorderedServices.map((service, index) => ({
      ...service,
      sorting_id: index + 1,
    }));
    setServices(updatedServices);

    const updatedSorting = updatedServices.map((service) => ({
      service_id: service.service_id,
      sorting_id: service.sorting_id,
    }));
    handleSorting(updatedSorting);
  };

  const handleSorting = (updatedSorting) => {
    const url = "api/service/post_service_sorting/";
    axios
      .post(url, updatedSorting, config)
      .then(() => {
        console.log("Sorting order updated successfully.");
      })
      .catch((err) => console.log("Error updating sorting order:", err));
  };

  const handleEditService = (id) => {
    const selectedService  = services.find((index) => index.service_id === id);
    setEditSelectedService(selectedService);
     setFormData({
      ...selectedService,
    });
  }

  const getButtonText = () => {
    if(editSelectedService?.service_id){
      return "Edit Service"
    } else { return "Add Services"}
  }

  return (
    <div className="profile-service-con">
      <Dialog
        open={showPopup}
        onClose={() => setShowPopup(false)}
        fullScreen={isMobile}
      >
        <DialogContent className="edit_info_popup">
          <div className="edit_info_popup_header">
            <button onClick={() => setShowPopup(false)}>
              <KeyboardBackspaceIcon />
            </button>
            <h4>Add Services</h4>
          </div>
          <div className="edit_info_form">
            <label htmlFor="Service Name">Service Name</label>
            <input
              type="text"
              placeholder="Enter your service name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <label htmlFor="message">Service Description</label>
            <textarea
              type="text"
              placeholder="Describe your service within 200 characters"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
            />
            <span
              className={
                "limit_text " +
                (formData.desc.length > 200 ? "text-danger" : "")
              }
            >
              {formData.desc.length}/200
            </span>
          </div>
          <div className="edit_info_btn">
            <button
              onClick={editSelectedService?.service_id ? handleEditSubmit : handleSubmit}
              disabled={
                formData.desc.length > 200 ||
                formData.name === "" ||
                formData.desc === ""
              }
            >
              {!loading ? 
                getButtonText()
               : (
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
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="services">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="service-list"
                  >
                    {services.map((item, index) => (
                      <Draggable
                        key={item.service_id}
                        draggableId={item.service_id.toString()}
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
                              <h3>{item.name}</h3>
                              <p>{item.desc}</p>
                            </div>
                            <button
                              onClick={() => handleEditService(item.service_id)}
                              className="service-actions"
                            >
                              <EditRounded />
                            </button>
                            <button
                              onClick={() => handleDelete(item.service_id)}
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

      <h2 className="profile-service-title">
        Services
        <button onClick={() => setShowPopup(true)} className="tm_edit_btn">
          {services.length > 0 ? "Edit" : "Add"}
        </button>
      </h2>

      <div className="profile-service-card">
        <div className="row w-100">
          <div className="col-12">
            <div className="row profile-service-card-item-wr">
              {services.map((item, index) => (
                <div
                  className="col-4 profile-service-card-item-main"
                  key={`service-${index}`}
                >
                  <div className="profile-service-card-item">
                    <div className="profile-service-card-item-wrapper">
                      <h3 className="service-card-name">{item.name}</h3>
                      <p className="service-card-desc">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Service;