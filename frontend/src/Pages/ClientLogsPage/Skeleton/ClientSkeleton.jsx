
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "./ClientSkeleton.scss";

function ClientSkeleton() {
  return (
    <div className="profile_skeleton_client">
    <SkeletonTheme baseColor="#C6C6C6" highlightColor="#ADADAD">
      <Skeleton count={1} className="pr3"/>
    </SkeletonTheme>
      <Skeleton count={11} className="pr1" />
      <SkeletonTheme baseColor="#C6C6C6" highlightColor="#ADADAD">
        <Skeleton count={1} className="pr2"/>
      </SkeletonTheme>
    </div>
  );
}

export default ClientSkeleton;
