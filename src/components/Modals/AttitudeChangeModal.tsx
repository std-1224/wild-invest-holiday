interface AttitudeChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingAttitude: "retain" | "payout" | null;
}

export const AttitudeChangeModal = ({
  isOpen,
  onClose,
  onConfirm,
  pendingAttitude,
}: AttitudeChangeModalProps) => {
  if (!isOpen) return null;

  const newAttitude =
    pendingAttitude === "retain"
      ? "Retain Money to Reinvest"
      : "Payout Monthly";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative z-[10000]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0e181f] hover:text-[#86dbdf] text-2xl font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 italic font-[family-name:var(--font-eurostile,'Eurostile_Condensed','Arial_Black',Impact,sans-serif)] text-[#0e181f]">
          Confirm Investment Attitude Change
        </h2>

        <p className="mb-4 text-[#0e181f] font-medium">
          You're about to change your investment attitude to:{" "}
          <strong>{newAttitude}</strong>
        </p>

        <div className="p-4 rounded-lg mb-6 bg-[#86dbdf]/[0.2] border-2 border-[#86dbdf]">
          <p className="text-sm text-[#0e181f]">
            <strong>Please note:</strong> Changing this decision is OK, but any
            payments will fall on the following month, not now.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
            }}
            className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#ffcf00] text-[#0e181f] border-2 border-[#ffcf00] cursor-pointer"
          >
            Confirm Change
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 bg-[#0e181f] text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

