import {
  isMobile,
  isTablet,
  isDesktop,
  isIOS,
  isAndroid,
} from "react-device-detect";

function DeviceDetection() {
  return (
    <div>
      <p>Mobile: {isMobile ? "Yes" : "No"}</p>
      <p>Tablet: {isTablet ? "Yes" : "No"}</p>
      <p>Desktop: {isDesktop ? "Yes" : "No"}</p>
      <p>iOS: {isIOS ? "Yes" : "No"}</p>
      <p>Android: {isAndroid ? "Yes" : "No"}</p>
    </div>
  );
}

export default DeviceDetection;
