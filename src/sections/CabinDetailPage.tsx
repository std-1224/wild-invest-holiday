import React, { useState, useEffect, useRef } from "react";
import {
  cabins,
  cabinImages,
  cabinVideos,
  calculateROI,
  getExtrasForCabin,
  CabinType,
} from "../config/mockCalculate";
import apiClient from "../api/client";
import { SiteSelector } from "../components/SiteSelector";
import { HoldingDepositModal } from "../components/Modals/HoldingDepositModal";
import { useAuth } from "../contexts/AuthContext";

interface CabinDetailPageProps {
  cabinType: CabinType;
  onBack: () => void;
  onSuccess: () => void;
}

export const CabinDetailPage: React.FC<CabinDetailPageProps> = ({
  cabinType,
  onBack,
  onSuccess,
}) => {
  const { login } = useAuth();
  const cabin = cabins[cabinType];
  const images = cabinImages[cabinType];
  const video = cabinVideos[cabinType];

  // Gallery state
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Purchase flow state
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [locationSiteCounts, setLocationSiteCounts] = useState<
    Record<string, number>
  >({});

  // Combine video and images for gallery
  const allMedia = [
    { type: "video", src: video },
    ...images.map((img) => ({ type: "image", src: img })),
  ];

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await apiClient.getLocations();
        if (response.success && response.locations) {
          setLocations(response.locations);
        }
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    };
    loadLocations();
  }, []);

  // Auto-scroll to selected thumbnail in full-screen mode
  useEffect(() => {
    if (showFullScreen && thumbnailRefs.current[selectedMediaIndex]) {
      thumbnailRefs.current[selectedMediaIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedMediaIndex, showFullScreen]);

  // Calculate ROI with selected extras
  const roiResults = calculateROI(
    cabinType,
    70,
    cabin.nightlyRate,
    selectedExtras
  );

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleStartPurchase = () => {
    setShowLocationSelector(true);
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
  };

  const handleContinueToSites = () => {
    setShowLocationSelector(false);
    setShowSiteSelector(true);
  };

  const handleSiteSelect = (site: any) => {
    setSelectedSite(site);
  };

  const handleContinueToPayment = () => {
    setShowSiteSelector(false);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0e181f] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back to Cabins</span>
          </button>
          <div className="flex-1" />
          <h1 className="text-2xl font-bold text-[#0e181f]">{cabin.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Left: Media Gallery */}
        <div className="space-y-4">
          {/* Main Media Display */}
          <div
            className="relative bg-black rounded-xl overflow-hidden"
            style={{ height: "500px" }}
          >
            {allMedia[selectedMediaIndex].type === "video" ? (
              <video
                src={allMedia[selectedMediaIndex].src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={allMedia[selectedMediaIndex].src}
                alt={`${cabin.name} view ${selectedMediaIndex}`}
                className="w-full h-full object-cover"
              />
            )}

            {/* Expand button */}
            <button
              onClick={() => setShowFullScreen(true)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>

          {/* Thumbnail Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => setSelectedMediaIndex(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedMediaIndex === index
                    ? "border-[#ffcf00] scale-105"
                    : "border-gray-300 hover:border-[#86dbdf]"
                }`}
              >
                {media.type === "video" ? (
                  <div className="relative w-full h-full bg-black">
                    <video
                      src={media.src}
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <img
                    src={media.src}
                    alt={`Thumbnail ${index}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col px-1">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/90">
            <h3 className="text-white text-xl font-bold">
              {cabin.name} Gallery
            </h3>
            <button
              onClick={() => setShowFullScreen(false)}
              className="text-white hover:text-[#ffcf00] p-2"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Main Media */}
          <div className="flex-1 relative flex items-center justify-center">
            {allMedia[selectedMediaIndex].type === "video" ? (
              <video
                src={allMedia[selectedMediaIndex].src}
                autoPlay
                loop
                muted
                playsInline
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <img
                src={allMedia[selectedMediaIndex].src}
                alt={`${cabin.name} view ${selectedMediaIndex}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation Arrows */}
            <button
              onClick={() =>
                setSelectedMediaIndex((prev) =>
                  prev === 0 ? allMedia.length - 1 : prev - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setSelectedMediaIndex((prev) => (prev + 1) % allMedia.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* CTA Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/4">
              <button
                onClick={() => {
                  setShowFullScreen(false);
                  handleStartPurchase();
                }}
                className="px-4 py-1 bg-[#ffcf00] hover:bg-[#e6bb00] text-[#0e181f] font-bold text-md rounded-xl transition-all shadow-2xl"
              >
                Reserve This Cabin - $100 Deposit
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="bg-black/90 p-4 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="flex gap-2 md:justify-center min-w-max">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  ref={(el) => {
                    thumbnailRefs.current[index] = el;
                  }}
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedMediaIndex === index
                      ? "border-[#ffcf00] scale-110"
                      : "border-gray-600 hover:border-[#86dbdf]"
                  }`}
                >
                  {media.type === "video" ? (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={media.src}
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={media.src}
                      alt={`Thumbnail ${index}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Selection Modal */}
      {showLocationSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              📍 Select Your Location
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose the location where you'd like to invest in your{" "}
              {cabin.name}.
            </p>

            {/* Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {locations
                .filter((loc: any) => loc.status === "active")
                .map((location: any) => (
                  <button
                    key={location._id}
                    onClick={() => handleLocationSelect(location)}
                    className={`p-6 rounded-lg border-2 transition-all text-left hover:scale-[1.02] ${
                      selectedLocation?._id === location._id
                        ? "border-[#ec874c] bg-[#ec874c]/10"
                        : "border-gray-300 bg-white hover:border-[#86dbdf]"
                    }`}
                  >
                    <h3 className="text-xl font-bold text-[#0e181f] mb-2">
                      {location.name}
                    </h3>
                    {location.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {location.description}
                      </p>
                    )}
                  </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLocationSelector(false)}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              {selectedLocation && (
                <button
                  onClick={handleContinueToSites}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90"
                >
                  Continue to Site Selection →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Site Selection Modal */}
      {showSiteSelector && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              🗺️ Select Your Site Number
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred site number at {selectedLocation.name}.
            </p>

            <SiteSelector
              locationId={selectedLocation._id}
              cabinType={cabinType}
              onSiteSelect={handleSiteSelect}
              selectedSiteId={selectedSite?._id}
            />

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowSiteSelector(false);
                  setSelectedSite(null);
                  setShowLocationSelector(true);
                }}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                ← Back to Locations
              </button>
              {selectedSite && (
                <button
                  onClick={handleContinueToPayment}
                  className="flex-1 px-4 py-3 rounded-lg font-bold transition-all bg-[#ffcf00] text-[#0e181f] hover:opacity-90"
                >
                  Continue to Payment →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSite && selectedLocation && (
        <HoldingDepositModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedSite(null);
            setSelectedLocation(null);
          }}
          onSuccess={onSuccess}
          onLogin={login}
          cabinType={cabinType}
          location={selectedLocation.name}
          totalAmount={roiResults.totalInvestment}
          selectedExtras={selectedExtras}
          selectedSite={selectedSite}
          siteMapUrl={selectedLocation.siteMapUrl || null}
        />
      )}
    </div>
  );
};
