import axios from "axios";
import  { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ThreeDots } from "react-loader-spinner";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import CloseIcon from "@mui/icons-material/Close";
const ballon_img =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/balloon_png.webp";

function PauseSub(props) {
  const [isSuccess, setIsSuccess] = useState();
  const [PauseDays, setPauseDays] = useState(0);
  const [loading, setIsLoading] = useState(false);
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };
  const pause_subscription = () => {
    setIsLoading(true);
    const url = "api/stripe/pause_subscription/";
    const payload = {
      pause_days: PauseDays,
    };
    axios
      .post(url, payload, config)
      .then((res) => {
        setIsSuccess(true);
        setIsLoading(false);
      })
      .catch((err) => setIsLoading(false));
  };

  return (
    <div>
      <button onClick={props.onClose} className="back_btn">
        <CloseIcon />
      </button>
      {!isSuccess ? (
        <>
          <h3>Pause subscription</h3>
          <h5>Pause your subscription for 30, 60, or 90 days.</h5>
          <p>
            During the pause break, you will not be charged. Your account will
            resume automatically when the duration ends.
          </p>
          <div className="pause_card">
            <h5>
              Choose number of days you want <br /> to pause.
            </h5>
            <div>
              <button
                onClick={() => setPauseDays(30)}
                className={PauseDays === 30 ? "active" : ""}
              >
                30 days
              </button>
              <button
                onClick={() => setPauseDays(60)}
                className={PauseDays === 60 ? "active" : ""}
              >
                60 days
              </button>
              <button
                onClick={() => setPauseDays(90)}
                className={PauseDays === 90 ? "active" : ""}
              >
                90 days
              </button>
            </div>
          </div>
          <div className="pause_btn">
            <button onClick={props.onClose} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={() => {
                pause_subscription();
              }}
              className="btn-primary"
            >
              {!loading ? (
                "Next"
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
        </>
      ) : (
        <div className="success_pause">
          <h3>Successfully paused</h3>
          <h4>A notification has been mailed to you. </h4>
          <LazyLoadImage
            src={ballon_img}
            effect="blur"
            alt="ballon img"
            wrapperClassName="success_pause_img"
          />
          <h5>Paused for 60 days</h5>
          <h4>
            Your subscription will resume automatically on Oct 12, 2024 (after
            60 days). We shall keep you posted.
          </h4>
          <div className="pause_btn">
            <button onClick={props.onClose} className="btn-primary">
              <ThumbUpOutlinedIcon fontSize="small" /> Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PauseSub;



// import axios from "axios";
// import { useState } from "react";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import { ThreeDots } from "react-loader-spinner";
// import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
// import CloseIcon from "@mui/icons-material/Close";
// const ballon_img =
//   "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/balloon_png.webp";

// function PauseSub(props) {
//   const [isSuccess, setIsSuccess] = useState();
//   const [PauseDays, setPauseDays] = useState(0);
//   const [loading, setIsLoading] = useState(false);
//   const [resumeTimestamp, setResumeTimestamp] = useState(null);

//   const config = {
//     headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
//   };
//   // const pause_subscription = () => {
//   //   setIsLoading(true);
//   //   const url = "api/stripe/pause_subscription/";
//   //   const payload = {
//   //     pause_days: PauseDays,
//   //   };
//   //   axios
//   //     .post(url, payload, config)
//   //     .then((res) => {
//   //       setIsSuccess(true);
//   //       setIsLoading(false);

//   //   const resume_at_unix = res?.data?.subscription?.pause_collection?.resumes_at;
//   //   if (resume_at_unix) {
//   //     setResumeTimestamp(resume_at_unix);
//   //   }

//   //     })
//   //     .catch((err) => setIsLoading(false));
//   // };

//   const pause_subscription = () => {
//     setIsLoading(true);
//     const url = "api/stripe/pause_subscription/";
//     const payload = {
//       pause_days: PauseDays,
//     };
//     axios
//       .post(url, payload, config)
//       .then((res) => {
//         setIsSuccess(true);
//         setIsLoading(false);

//         const resume_at_unix =
//           res?.data?.subscription?.pause_collection?.resumes_at;

//         if (resume_at_unix) {
//           setResumeTimestamp(resume_at_unix);

//           const pauseData = {
//             pause_started_at: Math.floor(Date.now() / 1000),
//             resumes_at: resume_at_unix,
//           };
//           localStorage.setItem("pause_info", JSON.stringify(pauseData));
//         }
//       })
//       .catch((err) => setIsLoading(false));
//   };

//   const getPauseDetails = () => {
//     if (!resumeTimestamp || !PauseDays) return null;

//     const resumeDate = new Date(resumeTimestamp * 1000);
//     const pauseStartDate = new Date(resumeDate);
//     pauseStartDate.setDate(resumeDate.getDate() - PauseDays); // calculate pause start

//     const formatDate = (dateObj) =>
//       dateObj.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       });

//     return {
//       resume: formatDate(resumeDate),
//       pauseStart: formatDate(pauseStartDate),
//       days: PauseDays,
//     };
//   };

//   return (
//     <div>
//       <button onClick={props.onClose} className="back_btn">
//         <CloseIcon />
//       </button>
//       {!isSuccess ? (
//         <>
//           <h3>Pause subscription</h3>
//           <h5>Pause your subscription for 30, 60, or 90 days.</h5>
//           <p>
//             During the pause break, you will not be charged. Your account will
//             resume automatically when the duration ends.
//           </p>
//           <div className="pause_card">
//             <h5>
//               Choose number of days you want <br /> to pause.
//             </h5>
//             <div>
//               <button
//                 onClick={() => setPauseDays(30)}
//                 className={PauseDays === 30 ? "active" : ""}
//               >
//                 30 days
//               </button>
//               <button
//                 onClick={() => setPauseDays(60)}
//                 className={PauseDays === 60 ? "active" : ""}
//               >
//                 60 days
//               </button>
//               <button
//                 onClick={() => setPauseDays(90)}
//                 className={PauseDays === 90 ? "active" : ""}
//               >
//                 90 days
//               </button>
//             </div>
//           </div>
//           <div className="pause_btn">
//             <button onClick={props.onClose} className="btn-outline">
//               Cancel
//             </button>
//             <button
//               onClick={() => {
//                 pause_subscription();
//               }}
//               className="btn-primary"
//             >
//               {!loading ? (
//                 "Next"
//               ) : (
//                 <ThreeDots
//                   height="25"
//                   width="60"
//                   color="white"
//                   ariaLabel="three-dots-loading"
//                   visible={true}
//                 />
//               )}
//             </button>
//           </div>
//         </>
//       ) : (
//         <div className="success_pause">
//           <h3>Successfully paused</h3>
//           <h4>A notification has been mailed to you. </h4>
//           <LazyLoadImage
//             src={ballon_img}
//             effect="blur"
//             alt="ballon img"
//             wrapperClassName="success_pause_img"
//           />

//           {getPauseDetails() && (
//             <>
//               <h5>Paused for {getPauseDetails().days} days</h5>
//               <h4>
//                 Your subscription will resume automatically on{" "}
//                 {getPauseDetails().resume} (after {getPauseDetails().days}{" "}
//                 days). We shall keep you posted.
//               </h4>
//               <p style={{ marginTop: "12px", fontSize: "14px", color: "#555" }}>
//                 Paused from {getPauseDetails().pauseStart} to{" "}
//                 {getPauseDetails().resume}
//               </p>
//             </>
//           )}

//           <div className="pause_btn">
//             <button onClick={props.onClose} className="btn-primary">
//               <ThumbUpOutlinedIcon fontSize="small" /> Done
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PauseSub;
