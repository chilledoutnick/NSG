import axios from "axios";
import { useState, useEffect, useRef, lazy } from "react";
import { ThreeDots } from "react-loader-spinner";
import $ from "jquery";
import Swal from "sweetalert2";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import "./SendEmail.scss";

const CalendarIntegration = lazy(
  () => import("../CalendarIntegration/CalendarIntegration"),
);

function SendEmail(props) {
  const [selectedContact, setSelectedContact] = useState([]);
  const [selectedCCBCC, setSelectedCCBCC] = useState([]);
  const [Body, setBody] = useState("");
  const [FilesOutlook, setFilesOutlook] = useState();
  const [FilesGoogle, setFilesGoogle] = useState();
  const [FilesCaldev, setFilesCaldev] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [Subject, setSubject] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [showCCBCC, setShowCCBCC] = useState(false);
  const [outlookAccessToken, setOutlookAccessToken] = useState("");
  const [googleAccessToken, setGoogleAccessToken] = useState("");
  const [Contacts, setContacs] = useState([]);
  const [CCBCC, setCCBCC] = useState([]);
  const [isCalDev, setIsCalDev] = useState(false);
  const textareaRef = useRef(null);
  const [showIngetraion, setShowIngetraion] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user_info"));
  

  const handleChange = (event) => {
    setBody(event.target.value);
  };

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

const handleSuggestionClick = (suggestion) => {
  setSubject(suggestion.subject);
  
  let lines = suggestion.message.split("\n");
  
  if (lines[0].trim().match(/^Hi\s+/i)) {
    lines.shift(); 
    if (lines[0]?.trim() === "") lines.shift(); 
  }
  

  const signatureKeywords = /^(best|regards|warm regards|sincerely|thanks|cheers)/i;
  let signatureIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (signatureKeywords.test(lines[i].trim())) {
      signatureIndex = i;
      break;
    }
  }
  if (signatureIndex !== -1) {
    lines = lines.slice(0, signatureIndex); 
  }
  
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  
  setBody(lines.join("\n").trim());
};

  useEffect(() => {
    const textarea = $(textareaRef.current);
    textarea.height("auto");
    textarea.height(textarea[0]?.scrollHeight);
  }, [Body]);

  // defaultSubject/defaultBody props se pre-fill karo
useEffect(() => {
  if (props.defaultSubject) setSubject(props.defaultSubject);
  if (props.defaultBody) setBody(props.defaultBody);
}, [props.defaultSubject, props.defaultBody]);

