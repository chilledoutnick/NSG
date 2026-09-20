import ClickAwayListener from "@mui/material/ClickAwayListener";
import "./BlurPopup.scss";

function BlurPopup({ children, onClose, ComponentClass }) {
  return (
    <div className={"blurpopup_con " + (ComponentClass ? ComponentClass : "")}>
      <ClickAwayListener onClickAway={onClose}>{children}</ClickAwayListener>
    </div>
  );
}

export default BlurPopup;
