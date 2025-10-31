// Cabin Card Component
export const CabinCard = ({ cabin, onInvest }: any) => (
  <div className="cabin-card">
    <img src={cabin.image} alt={cabin.name} className="cabin-image" />
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
