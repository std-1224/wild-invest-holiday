import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

interface SiteLocationDisplayProps {
  investment: any;
}

export const SiteLocationDisplay: React.FC<SiteLocationDisplayProps> = ({
  investment,
}) => {
  const [siteDetails, setSiteDetails] = useState<any>(null);
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadSiteAndLocation();
  }, [investment]);

  const loadSiteAndLocation = async () => {
    // If investment has siteNumber but no siteId, it's mock data - skip API calls
    if (investment.siteNumber && !investment.siteId) {
      setLoading(false);
      return;
    }

    // If no siteId at all, skip API calls
    if (!investment.siteId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First, get all locations to find the one matching the investment
      const locationsResponse = await apiClient.getLocations();
      if (locationsResponse.success && locationsResponse.locations) {
        const location = locationsResponse.locations.find(
          (loc: any) => loc.name.toLowerCase().includes(investment.location.toLowerCase())
        );

        if (location) {
          setLocationDetails(location);

          // If the investment has a siteId, fetch the site details
          if (investment.siteId) {
            const sitesResponse = await apiClient.getSites(location._id);
            if (sitesResponse.success && sitesResponse.sites) {
              const site = sitesResponse.sites.find((s: any) => s._id === investment.siteId);
              if (site) {
                setSiteDetails(site);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load site and location details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 text-center">Loading site information...</p>
      </div>
    );
  }

  // If no site details available and no mock data, show a placeholder
  if (!siteDetails && !locationDetails?.siteMapUrl && !investment.siteNumber) {
    return null;
  }

  // Create mock site details if we have siteNumber but no siteId (for admin mock data)
  const displaySiteDetails = siteDetails || (investment.siteNumber ? {
    siteNumber: investment.siteNumber,
    cabinType: investment.cabinType,
    siteLeaseFee: investment.siteLeaseFee || 14000,
    status: "sold",
  } : null);

  return (
    <div className="bg-gradient-to-r from-[#86dbdf]/10 to-[#ec874c]/10 rounded-lg p-4 mb-4 border-2 border-[#86dbdf]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-[#0e181f]">
          📍 Your Cabin Location
        </h4>
        {locationDetails?.siteMapUrl && (
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-sm font-semibold text-[#86dbdf] hover:underline"
          >
            {showMap ? "Hide Map" : "View Site Map"}
          </button>
        )}
      </div>

      {displaySiteDetails ? (
        <div className="bg-white rounded-lg p-4 mb-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Site Number</p>
              <p className="text-2xl font-bold text-[#ec874c]">
                #{displaySiteDetails.siteNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Cabin Type</p>
              <p className="text-lg font-bold text-[#0e181f]">
                {displaySiteDetails.cabinType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Annual Site Lease</p>
              <p className="text-lg font-bold text-[#0e181f]">
                ${displaySiteDetails.siteLeaseFee?.toLocaleString() || "14,000"}/year
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                {displaySiteDetails.status === "sold" ? "Owned" : displaySiteDetails.status}
              </span>
            </div>
          </div>

          {displaySiteDetails.features && displaySiteDetails.features.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Site Features</p>
              <div className="flex flex-wrap gap-2">
                {displaySiteDetails.features.map((feature: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#ffcf00]/20 text-[#0e181f] rounded text-xs font-semibold"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 mb-3">
          <p className="text-sm text-gray-600">
            Site assignment pending. Your specific site number will be assigned soon.
          </p>
        </div>
      )}

      {/* Site Map Display */}
      {showMap && locationDetails?.siteMapUrl && (
        <div className="bg-white rounded-lg p-4 border-2 border-[#ec874c]">
          <div className="mb-2 flex items-center justify-between">
            <h5 className="font-bold text-[#0e181f]">
              {locationDetails.name} Site Map
            </h5>
            <a
              href={locationDetails.siteMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#86dbdf] hover:underline"
            >
              Open Full Size
            </a>
          </div>
          <div className="relative">
            <img
              src={locationDetails.siteMapUrl}
              alt="Site Map"
              className="w-full rounded-lg"
            />
            {siteDetails && (
              <div className="absolute top-2 right-2 bg-[#ec874c] text-white px-3 py-2 rounded-lg shadow-lg">
                <p className="text-xs font-semibold">Your Site</p>
                <p className="text-lg font-bold">#{siteDetails.siteNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

