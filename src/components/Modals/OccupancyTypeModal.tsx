import { useState } from "react";
import { Home, Building2, AlertCircle, CheckCircle, X } from "lucide-react";

interface OccupancyTypeModalProps {
  currentType: "investment" | "permanent";
  cabinName: string;
  onClose: () => void;
  onSubmitRequest: (
    newType: "investment" | "permanent",
    reason: string
  ) => void;
}

export const OccupancyTypeModal = ({
  currentType,
  cabinName,
  onClose,
  onSubmitRequest,
}: OccupancyTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<"investment" | "permanent">(
    currentType
  );
  const [reason, setReason] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleContinue = () => {
    if (selectedType !== currentType) {
      setShowConfirmation(true);
    }
  };

  const handleSubmit = () => {
    onSubmitRequest(selectedType, reason);
  };

  const getTypeInfo = (type: "investment" | "permanent") => {
    if (type === "investment") {
      return {
        icon: Building2,
        title: "Investment Property",
        description:
          "Cabin is available for guest bookings to generate rental income",
        features: [
          "Earn rental income from guest bookings",
          "180-day annual owner booking allowance",
          "Professional property management",
          "Marketing and listing optimization",
          "Revenue tracking and reporting",
          "Tax benefits for investment properties",
        ],
        restrictions: [
          "Cannot use as primary residence",
          "Owner bookings limited to 180 days/year",
          "Peak periods reserved for guest bookings",
        ],
      };
    } else {
      return {
        icon: Home,
        title: "Permanent Residence",
        description:
          "Cabin is your primary residence and not available for guest bookings",
        features: [
          "Full-time occupancy allowed",
          "No booking restrictions",
          "Personal use anytime",
          "No management fees",
          "Homeowner insurance rates",
          "Residential utility rates",
        ],
        restrictions: [
          "No rental income generation",
          "Different contract terms apply",
          "May affect tax treatment",
          "Requires admin approval to switch",
        ],
      };
    }
  };

  const currentInfo = getTypeInfo(currentType);
  const newInfo = getTypeInfo(selectedType);

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#ffcf00]" />
              <h2 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
                CONFIRM OCCUPANCY CHANGE
              </h2>
            </div>
            <button
              onClick={() => setShowConfirmation(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6 p-4 bg-[#ffcf00]/[0.1] rounded-lg border-2 border-[#ffcf00]">
              <h3 className="font-bold text-[#0e181f] mb-2">
                Important Changes
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                You are requesting to change your cabin occupancy type from{" "}
                <strong>{currentInfo.title}</strong> to{" "}
                <strong>{newInfo.title}</strong>.
              </p>
              <p className="text-sm text-gray-700">
                This change requires admin approval and may affect your contract
                terms, fees, and tax treatment.
              </p>
            </div>

            {/* What Changes */}
            <div className="mb-6">
              <h4 className="font-bold text-[#0e181f] mb-3">
                What Will Change:
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Current */}
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-5 h-5 text-red-600" />
                    <h5 className="font-bold text-red-600">Losing</h5>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {currentInfo.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>

                {/* New */}
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h5 className="font-bold text-green-600">Gaining</h5>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {newInfo.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* New Restrictions */}
            <div className="mb-6 p-4 bg-[#86dbdf]/[0.1] rounded-lg border border-[#86dbdf]">
              <h4 className="font-bold text-[#0e181f] mb-2">
                New Restrictions:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {newInfo.restrictions.map((restriction, index) => (
                  <li key={index}>• {restriction}</li>
                ))}
              </ul>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-[#0e181f]">
                Reason for Change (Required)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Please explain why you want to change your occupancy type..."
                className="w-full p-3 border-2 border-[#86dbdf] rounded-lg focus:outline-none focus:border-[#ffcf00] resize-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                This information will be reviewed by our admin team
              </p>
            </div>

            {/* Admin Approval Notice */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-600 mb-1">
                    Admin Approval Required
                  </h4>
                  <p className="text-sm text-gray-700">
                    Your request will be submitted to our admin team for review.
                    You will receive an email notification once your request has
                    been processed. This typically takes 2-3 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="flex-1 px-6 py-3 bg-[#ffcf00] text-[#0e181f] rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
              CHANGE OCCUPANCY TYPE
            </h2>
            <p className="text-sm text-gray-600 mt-1">{cabinName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Select your desired occupancy type. Changes require admin approval
            and may affect your contract terms.
          </p>

          {/* Type Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Investment Property */}
            <div
              onClick={() => setSelectedType("investment")}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === "investment"
                  ? "border-[#ffcf00] bg-[#ffcf00]/[0.1]"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Building2
                  className={`w-8 h-8 ${
                    selectedType === "investment"
                      ? "text-[#ffcf00]"
                      : "text-gray-600"
                  }`}
                />
                <div>
                  <h3 className="text-xl font-bold text-[#0e181f]">
                    Investment Property
                  </h3>
                  {currentType === "investment" && (
                    <span className="text-xs text-[#86dbdf] font-semibold">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                {getTypeInfo("investment").description}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[#0e181f]">Features:</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {getTypeInfo("investment").features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Permanent Residence */}
            <div
              onClick={() => setSelectedType("permanent")}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === "permanent"
                  ? "border-[#ffcf00] bg-[#ffcf00]/[0.1]"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Home
                  className={`w-8 h-8 ${
                    selectedType === "permanent"
                      ? "text-[#ffcf00]"
                      : "text-gray-600"
                  }`}
                />
                <div>
                  <h3 className="text-xl font-bold text-[#0e181f]">
                    Permanent Residence
                  </h3>
                  {currentType === "permanent" && (
                    <span className="text-xs text-[#86dbdf] font-semibold">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                {getTypeInfo("permanent").description}
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[#0e181f]">Features:</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {getTypeInfo("permanent").features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={selectedType === currentType}
            className="flex-1 px-6 py-3 bg-[#ffcf00] text-[#0e181f] rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
