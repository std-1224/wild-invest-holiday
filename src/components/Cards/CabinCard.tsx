// Cabin Card Component
import { CabinVideo } from "../CabinVideo";
export const CabinCard = ({ cabin, onInvest }: any) => (
  <div className="cabin-card">
    <CabinVideo cabin={cabin} />
    <div className="cabin-content">
      <h3 className="cabin-title">{cabin.name.toUpperCase()}</h3>
      <div className="cabin-price">
        ${cabin.price.toLocaleString("en-AU")} plus GST
      </div>
      <button
        onClick={() => onInvest && onInvest(cabin)}
        className="btn btn-primary"
        style={{ width: "100%", fontSize: "0.9rem" }}
      >
        Reserve Yours Today
      </button>
    </div>
  </div>
);
