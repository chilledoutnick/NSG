import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./CheckoutSkeleton.scss";

function CheckoutSkeleton() {
  return (
    <div className="checkout-skeleton">
      <SkeletonTheme baseColor="#eeeeee" highlightColor="#f7f7f7">
        {/* logo */}
        <div className="logo">
          <Skeleton circle height={60} width={60} />
                      {/* <Skeleton height={20} width={160} style={{ margin: "20px auto 18px" }} /> */}
        </div>

        {/* plan summary - DOM placed here so it appears above payment on mobile */}
        <div className="plan-box">
          <Skeleton height={120} borderRadius={12} />
        </div>

        {/* payment area (title, gpay, card form, CTA) */}
        <div className="payment-wrapper">
          <div className="payment-title">
            <Skeleton height={20} width={160} style={{ margin: "0 auto 18px" }} />
          </div>

          <div className="gpay-skeleton">
            <Skeleton height={44} borderRadius={8} />
          </div>

          <div className="card-box">
            <Skeleton height={200} borderRadius={8} />
          </div>

          <div className="cta-skeleton">
            <Skeleton height={48} width={220} borderRadius={8} style={{ margin: "20px auto" }} />
          </div>
        </div>
      </SkeletonTheme>
    </div>
  );
}

export default CheckoutSkeleton;
