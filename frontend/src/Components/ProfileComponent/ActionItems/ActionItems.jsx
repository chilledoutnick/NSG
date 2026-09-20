import React from 'react';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import './ActionItems.scss';

const ActionItems = ({ missingComponents = [], onActionClick }) => {
  
  const actionItemsConfig = {
    'FeaturedImages': {
      icon: AddPhotoAlternateOutlinedIcon,
      label: 'Add Images',
      description: 'Upload your photos'
    },
    'ProfileVideo': {
      icon: VideoCallOutlinedIcon,
      label: 'Add a video',
      description: 'Share your story'
    },
    'Service': {
      icon: AppsOutlinedIcon,
      label: 'List your Services',
      description: 'Show what you offer'
    },
    'OtherLinks': {
      icon: LinkOutlinedIcon,
      label: 'Add more links',
      description: 'Connect social media'
    },
    'ProfileReview': {
      icon: ReviewsOutlinedIcon,
      label: 'Add reviews',
      description: 'Build trust'
    }
  };

  
  if (!missingComponents || missingComponents.length === 0) {
    return null;
  }

  const handleActionClick = (componentName) => {
    if (onActionClick) {
      onActionClick(componentName);
    }
  };

  return (
    <div className="action-items-container">
      <div className="action-items-header">
        <h3>Complete Your Profile</h3>
        <p>Add the following to make your profile more engaging</p>
      </div>
      
      <div className="action-items-grid">
        {missingComponents.map((componentName) => {
          const config = actionItemsConfig[componentName];
          if (!config) return null;
          
          const IconComponent = config.icon;
          
          return (
            <button
              key={componentName}
              className="action-item-card"
              onClick={() => handleActionClick(componentName)}
            >
              <div className="action-item-icon">
                <IconComponent sx={{ fontSize: 24, color: '#666666' }} />
              </div>
              <h4 className="action-item-label">{config.label}</h4>
              <p className="action-item-description">{config.description}</p>
              <div className="action-item-plus">
                <AddOutlinedIcon sx={{ fontSize: 16, color: '#2196F3' }} />
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="action-items-footer">
        <p>
          {missingComponents.length} item{missingComponents.length > 1 ? 's' : ''} remaining to complete
        </p>
      </div>
    </div>
  );
};

export default ActionItems;