import "./VideoSection.scss";
function VideoSection(props) {
  return (
    <div className="card_conversion2">
      <div className="card_conversion_wrapper">
        <div className="card_conversion_top">
          <video
            className="smart_card_video"
            muted
            loop
            autoPlay
            playsInline
            controls={true}
          >
            <source src="/video/SmartCard.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="card_conversion_bottom">
          <div className="card_conversion_top_text">
            <h5>
              {props.title ? (
                props.title
              ) : (
                <>
                  {" "}
                  Unlock{" "}
                  <span>
                    Efficiency & <br />
                  </span>
                  <span>Productivity</span>
                </>
              )}
            </h5>
            <p>
              {props.desc ? (
                props.desc
              ) : (
                <>
                  NSG brings together everything you need for networking
                  leads. Connecting, managing, and nurturing contacts. This
                  all-in-one solution boosts your efficiency by:
                </>
              )}
            </p>
            <ul>
              <li>Generating 4X more leads</li>
              <li>
                Save 1-3 hours per month by eliminating manual data entry,
                ensuring cost-effectiveness.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoSection;
