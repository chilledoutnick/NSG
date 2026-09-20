import Skeleton from "react-loading-skeleton";

function AdminSkeleton() {
  return (
    <div className="admin_skeleton">
      <div className="admin_skeleton_left">
        <Skeleton count={3} className="pl1" />
      </div>
      <div className="admin_skeleton_left">
        <Skeleton count={3} className="pl1" />
      </div>
      <div className="admin_skeleton_left">
        <Skeleton count={3} className="pl1" />
      </div>
    </div>
  );
}

export default AdminSkeleton;
