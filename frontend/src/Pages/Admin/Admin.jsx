import axios from "axios";
import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ThreeDots } from "react-loader-spinner";
import { ChromePicker } from "react-color";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import ImageEditor from "../../Components/ImageEditor/ImageEditor";
import TeamSignUp from "../../Components/Admin/TeamSignUp";
import TemplateThree from "../ProfileEdit/Admin/UserProfileAdmin";
import AdminSkeleton from "./AdminSkeleton";
import "./Admin.scss";
import "./AdminRes.scss";

const upload_icon =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003388_png.webp";
const profilePlacholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Group_1000003424_2_png.webp";

function Admin() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isLogoUpload, setIsLogoUpload] = useState(false);
  const [Logo, setLogo] = useState("");
  const [TeamMember, setTeamMember] = useState([]);
  const [TeamDatas, setTeamDatas] = useState({});
  const [TeamData, setTeamData] = useState({
    Primary_color: "",
    TeamLimit: "",
    TeamCount: "",
  });

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  useEffect(() => {
    generate_admin();
    get_team_member();
  }, []);

  const admin_by_referralcode = (pathname) => {
    const url = "api/team_admin/admin_by_referralcode/";
    const payload = {
      code: pathname,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setTeamDatas(res.data);
      })
      .catch((err) => console.log("res", err));
  };

  const get_team_member = () => {
    const url = "api/team_admin/get_team_member/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setTeamMember(res.data.data);
        setInitialLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        setInitialLoading(false);
      });
  };

  const generate_admin = () => {
    const url = "api/team_admin/generate_admin/";
    axios
      .post(url, { team_limit: 10 }, config)
      .then((res) => {
        setTeamData({
          Primary_color: res.data.color,
          TeamLimit: res.data.team_limit,
          TeamCount: res.data.team_member_count,
        });
        setLogo(res.data.logo);
        admin_by_referralcode(res.data.referral_code);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const deactivate_team_member = () => {
    setLoading(true);
    const url = "api/team_admin/deactivate_team_member/";
    const payload = {
      user_id: selectedMemberId,
    };
    axios
      .post(url, payload, config)
      .then(() => {
        setLoading(false);
        get_team_member();
        generate_admin();
        setIsOpen2(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Team member removed.",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .catch((err) => {
        setLoading(false);
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

  const update_admin = () => {
    setLoading(true);
    const url = "api/team_admin/update_admin/";
    const formDatas = new FormData();
    formDatas.append("color", TeamData.Primary_color);
    if (Logo) {
      if (Logo.name !== undefined) {
        formDatas.append("logo", Logo);
      }
    }
    axios
      .post(url, formDatas, config)
      .then(() => {
        setLoading(false);
        setIsOpen3(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your information has been updated.",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const handleLogo = (editedImage) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("logo", editedImage);

    const url = "api/team_admin/update_admin/";
    axios
      .post(url, formData, config)
      .then(() => {
        setIsLogoUpload(false);
        setLoading(false);
        generate_admin();
        setIsOpen3(true);
      })
      .catch((err) => {
        console.error("Error uploading image:", err);
        setLoading(false);
      });
  };

  const delete_admin_logo = () => {
    const url = "api/team_admin/delete_admin_logo/";
    axios
      .post(url, {}, config)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Logo Deleted",
          showConfirmButton: false,
          timer: 3000,
        });
        setIsLogoUpload(false);
        generate_admin();
      })
      .catch(() => {
        Swal.fire({
          icon: "warning",
          title: "Oops",
          text: "something went wrong.",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  return (
    <div className="admin_dashboard_con">
      <div className="admin_con_header">
        {!showProfile && <h1>Team Profiles</h1>}
        {isLogoUpload && (
          <BlurPopup
            onClose={() => {
              setIsLogoUpload(false);
            }}
            openState={isLogoUpload}
          >
            <div className="blurpopup_con_wrapper p-0">
              <ImageEditor
                title="Add Logo"
                onImageEdited={handleLogo}
                handleClose={() => {
                  setIsLogoUpload(false);
                  setIsOpen3(true);
                }}
                onDelete={delete_admin_logo}
                image={Logo !== "" ? Logo : profilePlacholder}
              />
            </div>
          </BlurPopup>
        )}
        {!showProfile && (
          <div className="admin_con_header_btn">
            <button
              className={"btn_sec " + (isOpen3 ? "active_btn" : "")}
              onClick={() => setIsOpen3(true)}
            >
              Company Branding
            </button>
            <button
              className={"btn_sec " + (isOpen ? "active_btn" : "")}
              onClick={() => setIsOpen(true)}
            >
              Add New Member
            </button>
          </div>
        )}
      </div>
      {showProfile && token ? (
        <div className="team_template">
          <button
            className="team_template_btn"
            onClick={() => {
              setToken("");
              setShowProfile(false);
              get_team_member();
              localStorage.setItem("jwt_admin", "");
            }}
          >
            <KeyboardBackspaceIcon />
          </button>
          <TemplateThree token={token} />
        </div>
      ) : (
        <>
          {initialLoading ? (
            <AdminSkeleton />
          ) : (
            <div className="admin_con_card">
              {TeamMember.map((item, index) => {
                return (
                  <div
                    className={
                      "tm3-user " + (item.active ? "" : "tm3-user-disabled")
                    }
                    key={index + "user"}
                  >
                    {!item.active && (
                      <div className="tm3-user-disabled-con">
                        <h4>{item.name}</h4>
                        <h3>Disabled Account</h3>
                        <p>Please contact us to Reactivate this account</p>
                        <button
                          onClick={() => {
                            window.open("/contact-sales");
                          }}
                          className="reactive_btn"
                        >
                          Reactivate
                        </button>
                      </div>
                    )}
                    <div
                      onClick={() =>
                        window.open("/" + item.username)
                      }
                      className="tm3-user-img"
                      style={{ cursor: "pointer" }}
                    >
                      <LazyLoadImage
                        alt="bg"
                        src={item.profile_picture}
                        effect="blur"
                        className="img_class"
                        height={"100%"}
                        width={"100%"}
                      />
                    </div>
                    <div className="tm3-name">
                      <h1>{item.name}</h1>
                      <p>{item.company}</p>
                      <img
                        src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Mask_group_png.webp"
                        alt="bg"
                        loading="lazy"
                        className="bg_img"
                      />
                      <button
                        onClick={() => {
                          setIsOpen2(true);
                          setSelectedMemberId(item.id);
                          setToken(item.token);
                          localStorage.setItem("jwt_admin", item.token);
                        }}
                        className="edit_btn"
                      >
                        <ModeEditIcon className="icon" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setIsOpen(true)}
                className="admin_con_card_add "
              >
                <AddIcon className="icon" />
              </button>
            </div>
          )}

          <h5 className="team_limit_text">
            Note:{" "}
            <span>
              You have already added the Admin Profile and {TeamData.TeamCount}{" "}
              Team Members.
              <br />
              You can add up to {TeamData.TeamLimit - 1} Team Members in total.
              To add more, please{" "}
              <button
                className="basic_btn text-primary"
                onClick={() => {
                  window.open("/contact-sales");
                }}
              >
                contact us.
              </button>
            </span>
          </h5>
        </>
      )}
      {isOpen && (
        <BlurPopup onClose={() => setIsOpen(false)} openState={isOpen}>
          <div className="blurpopup_con_wrapper">
            <TeamSignUp
              onClose={() => setIsOpen(false)}
              TeamDatas={TeamDatas}
              onSubmit={get_team_member}
            />
          </div>
        </BlurPopup>
      )}
      {isOpen2 && (
        <BlurPopup
          onClose={() => {
            setIsOpen2(false);
            setShowProfile(false);
          }}
          openState={isOpen2}
        >
          <div className="blurpopup_con_wrapper">
            <h5>Edit Profile</h5>
            <p>Manage Team Member Profile</p>
            <div
              className="card_btns card_btns2"
              style={{ marginTop: 27, gap: 30 }}
            >
              <button className="btn_top" onClick={() => setIsOpen2(false)}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowProfile(true);
                  setIsOpen2(false);
                }}
                className="btn-primary"
                style={{ padding: "7px 15px", minWidth: "auto" }}
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  deactivate_team_member();
                }}
                className="btn-primary"
                style={{ padding: "7px 15px", minWidth: "auto" }}
              >
                {!loading ? (
                  "Deactivate Profile"
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
        </BlurPopup>
      )}
      {isOpen3 && (
        <BlurPopup onClose={() => setIsOpen3(false)} openState={isOpen3}>
          <div className="blurpopup_con_wrapper">
            <h5>Company Branding</h5>
            <p>
              Select your brand color and logo. These will be consistent
              company-wide for all the team members' profiles.
            </p>
            <div
              onClick={() => {
                setIsLogoUpload(true);
                setIsOpen3(false);
              }}
              className="admin_con_card_logo"
            >
              <img src={upload_icon} alt="upload_icon" loading="lazy" />
              <h5>Manage Logo</h5>
            </div>
            {Logo !== "" && (
              <img
                loading="lazy"
                className="admin_con_card_logo_preview_img"
                alt="profile"
                src={
                  Logo !== undefined
                    ? Logo instanceof File
                      ? URL.createObjectURL(Logo)
                      : Logo
                    : Logo
                }
              />
            )}
            <h4 className="color_picker_header">Primary Colour</h4>
            <div className="color_picker_con">
              <ChromePicker
                color={TeamData.Primary_color}
                onChange={(newColor) => {
                  setTeamData({
                    ...TeamData,
                    Primary_color: newColor.hex,
                  });
                }}
              />
              <div className="color_picker_con_img">
                <LazyLoadImage
                  alt="User"
                  effect="blur"
                  src="https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Customwding-410099_png_yK1Hqq4.webp"
                  wrapperClassName="color_picker_img"
                />
                <p>Note: The area marked in red is the primary colour.</p>
              </div>
            </div>
            <div className="card_btns" style={{ marginTop: 32 }}>
              <button className="btn_top" onClick={() => setIsOpen3(false)}>
                Cancel
              </button>
              <button onClick={update_admin} className="btn-primary">
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
        </BlurPopup>
      )}
      <BottomBar />
    </div>
  );
}

export default Admin;
