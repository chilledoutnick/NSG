import { useNotificationStore } from "../../store/notificationStore";

const Notification = () => {
  const { setNotificationId } = useNotificationStore();
  let user_info = JSON.parse(localStorage.getItem("user_info"))
 
  return (
    <div>
      <button onClick={() => setNotificationId(1, user_info.user_id)}>showNotification</button>
    </div>
  );
};

export default Notification;
