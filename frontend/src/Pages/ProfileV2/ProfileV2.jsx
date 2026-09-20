import React, { useState, useEffect } from "react";
import ProfileCard from "../../Components/ProfileComponent/ProfileCard/ProfileCard";
import WelcomeMessage from "../../Components/ProfileComponent/WelcomeMessage/WelcomeMessage";
import ThemeColor from "../../Components/ProfileComponent/ThemeColor/ThemeColor";
import About from "../../Components/ProfileComponent/About/About";
import Avaialability from "../../Components/CardProfileAvailability/Avaialability";
import SocialLinks from "../../Components/ProfileComponent/SocialLinks/SocialLinks";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import Service from "../../Components/ProfileComponent/Service/Service";
import ProfileVideo from "../../Components/ProfileComponent/ProfileVideo/ProfileVideo";
import FeaturedImages from "../../Components/ProfileComponent/FeaturedImages/FeaturedImages";
import OtherLinks from "../../Components/ProfileComponent/OtherLinks/OtherLinks";
import ProfileReview from "../../Components/ProfileComponent/ProfileReview/ProfileReview";
import AddContentBar from "../../Components/ProfileComponent/AddContentBar/AddContentBar";
import ContactInfo from "../../Components/ProfileComponent/ContactInfo/ContactInfo";
import { Toaster, toast } from "react-hot-toast";
import { useStore } from "../../store/advisorStore";
import "./ProfileV2.scss";
import IphoneImg from "./iPhone_16_Pro_Max_1.png";
import axios from "axios";
function ProfileV2() {
  const {advisor_data, get_advisor_data } = useStore();
  const [activeProfile, setActiveProfile] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };
  const defaultMoveableOrder = [
    "Service",
    "ProfileVideo",
    "FeaturedImages",
    "OtherLinks",
    "ProfileReview",
  ];
  const [moveableOrder, setMoveableOrder] = useState(defaultMoveableOrder);

  const [profileData, setProfileData] = useState({
    about: "",
    welcomeMessage: {
      heading: "",
      subheading: "",
    },
    themeColor: {
      background_colour: "",
      background_pattern: "",
    },
    services: [],
    videos: [],
    featuredImages: [],
    socialLinks: [],
    otherLinks: [],
    reviews: [],
  });
  let profile_url = "";
  let url = "";


  if (
    axios.defaults.baseURL?.includes("127.0.0.1") ||
    axios.defaults.baseURL?.includes("localhost") || window.location.hostname === "localhost"
  ) {
    url = "http://localhost:4000/";
  } else {

    url = axios.defaults.baseURL.endsWith("/")
      ? axios.defaults.baseURL
      : axios.defaults.baseURL + "/";
  }


  if (activeProfile?.username) {
    const base = `${url}${activeProfile.username}`;
    profile_url = base.includes("?")
      ? `${base}&preview=true`
      : `${base}?preview=true`;
  }
  console.log("profile_url sent to iframe:", profile_url);

  const getVideos = (username) => {
    return axios.post("/api/user/get_video_link/", { username });
  };

  const addVideo = (formData) => {
    return axios.post("/api/user/add_video/", formData, config);
  };
