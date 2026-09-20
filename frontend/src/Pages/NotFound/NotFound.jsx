import  { useEffect, useState } from "react";
import "./NotFound.scss";

function NotFound() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 4000);
  }, []);

  return (
    show && (
      <div className="NotFoundCon">
        <h1>404</h1>
        <h5>Not Found</h5>
        <button onClick={() => window.location.replace("/")}>Home</button>
      </div>
    )
  );
}

export default NotFound;
