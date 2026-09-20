import loader from "./image/loader2.gif";
import "./Loader.scss";

function Loader() {
  return (
    <div className="loader">
      <img alt="loader-gif" className="loader-gif" src={loader} />
    </div>
  );
}
export default Loader;
