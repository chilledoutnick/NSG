import "./ConfirmPopup.scss";

function ConfirmPopup() {
  return (
    <div className="confirm_popup_con">
      <div className="confirm_popup_wrapper">
        <img
          src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003380_png.webp"
          alt="done"
        />
        <div>
          <h5>Success</h5>
          <p>Profile has been updated.</p>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPopup;
