import axios from "axios";
import  { useEffect, useState, lazy } from "react";
import { ThreeDots } from "react-loader-spinner";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const BlurPopup = lazy(() => import("../../../Components/BlurPopup/BlurPopup"));

function ShippingForm(props) {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [has_address, setHas_address] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const [shipping_address, setShipping_address] = useState({
    name: "",
    email: "",
    phoneno: "",
    apartment_details: "",
    area_details: "",
    province: "",
    shipping_zip: "",
    shipping_country: "",
  });

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    shipping_address[name] = value;
    setShipping_address({
      ...shipping_address,
    });
  };

  useEffect(() => {
    get_address();
  }, []);

  const save_address = () => {
    setIsLoading(true);
    const url = "api/user_address/save_shipping_address/";
    axios
      .post(url, shipping_address, config)
      .then((res) => {
        setIsLoading(false);
        setShowShippingForm(false);
        get_address();
      })
      .catch((err) => setIsLoading(false));
  };

  const get_address = () => {
    const url = "/api/user_address/get_shipping_address/";
    axios
      .post(url, {}, config)
      .then((res) => {
        const data = res.data;
        setShipping_address({
          name: data.name,
          email: data.email,
          phoneno: data.phoneno,
          area_details: data.area_details,
          apartment_details: data.apartment_details,
          province: data.province,
          shipping_zip: data.shipping_zip,
          shipping_country: data.shipping_country,
        });
        if (
          data.name &&
          data.email &&
          data.phoneno &&
          data.area_details &&
          data.province &&
          data.shipping_zip &&
          data.shipping_country
        ) {
          props.hasAddress(true);
          setHas_address(true);
        } else {
          props.hasAddress(false);
          setHas_address(false);
        }
      })
      .catch((err) => setIsLoading(false));
  };

  const disabled =
    shipping_address.name &&
    shipping_address.email &&
    shipping_address.phoneno &&
    shipping_address.area_details &&
    shipping_address.province &&
    shipping_address.shipping_zip &&
    shipping_address.shipping_country;

  return (
    <div className="shipping_con">
      <div className="subscription_plan subscription_plan_details">
        <div className="subscription_plan_text">
          <p>
            Card shipping address{" "}
            {props.isCheckout && !has_address ? (
              ""
            ) : (
              <EditOutlinedIcon
                onClick={() => setShowShippingForm(true)}
                fontSize="small"
                className="icon"
              />
            )}
          </p>
          {props.isCheckout && !has_address ? (
            <button
              onClick={() => setShowShippingForm(true)}
              className="btn-primary"
            >
              Add your shipping address
            </button>
          ) : (
            <>
              <span>{shipping_address.name ? shipping_address.name : "-"}</span>
              <span>
                {shipping_address.email ? shipping_address.email : "-"}
              </span>
              <span>
                {shipping_address.phoneno ? shipping_address.phoneno : "-"}
              </span>
              <span>
                {shipping_address.apartment_details
                  ? shipping_address.apartment_details
                  : "-"}
                {shipping_address.area_details
                  ? ", " + shipping_address.area_details
                  : ""}
                {shipping_address.province
                  ? ", " + shipping_address.province
                  : ""}
                {shipping_address.shipping_zip
                  ? ", " + shipping_address.shipping_zip
                  : ""}
                {shipping_address.shipping_country
                  ? ", " + shipping_address.shipping_country
                  : ""}
              </span>
            </>
          )}
        </div>
      </div>
      {showShippingForm && (
        <BlurPopup
          onClose={() => setShowShippingForm(false)}
          openState={showShippingForm}
          ComponentClass="booking_integration_popup"
        >
          <div className="blurpopup_con_wrapper booking_integration_popup_shipping">
            <div className="shipping_con_popup">
              <h3>Card shipping address</h3>
              <label htmlFor="">Recipients details</label>
              <input
                name="name"
                onChange={handleChange}
                type="text"
                placeholder="Name"
                value={shipping_address.name}
              />
              <input
                name="phoneno"
                onChange={handleChange}
                type="text"
                placeholder="Phone"
                value={shipping_address.phoneno}
              />
              <input
                name="email"
                onChange={handleChange}
                type="email"
                placeholder="Email Id"
                value={shipping_address.email}
              />
              <label htmlFor="">Recipients shipping address</label>
              <input
                name="apartment_details"
                onChange={handleChange}
                type="text"
                placeholder="Unit / House / Apartment details"
                value={shipping_address.apartment_details}
              />
              <input
                name="area_details"
                onChange={handleChange}
                type="text"
                placeholder="Street / Locality / Area details"
                value={shipping_address.area_details}
              />
              <div className="shipping_input">
                <input
                  name="province"
                  onChange={handleChange}
                  type="text"
                  placeholder="Province"
                  value={shipping_address.province}
                />
                <input
                  name="shipping_country"
                  onChange={handleChange}
                  type="text"
                  placeholder="Country"
                  value={shipping_address.shipping_country}
                />
              </div>
              <input
                name="shipping_zip"
                onChange={handleChange}
                type="text"
                placeholder="Postal code"
                value={shipping_address.shipping_zip}
              />
            </div>
            <div className="shipping_btn">
              <button
                onClick={() => setShowShippingForm(false)}
                className="btn-outline"
              >
                Back
              </button>
              <button
                disabled={!disabled}
                onClick={save_address}
                className="btn-primary"
              >
                {!loading ? (
                  "Save"
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    color="white"
                    ariaLabel="three-dots-loading"
                    visible={true}
                  />
                )}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}
    </div>
  );
}

export default ShippingForm;
