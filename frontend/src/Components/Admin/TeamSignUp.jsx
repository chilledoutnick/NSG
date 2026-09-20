import axios from "axios";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import Swal from "sweetalert2";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import "../../Pages/LoginPage/Login.scss";

function TeamSignUp(props) {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [succesMsg, setSuccesMsg] = useState("");
  const [email_exists, setEmail_exists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    domain: "",
    password: "",
  });

  let TeamLimit =
    props.TeamDatas.team_limit < props.TeamDatas.team_member_count + 2;
  const isDisabled =
    errorMsg ||
    email_exists ||
    formData.name === "" ||
    formData.email === "" ||
    formData.domain === "" ||
    TeamLimit ||
    formData.password === "";

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    formData[name] = value;
    setFormData({
      ...formData,
    });
  };

  const check_username = (domain) => {
    const url = "api/user/check_username/";
    const payload = {
      username: domain,
    };
    axios
      .post(url, payload)
      .then((res) => {
        if (res.data.is_user !== false) {
          setErrorMsg("Domain already taken");
          setSuccesMsg("");
        } else {
          setErrorMsg("");
          setSuccesMsg("Domain Available");
        }
      })
      .catch((err) => {
        setSuccesMsg("");
        setErrorMsg(err.response.data.message);
      });
  };

  const check_email = (email) => {
    const url = "/api/user/email_check/";
    const payload = {
      email: email,
    };
    axios
      .post(url, payload)
      .then((res) => {
        setEmail_exists(res.data.email_exists);
        setErrorMsg("");
      })
      .catch((err) => {
        setErrorMsg(err.response.data.message);
      });
  };

   const add_sender_data = () => {
    const PaidUser = "b22EEW";
    const url = "api/feature/add_sender_data/";
    var fullName = formData.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const payload = {
      email: formData.email,
      firstname: firstName,
      lastname: lastName,
      tags: [PaidUser],
      phone: formData.phone ? "+1" + formData.phone : "",
    };
    axios
      .post(url, payload)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const signUp = () => {
    setLoading(true);
    const payload = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      username: formData.domain,
      phone: formData.phone,
      package: 6,
      is_advisor: true,
    };
    const url = "api/user_profile/create_user/";
    // const url = "api/user/signup/"
    axios
      .post(url, payload)
      .then((res) => {
        setSubmitError("");
        create_team_member(res.data.user_id);
        post_payment_status(res.data.user_id);
        invite_team_member();
        if (axios.defaults.baseURL === "https://nsgcrm.com") {
          mailChimp_submit();
          add_sender_data()
        }
      })
      .catch((error) => {
        alert(error.response.data.message);
        setSubmitError(error.response.data.message);
        setLoading(false);
      });
  };

  const create_team_member = (id) => {
    const url = "api/team_admin/create_team_member/";
    const payload = {
      host_user: props.TeamDatas.user_id,
      referred_user: id,
    };
    axios
      .post(url, payload)
      .then(() => {
        props.onSubmit();
        props.onClose();
        setLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        Swal.fire({
          icon: "warning",
          title: "Oops",
          text: "something went wrong.",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const post_payment_status = (id) => {
    // const url = "api/advisor/post_payment_status/";
    const url = "api/user_profile/post_payment_status/";
    const payload = {
      payment_status: true,
      user_id: id,
      is_free: true,
    };
    axios
      .post(url, payload)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          html: "Account created successfully. <br><br>  Note: Your team member may need to check their spam folder for an email from nsg.noreply@nsgcrm.com",
          showConfirmButton: true,
        });
      })
      .catch((err) => console.log(err));
  };

  const mailChimp_submit = () => {
    var fullName = formData.name.split(" "),
      firstName = fullName[0],
      lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
    const url = "api/mail_chimp/post_email/";
    const payload = {
      email: formData.email,
      first_name: firstName,
      last_name: lastName,
      // tags: ["Abandoned Cart Customers"],
      tags: ["New User"],
    };
    axios
      .post(url, payload)
      .then()
      .catch((err) => {
        console.log(err);
      });
  };

  const invite_team_member = () => {
    setLoading(true);
    const url = "api/team_admin/invite_team_member/";
    const payload = {
      name: formData.name,
      email: formData.email,
    };
    axios
      .post(url, payload, config)
      .then()
      .catch((err) => {
        console.log("err", err);
      });
  };

  return (
    <>
      <h5>Add Member</h5>
      <p>Create new team member profile.</p>
      <label htmlFor="">Full Name</label>
      <input
        value={formData.name}
        name="name"
        type="text"
        placeholder="Full Name"
        onChange={handleChange}
      />
      <label htmlFor="">Email</label>
      <input
        value={formData.email}
        name="email"
        type="email"
        placeholder="you@gmail.com"
        onChange={handleChange}
        onBlur={(e) => {
          check_email(e.target.value);
        }}
      />
      {email_exists && (
        <span className="error mb-2" style={{ marginTop: -10 }}>
          Account with this email already exists
        </span>
      )}
      <label htmlFor="">Phone Number</label>
      <input
        value={formData.phone}
        name="phone"
        type="text"
        placeholder="Business phone number, Eg - (645)3245487"
        onChange={handleChange}
      />
      <label htmlFor="">Domain</label>
      <div className="domain_input mb-1">
        <div>
          <span>/</span>
        </div>
        <input
          type="text"
          name="domain"
          value={formData.domain}
          placeholder={formData.domain || "Name"}
          onBlur={() => check_username(formData.domain)}
          style={{ width: 180 }}
          onChange={(e) => {
            e.preventDefault();
            setFormData({
              ...formData,
              domain: e.target.value,
            });
          }}
        />
      </div>
      {succesMsg && <span className="success_msg">{succesMsg}</span>}
      <span style={{ textAlign: "start" }} className="error_text">
        {errorMsg}
      </span>
      <label className="mt-2" htmlFor="">
        Password
      </label>

      <div className="password-con" style={{ width: "fit-content" }}>
        <input
          name="password"
          type={!showPassword ? "password" : "text"}
          onChange={handleChange}
          value={formData.password}
          placeholder="password"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowPassword(!showPassword);
          }}
        >
          {!showPassword ? (
            <RemoveRedEyeRoundedIcon />
          ) : (
            <VisibilityOffRoundedIcon />
          )}
        </button>
      </div>
      <span className="error">{submitError}</span>
      {TeamLimit && (
        <p className="error mb-0 mt-3" style={{ fontSize: 16 }}>
          Team member limit reached. To add more, please{" "}
          <button
            className="basic_btn text-primary fw-bold"
            onClick={() => {
              window.open("/contact-sales");
            }}
          >
            contact us.
          </button>
        </p>
      )}
      <div className="card_btns">
        <button className="btn_top" onClick={props.onClose}>
          Cancel
        </button>
        <button onClick={signUp} className="btn-primary" disabled={isDisabled}>
          {!loading ? (
            "Create"
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
    </>
  );
}

export default TeamSignUp;
