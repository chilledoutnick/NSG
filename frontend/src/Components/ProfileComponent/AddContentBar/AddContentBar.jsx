
import React from "react";
import "./AddContentBar.scss";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import MovieIcon from "@mui/icons-material/Movie";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import InsertCommentOutlinedIcon from "@mui/icons-material/InsertCommentOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const componentDetails = {
  FeaturedImages: { label: "Add Images", Icon: ImageOutlinedIcon },
  ProfileVideo: { label: "Add a video", Icon: MovieIcon },
  Service: { label: "List your Services", Icon: AppsRoundedIcon },
  OtherLinks: { label: "Add more links", Icon: LinkOutlinedIcon },
  ProfileReview: { label: "Request reviews", Icon: InsertCommentOutlinedIcon },
};

const AddContentBar = ({ actionItems, onAddClick, hasData }) => {
  if (!actionItems || actionItems.length === 0) {
    return null;
  }

  return (
    <div className="add-content-bar-container">
      {actionItems.map((componentName, index) => {
        const details = componentDetails[componentName];
        if (!details) return null;

        const { label, Icon } = details;
        const isFilled = hasData(componentName);

        
        const tooltipText = isFilled ? ` You have already added ${label}` : null;

        return (
          <button
            key={componentName}
            className={`add-content-button ${isFilled ? "disabled" : ""}`}
            onClick={() => onAddClick(componentName)}
            disabled={isFilled}
            title={tooltipText} 
          >
            <Icon className="add-content-icon" />
            <span className="add-content-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AddContentBar;