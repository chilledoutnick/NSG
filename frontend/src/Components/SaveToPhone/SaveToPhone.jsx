import axios from "axios"; 
import  { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Toast from "../../Components/Toast/Toast";
import "./SaveToPhone.scss";

function SaveToPhone(props) {
  const [vCardData, setVCardData] = useState(null);
  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  useEffect(() => {
    get_card();
  }, []);

  const get_card = () => {
    const requestBody = {
      contact_id: props.selectedPeople.contact_id,
    };
    fetch(axios.defaults.baseURL + "/api/digital_card/contact_vcard/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.text())
      .then((data) => setVCardData(data))
      .catch((error) => {
        console.error("Error fetching vCard data:", error);
      });
  };

  const handleDownloadVCard = () => {
    if (vCardData) {
      const blob = new Blob([vCardData], { type: "text/vcard" });
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "contact.vcf";
      downloadLink.click();
    }
  };

  useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({
          ...ToastText,
          show: false,
        });
      }, 3000);
    }
  }, [ToastText]);

  return (
    <div className="people_save_contact_popup">
      {ToastText.show && <Toast text={ToastText.text} />}
      <button onClick={props.handleCLose} className="close_btn">
        <CloseIcon />
      </button>
      <h2>Save to Phone Contacts</h2>
      <p>{props.selectedPeople.name}</p>
      {props.selectedPeople.phone && (
        <button
          onClick={() => {
            copy(props.selectedPeople.phone);
            setToastText({
              ...ToastText,
              text: "Number copied",
              show: true,
            });
          }}
          className="number_copy_btn"
        >
          {props.selectedPeople.phone} <ContentCopyIcon className="icon" />
        </button>
      )}

      <div className="people_save_btns">
        <button onClick={props.handleCLose} className="btn-outline">
          Cancel
        </button>
        <button
          disabled={!vCardData}
          onClick={handleDownloadVCard}
          className="btn-primary"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default SaveToPhone;
