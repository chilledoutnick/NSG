import  { useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "./ProfileSkeleton.scss";

function ProfileSkeleton() {
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 576 ? true : false;

  return (
    <div className="profile_skeleton">
      <div className="profile_left">
        <Skeleton count={1} className="pl1" />
        <Skeleton count={1} className="pl2" />
      </div>
      <div className="profile_right">
        <Skeleton count={2} className="pr1" />
        <Skeleton count={1} className="pr2" />
        <Skeleton count={isMobile ? 1 : 2} className="pr3" />
        <Skeleton count={1} className="pr4" />
        <Skeleton count={1} className="pr3" />
        <Skeleton count={1} className="pr3" />
      </div>
    </div>
  );
}

export default ProfileSkeleton;
