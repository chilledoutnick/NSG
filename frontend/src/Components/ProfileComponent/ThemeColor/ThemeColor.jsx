import React, { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axios from "axios";
import "./ThemeColor.scss";

const bgId = [
  { id: 1, color: "#6018c0", bg: "#F3EAFF" },
  { id: 2, color: "#a9cd08", bg: "#E8F3D5" },
  { id: 3, color: "#3d3d3d", bg: "#ECECEC" },
  { id: 4, color: "#4a35ed", bg: "#ECEEF9" },
  { id: 5, color: "#fdbf00", bg: "#FFF7E0" },
];

function ThemeColor({ themeColor, username, onUpdateThemeColor }) {
  const [formData, setFormData] = useState({
    background_colour: "",
    background_pattern: "",
  });
  const [customColor, setCustomColor] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [isColorSelected, setIsColorSelected] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef(null);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    },
  };

  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;

    
      if (themeColor?.background_colour) return;

      try {

        const response = await axios.get(`api/profile/${username}/`, config);
    

        if (response.data) {
          const profileData = {
            backgroundColor: response.data.background_colour || "",
            background_pattern: response.data.background_pattern || "",
          };

          setFormData(profileData);
          setIsColorSelected(Boolean(profileData.background_colour));

          
          const preset = bgId.find(
            (item) =>
              item.color === profileData.background_colour &&
              item.bg === profileData.background_pattern
          );

          if (preset) {
            setSelectedColorId(preset.id);
            setCustomColor(null);
          } else if (profileData.background_colour) {
            setCustomColor(profileData.background_colour);
            setSelectedColorId(null);
          }

        
          if (onUpdateThemeColor) {
            onUpdateThemeColor(profileData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchProfileData();
  }, [username]); 

 
  useEffect(() => {
    if (
      themeColor &&
      (themeColor.background_colour || themeColor.background_pattern)
    ) {
      

      setFormData({
        background_colour: themeColor.background_colour || "",
        background_pattern: themeColor.background_pattern || "",
      });
      setIsColorSelected(Boolean(themeColor.background_colour));

      
      const preset = bgId.find(
        (item) =>
          item.color === themeColor.background_colour &&
          item.bg === themeColor.background_pattern
      );

      if (preset) {
        setSelectedColorId(preset.id);
        setCustomColor(null);
      } else if (themeColor.background_colour) {
        setCustomColor(themeColor.background_colour);
        setSelectedColorId(null);
      }
    }
  }, [themeColor]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateProfileColor = async (newData) => {
    if (!username) {
      console.error("Username not provided!");
      return;
    }

    const payload = {
      username: username,
      background_colour: newData.background_colour,
      background_pattern: newData.background_pattern,
    };


    try {
      const response = await axios.post(
        "api/profile/update_profile/",
        payload,
        config
      );
 

    
      if (onUpdateThemeColor) {
        onUpdateThemeColor(newData);
      }

     
    } catch (err) {
      console.error("Failed to update color:", err.response?.data || err);
      alert("Failed to update color! Check console for details.");
    }
  };

  const handlePresetClick = (item) => {
    const newData = {
      background_colour: item.color,
      background_pattern: item.bg,
    };

    

    setFormData(newData);
    setSelectedColorId(item.id);
    setIsColorSelected(true);
    setCustomColor(null);

    updateProfileColor(newData);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r, g, b) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const createLightBackground = (color) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      const lightR = Math.round(rgb.r + (255 - rgb.r) * 0.85);
      const lightG = Math.round(rgb.g + (255 - rgb.g) * 0.85);
      const lightB = Math.round(rgb.b + (255 - rgb.b) * 0.85);
      return rgbToHex(lightR, lightG, lightB);
    }
    return "#ffffff";
  };

  const handleCustomColor = (e) => {
    const color = e.target.value;
    setCustomColor(color);

    const lightBg = createLightBackground(color);
    const newData = {
      background_colour: color,
      background_pattern: lightBg,
    };



    setFormData(newData);
    setSelectedColorId(null); 
    setIsColorSelected(true);
    updateProfileColor(newData);
  };


 

  return (
    <div className="theme_color_con">
      <h2>Theme color</h2>
      <h5>Custom your profile with desired colour for a better recall.</h5>
      {showPicker && (
            <div ref={pickerRef} className="color-picker-wrapper">
              <ChromePicker
                color={customColor || formData.background_colour || "#ffffff"}
                onChange={(color) =>
                  handleCustomColor({ target: { value: color.hex } })
                }
                disableAlpha
                styles={{ default: { picker: { width: "240px" } } }}
              />
            </div>
          )}
      <div
        className="bg_color_con"
        style={{
          backgroundColor: formData.background_pattern || "#F3EAFF",
        }}
      >
        <div className="bg_color_item">
          {bgId.map((item) => (
            <button
              key={item.id}
              className={selectedColorId === item.id ? "active" : ""}
              style={{
                backgroundColor: item.color,
              }}
              onClick={() => handlePresetClick(item)}
            >
              {selectedColorId === item.id && <div className="active-inner" />}
            </button>
          ))}

          <label
            className={`plus-btn ${!isColorSelected ? "disabled" : ""}`}
            onClick={() => isColorSelected && setShowPicker(!showPicker)}
          >
            <EditOutlinedIcon />
          </label>

          
        </div>

        <p>
          {!isColorSelected
            ? "Select from presets or click on edit to find your custom colour"
            : "Click on edit to customize your selected colour"}
        </p>
      </div>
    </div>
  );
}

export default ThemeColor;
