import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { isIOS } from "react-device-detect";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import CloseIcon from "@mui/icons-material/Close";

import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import "./AddToHome.scss";

const step1 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Frame_2018776444_png.webp";
const step2 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Frame_2018776444_1_png.webp";
const step3 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Frame_2018776445_png.webp";
const step4 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Frame_2018776454_png.webp";
const step5 =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Creative_png.webp";
const placeholder =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Frame_2018776444_uw6jom_png.webp";

const AddToHome = () => {
  const nsg_add_to_home = JSON.parse(
    sessionStorage.getItem("nsg_add_to_home")
  );
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);
  const [Step, setStep] = useState(0);
  const [Added, setAdded] = useState(false);

  const steps = [
    {
      id: 1,
      step: "Step 1/4",
      desc: "Tap on share icon.",
      img: step1,
    },
    {
      id: 2,
      step: "Step 2/4",
      desc: "Tap on “Add to Home Screen”.",
      img: step2,
    },
    {
      id: 3,
      step: "Step 3/4",
      desc: "Tap on “Add” at top right corner.",
      img: step3,
    },
    {
      id: 4,
      step: "Step 4/4",
      desc: "",
      img: step4,
    },
  ];

  useEffect(() => {
    if (nsg_add_to_home !== true && isIOS) {
      setInstallable(true);
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (nsg_add_to_home !== true) {
        setInstallable(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPWAInstalled = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          setAdded(true);
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
        setInstallable(false);
      });
    }
  };

  return (
    !isPWAInstalled() &&
    installable && (
      <div className="add_home_con">
        {Step !== 0 && (
          <BlurPopup onClose={() => setStep(0)} openState={Step}>
            <div className="blurpopup_con_wrapper">
              {steps.map((item, index) => {
                return (
                  <div
                    className={
                      "step_item " + (item.id !== Step ? "d-none" : "")
                    }
                    key={index + "step"}
                  >
                    <h3>Steps to add to home screen</h3>
                    <button
                      className="add_home_close"
                      onClick={() => setStep(0)}
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                    <LazyLoadImage
                      src={item.img}
                      alt={"step" + index}
                      effect="blur"
                      wrapperClassName="item_img"
                      placeholderSrc={placeholder}
                    />
                    <div className="add_text_wrapper">
                      <div className="add_text_left">
                        <button
                          disabled={Step === 1}
                          onClick={() => setStep(Step - 1)}
                          className="nav_btn"
                        >
                          <KeyboardArrowLeftIcon fontSize="large" />
                        </button>
                        <div>
                          <span className="step_text">{item.step}</span>
                          <p>{item.desc}</p>
                        </div>
                      </div>
                      {Step === 4 ? (
                        <button
                          onClick={() => setStep(0)}
                          className="btn-primary"
                        >
                          <ThumbUpOffAltIcon /> Understood
                        </button>
                      ) : (
                        <button
                          className="nav_btn"
                          disabled={Step === 4}
                          onClick={() => setStep(Step + 1)}
                        >
                          <KeyboardArrowRightIcon fontSize="large" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </BlurPopup>
        )}
        {Added && (
          <BlurPopup onClose={() => setAdded(false)} openState={Added}>
            <div className="blurpopup_con_wrapper">
              <div className="step_success">
                <h3>Successfully added NSG to Home Screen!</h3>
                <img src={step5} alt="step5" />
                <p>
                  You can now access NSG App directly from your phone’s home
                  screen. Keep enjoying the benefits of NSG.
                </p>
                <button onClick={() => setAdded(false)} className="btn-primary">
                  <ThumbUpOffAltIcon /> Done
                </button>
              </div>
            </div>
          </BlurPopup>
        )}
        <h2>Add NSG to home screen</h2>
        <div>
          <button
            className="home_btn_main"
            onClick={() => {
              if (isIOS) {
                setStep(1);
              } else {
                handleInstallClick();
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
    )
  );
};

export default AddToHome;
