import axios from "axios";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import CustomDropdown from "./customDropdown";
import "./UploadUsers.scss";

const UploadUserPage = ({ handleClickImportBack, handleFetchContact }) => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [successImportContacts, setSuccessImportContacts] = useState("0");
  const [mapping, setMapping] = useState({
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });
  const [skippedContacts, setSkippedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data;
          setHeaders(Object.keys(data[0]));
          setRows(data);
        },
      });
    } else if (["xlsx", "xls"].includes(extension)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const [head, ...body] = json;

        const formattedRows = body.map((row) =>
          head.reduce((acc, col, index) => ({ ...acc, [col]: row[index] }), {})
        );

        setHeaders(head);
        setRows(formattedRows);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a .csv, .xlsx, or .xls file.");
    }
  };

  const requiredFields = ["email", "firstname", "phone"];
  const isFormValid = requiredFields.every((field) => mapping[field]);

  const handleSubmit = () => {
    setLoading(true);
    const userData = rows.map((row) => {
      const record = {};
      const first = mapping.firstname ? row[mapping.firstname] : "";
      const last = mapping.lastname ? row[mapping.lastname] : "";
      record.name = `${first} ${last}`.trim();
      if (mapping.email) record.email = row[mapping.email];
      if (mapping.phone) record.phone = row[mapping.phone];

      return record;
    });

    const url = "api/contact/bulk_contact/";
    const payload = { bulk_data: userData };

    axios
      .post(url, payload, config)
      .then((res) => {
        if (res.data?.skipped?.length > 0) {
          const firstLetter = res.data.message.trim()[0];
          setSuccessImportContacts(firstLetter);
          setSkippedContacts(res.data.skipped);
          setHeaders([]);
          setActiveTab("");
        } else {
          setSkippedContacts([]);
          handleFetchContact();
        }
        setLoading(false);
      })
      .catch((err) => {
        alert("Something went wrong while importing.");
        setLoading(false);
      });
  };

  const handleClickBack = () => {
    handleFetchContact();
    handleClickImportBack();
  };

  return (
    <div className="upload-user-page">
      <div className="header">
        <button onClick={handleClickImportBack}>
          <ArrowBackOutlinedIcon /> contact list
        </button>
      </div>
      {headers.length === 0 && (
        <>
          <div className="tab-bar">
            <div
              className={`tab ${activeTab === "file" ? "active" : ""}`}
              onClick={() => setActiveTab("file")}
            >
              <CloudUploadOutlinedIcon style={{ fontSize: 36 }} />
              <span>Import from a file</span>
            </div>
          </div>

          {activeTab === "file" && (
            <div className="upload-container">
              <div className="upload-section">
                <div className="upload-box">
                  <h3>Upload contacts from file</h3>
                  <p>
                    Choose file from your device. You can add custom fields to
                    first row.
                  </p>
                  <div className="file-drop-area">
                    <label htmlFor="file-input" className="import-button">
                      Import file
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileChange}
                      hidden
                    />
                    <p className="file-info">
                      Supported file types: .csv, MS Excel (.xlsx)
                      <br />
                      Maximum allowed file size is 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div className="mapping-section">
        {headers.length > 0 && (
          <>
            <div className="preview-box">
              <h3>Match the columns</h3>
              <p className="subtitle">
                Here is a preview of your list. Match the columns to subscriber
                fields.
                <br /> Email, First Name, and Phone are required fields.
              </p>
              <div
                className={
                  headers.length - Object.values(mapping).filter(Boolean).length
                    ? "warning-bar"
                    : "success-bar"
                }
              >
                There are{" "}
                {headers.length - Object.values(mapping).filter(Boolean).length}{" "}
                unselected columns
              </div>
              <div className="table-wrapper">
                <table
                  style={{
                    minWidth: "600px",
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className={
                            Object.values(mapping).includes(header)
                              ? "mapped"
                              : ""
                          }
                        >
                          <CustomDropdown
                            selectedField={
                              Object.entries(mapping).find(
                                ([_, col]) => col === header
                              )?.[0] || ""
                            }
                            onChange={(newField) => {
                              const updated = { ...mapping };
                              Object.keys(updated).forEach((key) => {
                                if (updated[key] === header) updated[key] = "";
                              });
                              if (newField) updated[newField] = header;
                              setMapping(updated);
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {headers.map((header, colIndex) => (
                          <td key={colIndex}>{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="footer vertical">
                <span>{rows.length} subscribers will be imported</span>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                >
                  {loading ? "Importing..." : "Submit"}
                </button>
              </div>
            </div>
          </>
        )}
        {successImportContacts !== "0" && (
          <div className="success-box">
            <div className="success-header">
              <h3>✅ Successfully imported {successImportContacts} contacts</h3>
            </div>
            <div className="success-content">
              <p>You can now view these contacts in your contact list.</p>
              <button className="back-btn" onClick={handleClickBack}>
                Back to contact list
              </button>
            </div>
          </div>
        )}
        {skippedContacts.length > 0 && !activeTab && (
          <div className="error-box">
            <div className="error-header">
              <h3>❌ Some contacts were skipped</h3>
            </div>
            <div className="error-content">
              <table className="skipped-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {skippedContacts.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.email || "—"}</td>
                      <td>
                        {Array.isArray(item.reason)
                          ? item.reason.join(", ")
                          : item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadUserPage;