useEffect(() => {
  if (props.directEmail && (googleAccessToken  || outlookAccessToken ||  isCalDev)) {
    handleDirectSend();
  }
}, [props.directEmail, googleAccessToken, outlookAccessToken, isCalDev]);

  useEffect(() => {
    console.log("SendEmail props:", props);
    
    get_access_token();
    get_contact_log();
    if (props.selectedPeople?.length === 1) {
      get_followup_suggestions();
    }
  }, []);

  useEffect(() => {
    if (props.selectedPeople) {
      props.selectedPeople.map((item) => {
        return setSelectedContact((prev) => {
          const exists = prev.some(
            (contact) => contact.contact_id === item.contact_id,
          );
          return exists ? prev : [...prev, item];
        });
      });
    }
  }, [props.selectedPeople]);

  const get_access_token = () => {
    setCalendarLoading(true);
    const url = "api/user/get_access_token/";
    axios
      .post(url, {}, config)
      .then((res) => {
        let google = res.data.google_access_token;
        let outlook = res.data.outlook_access_token;
        let other = res.data.caldav_user;
        setGoogleAccessToken(google);
        setOutlookAccessToken(outlook);
        setIsCalDev(other);
        if (google || outlook || other === true) {
          setShowIngetraion(false);
        } else {
          setShowIngetraion(true);
        }
        setCalendarLoading(false);
      })
      .catch((err) => {
        setShowIngetraion(true);
        setCalendarLoading(false);
      });
  };

  const handleDirectSend = () => {
    console.log("email sent");
    
    
       if (isCalDev) {
                  SendCaldavMail();
                } else if (googleAccessToken) {
                  send_email_google();
                } else if (outlookAccessToken) {
                  send_email_outlook();
                }
  }

  const get_contact_log = async () => {
    const url = "/api/contact/contact_log/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setContacs(res.data);
        setCCBCC(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  const email_save = async () => {
    let email = [];
    selectedContact.map((item) => {
      return email.push(item.email);
    });
    const url = "/api/contact/email_save/";
    const payload = {
      recipient_emails: email,
      subject: Subject,
      body: Body,
    };
    axios
      .post(url, payload, config)
      .then(() => {
        if (props.handleTimelineRefresh) {
          props.handleTimelineRefresh();
        }
      })
      .catch((err) => console.log("err", err));
  };

  const formData = new FormData();
  for (let i = 0; i < FilesCaldev.length; i++) {
    formData.append("attachments", FilesCaldev[i]);
  }

  const SendCaldavMail = () => {
    setLoading(true);
    const contacts = selectedContact.map(({ name, email }) => ({
      name,
      email,
    }));
    //   const enhancedBody = `
    //   ${Body}<br/><br/>
    //   Best regards,<br/>
    //   ${user.name}<br/>
    //   Send via <a href="/" style="color:#3B46F0;text-decoration:none" target="_blank">NSG</a>
    // `;
    formData.append("email_subject", Subject);
    formData.append("email_content", Body);
    formData.append("cc_recipients", selectedCCBCC);
    formData.append("contacts", JSON.stringify(contacts));
    const url = "api/caldav/SendCaldavMail/";
    axios
      .post(url, formData, config)
      .then(() => {
        email_save();
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "All emails sent successfully",
          showConfirmButton: false,
          timer: 3000,
        });
        if (props.handleCLose) {
          props.handleCLose();
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const send_email_outlook = async () => {
    try {
      setLoading(true);
      const url = "https://graph.microsoft.com/v1.0/me/sendMail";
      for (const item of selectedContact) {
        const emailBody = `
          Hi ${item.name}, 
           <br/><br/>
          ${Body} 
           <br/><br/>
          Best regards,<br/>
          ${user.name}<br/>
          Send via <a href="/" style="color:#3B46F0;text-decoration:none" target="_blank">NSG</a>
        `;
        const ccRecipients =
          selectedContact.length < 2
            ? selectedCCBCC.map((email) => ({
                emailAddress: { address: email },
              }))
            : [];
        const requestBody = {
          message: {
            subject: Subject,
            body: {
              contentType: "html",
              content: emailBody,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: item.email,
                },
              },
            ],
            ccRecipients,
            attachments: FilesOutlook || [],
          },
          saveToSentItems: "True",
        };

        // Send the email
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${outlookAccessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Error response:", error);
          throw new Error(
            error.message || `Failed to send email to ${item.email}`,
          );
        }
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "All emails sent successfully",
        showConfirmButton: false,
        timer: 3000,
      });
      if (props.handleCLose) {
        props.handleCLose();
      }
      email_save();
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire({
        icon: "warning",
        title: "Something went wrong.",
        text: error.message || "Failed to send some emails.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const get_followup_suggestions = async () => {
    const contact_id = props.selectedPeople?.[0]?.contact_id;
    if (!contact_id) return;

    setSuggestionsLoading(true);
    try {
      const res = await axios.post(
        "api/contact/followup_suggestions/",
        { contact_id },
        config,
      );
      setSuggestions(res.data.intents || []);
      setActiveIntent(res.data.intents?.[0]?.intent || null);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const send_email_google = async () => {
    try {
      setLoading(true);
      const boundary = "----boundary1234----";
      for (const item of selectedContact) {
        // Prepare the base MIME message
        const mimeMessage = [
          `To: ${item.email}`,
          `cc: ${selectedContact.length < 2 ? selectedCCBCC.join(", ") : ""}`,
          `Subject: ${Subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/mixed; boundary="${boundary}"`,
          "",
          `--${boundary}`,
          `Content-Type: text/html; charset=UTF-8`, // 👈 Set to HTML
          "Content-Transfer-Encoding: 7bit",
          "",
          `Hi ${item.name},<br/><br/>
   ${Body}<br/><br/>
   Best regards,<br/>
   ${user.name}<br/>
   Send via <a href="/" style="color:#3B46F0;text-decoration:none" target="_blank">NSG</a>`,
        ].join("\r\n");

        const attachmentParts = FilesGoogle?.length
          ? await Promise.all(
              FilesGoogle.map((file) =>
                [
                  `--${boundary}`,
                  `Content-Type: ${file.mimeType}; name="${file.filename}"`,
                  `Content-Disposition: attachment; filename="${file.filename}"`,
                  `Content-Transfer-Encoding: base64`,
                  "",
                  file.content,
                ].join("\r\n"),
              ),
            )
          : [];
        const fullMimeMessage = [
          mimeMessage,
          ...attachmentParts,
          `--${boundary}--`,
        ].join("\r\n");
        const encodedMessage = window
          .btoa(unescape(encodeURIComponent(fullMimeMessage)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const response = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${googleAccessToken}`,
            },
            body: JSON.stringify({ raw: encodedMessage }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          console.error("Error response:", error);
          throw new Error(error.message || "Failed to send email");
        }
        console.log("Email sent successfully");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "All emails sent successfully",
        showConfirmButton: false,
        timer: 3000,
      });
      if (props.handleCLose) {
        props.handleCLose();
      }
      // props.handleCLose();
      email_save();
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire({
        icon: "warning",
        title: "Something went wrong.",
        text: error.message || "Failed to send email.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
      if (props.handleCLose) {
        props.handleCLose();
      }
    }
  };

  const setFileHandleGoogle = async (files) => {
    const processedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = () => {
            resolve(reader.result.split(",")[1]);
          };

          reader.onerror = (error) => reject(error);
        });

        return {
          filename: file.name,
          mimeType: file.type,
          content: base64,
        };
      }),
    );

    setFilesGoogle(processedFiles);
  };

  const setFileHandleOutlook = async (files) => {
    const processedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 data
          reader.onerror = (error) => reject(error);
        });
        return {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: file.name,
          contentBytes: base64,
        };
      }),
    );
    setFilesOutlook(processedFiles);
  };

  const activeContact = showCCBCC ? CCBCC : Contacts;

  return (
    <>
      {showIngetraion ? (
        <CalendarIntegration isMail={true} onClose={props.handleCLose} />
      ) : !calendarLoading ? (
        <div className="send_email_con">
          <button
            onClick={() => {
              if (props.handleCLose) {
                props.handleCLose();
              }
            }}
            className="email_back_btn"
          >
            <ArrowBackIcon />
            Back
          </button>
          <div className="send_email_to">
            <span>TO:</span>
            <div
              onClick={() => setShowContact(true)}
              className="selected_contact"
            >
              {selectedContact.map((item, index) => {
                return <p key={index}> {item.email},</p>;
              })}
            </div>
            <button onClick={() => setShowContact(true)}>
              <AddCircleOutlineIcon />
            </button>
          </div>
          {selectedContact.length < 2 && (
            <div className="send_email_to">
              <span>CC/BCC: </span>
              <div
                onClick={() => setShowCCBCC(true)}
                className="selected_contact"
              >
                {selectedCCBCC.map((item, index) => {
                  return <p key={index}> {item},</p>;
                })}
              </div>
              <button onClick={() => setShowCCBCC(true)}>
                <AddCircleOutlineIcon />
              </button>
            </div>
          )}

          <div className="send_email_to">
            <span>Subject:</span>
            <input
              value={Subject}
              onChange={(e) => setSubject(e.target.value)}
              type="text"
            />
          </div>
          <div className="send_email_to">
            <LinkIcon className="link_icon" />
            <span>Attach file:</span>
            <input
              type="file"
              multiple
              onChange={(e) => {
                setFileHandleOutlook(e.target.files);
                setFileHandleGoogle(Array.from(e.target.files));
                setFilesCaldev(e.target.files);
              }}
            />
          </div>
          {selectedContact.length > 1 && (
            <p className="send_email_note">
              💡Note: This email will be sent individually to each recipient
              with their name in {"{{"} first name{"}}"}. Recipients won't see
              others' addresses and will receive it as if personally sent by
              you.
            </p>
          )}
          <div className="send_email_message">
            <span className="email_message_name">
              Hi{" "}
              {selectedContact.length < 2 ? (
                props.selectedPeople[0].name
              ) : (
                <>
                  {"{{ "}
                  {selectedContact.map((item) => {
                    return item.name.split(" ")[0] + ", ";
                  })}
                  {"}}"}
                </>
              )}
            </span>
            <textarea
              ref={textareaRef}
              value={Body}
              onChange={handleChange}
              placeholder="Write your message here"
            />
            <p>
              Best regards
              <br />
              {user.name}
              <br />
              Send via <span>NSG</span>
            </p>
          </div>
          {/* AI Suggestions */}
{props.selectedPeople?.length === 1 && (
  <div className="followup_suggestions">
    <p className="suggestions_label">✨  Suggestions</p>

    {suggestionsLoading ? (
      <div style={{ padding: "8px 0" }}>
        <ThreeDots height="20" width="40" radius="9" color="#4f39f4" ariaLabel="loading" />
      </div>
    ) : suggestions.length > 0 ? (
      <>
        {/* Intent Tabs */}
        <div className="suggestions_tabs">
          {suggestions.map((intentObj) => (
            <button
              key={intentObj.intent}
              className={`suggestions_tab ${activeIntent === intentObj.intent ? "active" : ""}`}
              onClick={() => setActiveIntent(intentObj.intent)}
            >
              {intentObj.intent.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Suggestion Cards */}
        <div className="suggestions_list">
          {suggestions
            .find((s) => s.intent === activeIntent)
            ?.suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="suggestion_card"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <p className="suggestion_subject">{suggestion.subject}</p>
                <p className="suggestion_preview">
                  {suggestion.message.slice(0, 80)}...
                </p>
              </div>
            ))}
        </div>
      </>
    ) : null}
  </div>
)}
          <div className="send_email_btns">
            <button onClick={props.handleCLose} className="btn-outline">
              Dismiss
            </button>
            <button
              disabled={Subject === "" || Body === ""}
              onClick={() => {
                if (isCalDev) {
                  SendCaldavMail();
                } else if (googleAccessToken) {
                  send_email_google();
                } else if (outlookAccessToken) {
                  send_email_outlook();
                }
              }}
              className="btn-primary"
              style={{ width: "220px" }}
            >
              {!Loading ? (
                "Send message"
              ) : (
                <ThreeDots
                  height="25"
                  width="60"
                  radius="9"
                  color="white"
                  ariaLabel="three-dots-loading"
                />
              )}
            </button>
          </div>
          {showContact || showCCBCC ? (
            <BlurPopup
              onClose={() => {
                setShowContact(false);
                setShowCCBCC(false);
              }}
              openState={showContact}
              ComponentClass="add_more_popup_wrapper"
            >
              <div className="blurpopup_con_wrapper add_more_popup_content">
                <div className="add_more_popup">
                  <button
                    onClick={() => {
                      setShowContact(false);
                      setShowCCBCC(false);
                    }}
                    className="close_btn"
                  >
                    <CloseIcon />
                  </button>
                  <h5>Add more people</h5>
                  <div className="add_more_wrapper">
                    {activeContact.map((item, index) => {
                      return (
                        <div className="add_more_item" key={index + "people"}>
                          <div className="more_people_details">
                            <div
                              style={{
                                backgroundColor: `${item.image_color}33`,
                              }}
                              className="more_people_img"
                            >
                              <span style={{ color: item.image_color }}>
                                {item.name.charAt(0)}
                              </span>
                            </div>
                            <span>{item.name}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={
                              showCCBCC
                                ? selectedCCBCC.includes(item.email)
                                : selectedContact.some(
                                    (contact) => contact.email === item.email,
                                  )
                            }
                            onChange={(e) => {
                              if (showCCBCC) {
                                if (e.target.checked) {
                                  setSelectedCCBCC((prev) => [
                                    ...prev,
                                    item.email,
                                  ]);
                                } else {
                                  setSelectedCCBCC((prev) =>
                                    prev.filter((data) => data !== item.email),
                                  );
                                }
                              } else {
                                if (e.target.checked) {
                                  if (selectedContact.length < 50) {
                                    setSelectedContact((prev) => [
                                      ...prev,
                                      item,
                                    ]);
                                  }
                                } else {
                                  setSelectedContact((prev) =>
                                    prev.filter((data) => data !== item),
                                  );
                                }
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="add_more_btns">
                    <button
                      onClick={() => {
                        setShowContact(false);
                        setShowCCBCC(false);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowContact(false);
                        setShowCCBCC(false);
                      }}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </BlurPopup>
          ) : (
            ""
          )}
        </div>
      ) : (
        <div
          style={{
            margin: "auto",
            paddingTop: "30vh",
            height: "75vh",
          }}
        >
          <ThreeDots
            height="25"
            width="60"
            radius="9"
            color="black"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}
    </>
  );
}

export default SendEmail;