const handleSaveVideo = async (formData) => {
  try {
    await addVideo(formData);
    const res = await getVideos(activeProfile.username); 
    const items = Array.isArray(res.data?.links) ? res.data.links : [];
    const mapped = items.map((it) => ({
      type: it.video ? "file" : "link",
      url: it.video || it.video_link || "",
      name: it.Video_title || "",
    }));
    setProfileData((prev) => ({
      ...prev,
      videos: mapped,
    }));
  } catch (err) {
    console.error("Error saving video:", err);
  }
};

  useEffect(() => {
  setIframeKey((prev) => prev + 1);
}, [profileData,activeProfile,moveableOrder]);

  useEffect(() => {
    if (!activeProfile?.username) return;

    const fetchProfileDetails = async () => {
      try {
        const res = await axios.post(
          "api/profile/get_all_profiles/",
          "",
          config
        );
        const profile = res.data.find(
          (p) => p.username === activeProfile.username
        );
        if (!profile) return;

        const about =
          profile.about ||
          "I'm here to help families achieve prosperous futures...";

        const heading =
          profile.wlcm_heading ||
          profile.wlcm_message?.heading ||
          "Welcome aboard";
        const subheading =
          profile.wlcm_subheading ||
          profile.wlcm_message?.subheading ||
          "Explore my profile, reach out for inquiries or collaborations. Let's connect!";

        const themeColor = {
          background_colour: profile.background_colour || "",
          background_pattern: profile.background_pattern || "",
        };

        const links = [];
        if (profile.instagram)
          links.push({
            icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Screenshot_2025-03-22_at_1_14_47PM_2_png.webp",
            link: profile.instagram,
            platform: "instagram",
          });
        if (profile.facebook)
          links.push({
            icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png",
            link: profile.facebook,
            platform: "facebook",
          });
        if (profile.linkedin)
          links.push({
            icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/8d2e378549c9485dae284febb2bcf1a8.webp",
            link: profile.linkedin,
            platform: "linkedin",
          });
        if (profile.twitter)
          links.push({
            icon: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/5d3d64a5f5b140cf9b120ddcbdc10f2f.webp",
            link: profile.twitter,
            platform: "twitter",
          });
        if (profile.tiktok)
          links.push({
            icon: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png",
            link: profile.tiktok,
            platform: "tiktok",
          });
        if (profile.youtube)
          links.push({
            icon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
            link: profile.youtube,
            platform: "youtube",
          });

        setProfileData((prev) => ({
          ...prev,
          about,
          welcomeMessage: { heading, subheading },
          themeColor,
          socialLinks: links,
        }));
      } catch (err) {
        console.error("Error fetching profile details:", err);
      }
    };

    fetchProfileDetails();
  }, [activeProfile?.username]);

  const deleteVideoLinks = async (username) => {
    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    };
    const res = await axios.post(
      "/api/user/delete_video_link/",
      { username },
      config
    );

    if (res.status === 204) {
      setProfileData((prev) => ({ ...prev, videos: [] }));
      toast.success("Video link deleted");
    }
  };

  const handleDeleteVideo = async () => {
    if (!activeProfile?.username) return;
    try {
      await deleteVideoLinks(activeProfile.username);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete video");
    }
  };

  const getGallery = async (username) => {
    try {
      const res = await axios.post("/api/profile_gallery/get_gallery/", {
        username,
      });
      console.log("Gallery fetched:", res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching gallery:", err);
      return [];
    }
  };
  const getReviews = async (username) => {
    try {
      const res = await axios.post("/api/profile_review/get_review_by_user/", {
        username,
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching reviews:", err);
      return { data: [], avg_rating: 0 };
    }
  };
  useEffect(() => {
    if (!activeProfile?.username) return;

    getVideos(activeProfile.username)
      .then((res) => {
        console.log("Videos fetched:", res.data);
        const items = Array.isArray(res.data?.links) ? res.data.links : [];
        const mapped = items.map((it) => ({
          type: it.video ? "file" : "link",
          url: it.video || it.video_link || "",
          name: it.Video_title || "",
          raw: it,
        }));
        setProfileData((prev) => ({ ...prev, videos: mapped }));
      })
      .catch((err) => {
        console.error("Error fetching videos:", err);
        setProfileData((prev) => ({ ...prev, videos: [] }));
      });
  }, [activeProfile?.username]);

  useEffect(() => {
    if (!activeProfile?.username) return;

    const fetchReviews = async () => {
      const res = await getReviews(activeProfile.username);

      setProfileData((prev) => ({
        ...prev,
        reviews: res.data || [],
        avgRating: res.avg_rating || 0,
      }));
    };

    fetchReviews();
  }, [activeProfile?.username]);

  useEffect(() => {
    if (!activeProfile?.username) return;

    const fetchGallery = async () => {
      const galleryData = await getGallery(activeProfile.username);
      const imageUrls = galleryData.map((item) => item.profile_picture);
      setProfileData((prev) => ({ ...prev, featuredImages: imageUrls }));
    };

    fetchGallery();
  }, [activeProfile?.username]);

  const fetchServices = async () => {
    const payload = { username: activeProfile.username };
    try {
      const url = "api/service/get_services_new/";
      axios
        .post(url, payload, config)
        .then((res) => {
          console.log("Services fetched:", res.data);
          const data = res.data;
          setProfileData((prev) => ({ ...prev, services: data }));
        })
        .catch((err) => {
          console.error("Error fetching services:", err);
        })
        .finally(() => {});
    } catch (error) {
      console.error("Error fetching services:", error);
    
      setProfileData((prev) => ({ ...prev, services: [] }));
    }
  };

  useEffect(() => {
    if (Object.keys(advisor_data).length === 0) {
      get_advisor_data(true);
    }
  }, []);
  useEffect(() => {
    if (!activeProfile?.username) return;
    fetchServices(activeProfile.username);
  }, [activeProfile?.username]);

  useEffect(() => {
    if (!activeProfile?.username) return;

    getlinks(activeProfile.username)
      .then((res) => {
        console.log("Other links fetched:", res.data);
        const items = Array.isArray(res.data.links) ? res.data.links : [];
        const mapped = items.map((it) => ({
          name: it.title || "",
          link: it.link || "",
          link_id: it.link_id,
        }));
        setProfileData((prev) => ({ ...prev, otherLinks: mapped }));
      })
      .catch((err) => {
        console.error("Error fetching other links:", err);
        setProfileData((prev) => ({ ...prev, otherLinks: [] }));
      });
  }, [activeProfile?.username]);

  const getlinks = (username) => {
    return axios.post("/api/profile/get_links/", { username });
  };

  const refreshOtherLinks = async () => {
  try {
    const res = await getlinks(activeProfile.username);
    const items = Array.isArray(res.data.links) ? res.data.links : [];
    const mapped = items.map((it) => ({
      name: it.title || "",
      link: it.link || "",
      link_id: it.link_id,
    }));
    setProfileData(prev => ({ ...prev, otherLinks: mapped }));
  } catch (err) {
    console.error("Failed to refresh other links:", err);
  }
};


  const [modals, setModals] = useState({
    Service: false,
    ProfileVideo: false,
    FeaturedImages: false,
    OtherLinks: false,
    ProfileReview: false,
  });

  const openModal = (componentName) =>
    setModals((prev) => ({ ...prev, [componentName]: true }));
  const closeModal = (componentName) =>
    setModals((prev) => ({ ...prev, [componentName]: false }));

  const handleUpdateServices = (newServices) =>
    setProfileData((prev) => ({ ...prev, services: newServices }));
  const handleUpdateVideos = (newVideos) =>
    setProfileData((prev) => ({ ...prev, videos: newVideos }));
  const handleUpdateImages = (newImages) =>
    setProfileData((prev) => ({ ...prev, featuredImages: newImages }));
  const handleUpdateLinks = (newLinks) => {
    setProfileData((prev) => ({ ...prev, otherLinks: newLinks }));
  };
  const handleUpdateReviews = (newReviews) => {
    setProfileData((prev) => ({ ...prev, reviews: newReviews }));
  };

  const handleTriggerAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file && activeProfile?.username) {
        const formData = new FormData();
        formData.append("username", activeProfile.username);
        formData.append("picture", file);
        formData.append("column_number", profileData.featuredImages.length + 1); 
        try {
          const res = await axios.post(
            "api/profile_gallery/create_update_gallery/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                " Authorization": `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );
          console.log("Image uploaded:", res.data);
          const newImages = [...profileData.featuredImages, res.data.picture];
          handleUpdateImages(newImages);
          toast.success("Image uploaded successfully!");
        } catch (err) {
          console.error("Error uploading image:", err);
          toast.error("Failed to upload image");
        }
      }
    };
    input.click();
  };

  const handleAddClick = (componentName) => {
    if (componentName === "FeaturedImages") {
      handleTriggerAddImage();
    } else {
      openModal(componentName);
    }
  };
  const getVisibleOrder = () => {
    return moveableOrder.filter((name) => hasData(name));
  };
const getLayout = async (username) => {
  const res = await axios.post("/api/profile_layout/get_layout/", { username });
  return res.data; // array
};

const updateLayout = async (username, order) => {
  await axios.post("/api/profile_layout/update_layout/", {
    username,
    order,
  },config);
};



useEffect(() => {
  if (!activeProfile?.username) return;

  getLayout(activeProfile.username)
    .then((order) => {
      if (Array.isArray(order) && order.length > 0) {
        setMoveableOrder(order);
      }
    })
    .catch((err) => console.error("Failed to fetch layout:", err));
}, [activeProfile?.username]);

 

 const moveUp = async (componentName) => {
  const visibleOrder = getVisibleOrder();
  const currentIndex = visibleOrder.indexOf(componentName);
  if (currentIndex > 0) {
    const newVisibleOrder = [...visibleOrder];
    [newVisibleOrder[currentIndex], newVisibleOrder[currentIndex - 1]] = [
      newVisibleOrder[currentIndex - 1],
      newVisibleOrder[currentIndex],
    ];

    const newOrder = [...moveableOrder];
    const visibleNames = moveableOrder.filter((n) => hasData(n));

    newVisibleOrder.forEach((name, idx) => {
      newOrder[moveableOrder.indexOf(visibleNames[idx])] = name;
    });

    setMoveableOrder(newOrder);

    try {
      await updateLayout(activeProfile.username, newOrder);
      toast.success(`${componentName} moved up`);
    } catch {
      toast.error("Failed to save layout");
    }
  }
};


 const moveDown = async (componentName) => {
  const visibleOrder = getVisibleOrder();
  const currentIndex = visibleOrder.indexOf(componentName);
  if (currentIndex < visibleOrder.length - 1) {
    const newVisibleOrder = [...visibleOrder];
    [newVisibleOrder[currentIndex], newVisibleOrder[currentIndex + 1]] = [
      newVisibleOrder[currentIndex + 1],
      newVisibleOrder[currentIndex],
    ];

    const newOrder = [...moveableOrder];
    const visibleNames = moveableOrder.filter((n) => hasData(n));

    newVisibleOrder.forEach((name, idx) => {
      newOrder[moveableOrder.indexOf(visibleNames[idx])] = name;
    });

    setMoveableOrder(newOrder);

    try {
      await updateLayout(activeProfile.username, newOrder);
      toast.success(`${componentName} moved down`);
    } catch {
      toast.error("Failed to save layout");
    }
  }
};



  const isMoveUpDisabled = (componentName) => {
  const visibleOrder = getVisibleOrder();
  return visibleOrder.indexOf(componentName) === 0;
};

const isMoveDownDisabled = (componentName) => {
  const visibleOrder = getVisibleOrder();
  return visibleOrder.indexOf(componentName) === visibleOrder.length - 1;
};


  const hasData = (componentName) => {
    switch (componentName) {
      case "Service":
        return profileData.services && profileData.services.length > 0;
      case "ProfileVideo":
        return profileData.videos && profileData.videos.length > 0;
      case "FeaturedImages":
        return (
          profileData.featuredImages && profileData.featuredImages.length > 0
        );
      case "OtherLinks":
        return profileData.otherLinks && profileData.otherLinks.length > 0;
      case "ProfileReview":
        return profileData.reviews && profileData.reviews.length > 0;
      default:
        return false;
    }
  };
  const componentMap = {
    Service: (
      <Service
        services={profileData.services}
        onUpdateServices={handleUpdateServices}
        username={activeProfile?.username}
        fetchServices={fetchServices}
        showInPreview={activeProfile?.is_service}
      />
    ),
    ProfileVideo: (
      <ProfileVideo
        videos={profileData.videos}
        onUpdateVideos={handleUpdateVideos}
        username={activeProfile?.username}
        onSaveVideo={handleSaveVideo}
        onDeleteVideo={handleDeleteVideo}
        showInPreview={activeProfile?.is_video}
      />
    ),
    FeaturedImages: (
      <FeaturedImages
        images={profileData.featuredImages}
        onUpdateImages={handleUpdateImages}
        onAddImage={handleTriggerAddImage}
        username={activeProfile?.username}
        showInPreview={activeProfile?.is_feature_images}
      />
    ),

    OtherLinks: (
      <OtherLinks
        links={profileData.otherLinks}
        username={activeProfile?.username}
        onUpdateLinks={handleUpdateLinks}
        showInPreview={activeProfile?.is_links}
        refreshLinks={refreshOtherLinks}
      />
    ),
    ProfileReview: (
      <ProfileReview
        hasData={(profileData?.reviews || []).length > 0}
        reviews={profileData?.reviews || []}
        avgRating={profileData?.avgRating || 0}
        onUpdateReviews={handleUpdateReviews}
        username={activeProfile?.username}
        showInPreview={activeProfile?.is_reviews}
      />
    ),
  };

  const componentsWithoutData = defaultMoveableOrder.filter(
    (name) => !hasData(name)
  );

  const allActionItems = [
    "Service",
    "ProfileVideo",
    "FeaturedImages",
    "OtherLinks",
    "ProfileReview",
  ];

  return (
    <>
      <div className="profile_con">
        <div className="Profile_edit_con">
          <ProfileCard onSelectProfile={setActiveProfile} 
          />
          
          <ContactInfo username={activeProfile?.username}  />

          <WelcomeMessage
            welcomeMessage={profileData.welcomeMessage}
            username={activeProfile?.username}
            onUpdateWelcomeMessage={(newMessage) =>
              setProfileData((prev) => ({
                ...prev,
                welcomeMessage: newMessage,
              }))
            }
          />

          <ThemeColor
            themeColor={profileData.themeColor}
            username={activeProfile?.username}
            onUpdateThemeColor={(newTheme) =>
              setProfileData((prev) => ({ ...prev, themeColor: newTheme }))
            }
          />
          <div className="profile_schedule">
            <Avaialability advisor={advisor_data} />
          </div>
          <About
            about={profileData.about}
            username={activeProfile?.username}
            onUpdateAbout={(newAbout) =>
              setProfileData((prev) => ({ ...prev, about: newAbout }))
            }
          />
          <SocialLinks
            socialLinks={profileData.socialLinks}
            username={activeProfile?.username}
            onUpdateSocialLinks={(updatedLinks) =>
              setProfileData((prev) => ({ ...prev, socialLinks: updatedLinks }))
            }
          />

          {moveableOrder.map((componentName) => {
            const component = componentMap[componentName];
            if (!component) return null;

            return React.cloneElement(component, {
              key: componentName,
              hasData: hasData(componentName),
              onMoveUp: () => moveUp(componentName),
              onMoveDown: () => moveDown(componentName),
              isMoveUpDisabled: isMoveUpDisabled(componentName),
              isMoveDownDisabled: isMoveDownDisabled(componentName),
              isModalOpen: modals[componentName],
              onCloseModal: () => closeModal(componentName),
              onOpenModal: () => openModal(componentName),
            });
          })}

          <AddContentBar
            actionItems={allActionItems}
            onAddClick={handleAddClick}
            hasData={hasData}
          />
        </div>
        <div className="Profile_view_con">
          <div className="phone-preview">
            <img src={IphoneImg} alt="iPhone 16 Pro" className="iphone-frame" />
            <div className="screen-content">
              <iframe 
              key={iframeKey}
              src={profile_url} title="iframe-preview" />
            </div>
          </div>
        </div>
      </div>
      <BottomBar />
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: "#000",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background: "#b91c1c",
              color: "#fff",
            },
          },
        }}
        containerStyle={{
          top: 80,
        }}
      />
    </>
  );
}

export default ProfileV2;
