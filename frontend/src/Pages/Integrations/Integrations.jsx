import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import copy from "copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import "./integrations.scss";

function Integrations() {
  const [showZapier, setShowZapier] = useState(false);
  const [zapier_key, setZapier_key] = useState("");
  const user_info = JSON.parse(localStorage.getItem("user_info"));
  var fullName = user_info.name.split(" "),
    firstName = fullName[0],
    lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    generate_zapier_key();
  }, []);

  const generate_zapier_key = () => {
    const url = "api/zapier/generate_zapier_key/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setZapier_key(res.data.zapier_key);
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <div className="integrations_con">
      {showZapier ? (
        <zapier-workflow
          sign-up-email={user_info.email}
          sign-up-first-name={firstName}
          sign-up-last-name={lastName}
          client-id="XEMfUtjb9kRilRFWVsaefdnKVupKRSPQyFjBcLP7"
          theme="light"
          intro-copy-display="show"
        />
      ) : (
        <div className="zapier_con">
          <h2>Zapier</h2>
          <span>
            Connect NSG to your own workflows using Zapier's triggers.
          </span>
          <div className="zapier_content">
            <h5>How does it work ?</h5>
            <p>
              This integration lets you build custom workflows using any of
              Zapier's triggers.
              <br /> Connectable apps include: Google Contacts, Gmail, Outlook,
              HubSpot, Salesforce and more.
            </p>
          </div>
          <div className="zapier_content">
            <h5>Your Zapier Key</h5>
            <p>
              Use the following unique Zapier key as a value for
              `x-hasura-nsg-api-key` while configuring your account with
              NSG in Zapier.
            </p>
            <button
              onClick={() => {
                copy(zapier_key);
                Swal.fire({
                  icon: "success",
                  title: "Copied",
                  showConfirmButton: false,
                  timer: 3000,
                });
              }}
              className="zapier_code_btn"
            >
              {zapier_key} <ContentCopyIcon fontSize="small" />
            </button>
          </div>
          <div className="zapier_content zapier_connect ">
            <h5>
              <img
                src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/zapier-logo-46EEE9963E-seeklogo_com_png.webp"
                alt="Zapier"
                loading="lazy"
                width={20}
                className="me-2"
              />{" "}
              Connect NSG using Zapier
            </h5>
            <button onClick={() => setShowZapier(true)} className="btn-primary">
              Open
            </button>
          </div>
        </div>
      )}
      <BottomBar />
    </div>
  );
}

export default Integrations;
