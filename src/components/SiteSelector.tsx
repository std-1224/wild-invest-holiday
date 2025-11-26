import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

interface Site {
  _id: string;
  siteNumber: string;
  cabinType: string;
  price: number;
  siteLeaseFee: number;
  status: string;
  locationId: string;
}

interface Location {
  _id: string;
  name: string;
  siteMapUrl?: string;
}

interface SiteSelectorProps {
  locationId: string;
  cabinType: string;
  onSiteSelect: (site: Site) => void;
  selectedSiteId?: string;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  locationId,
  cabinType,
  onSiteSelect,
  selectedSiteId,
}) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSites();
    loadLocation();
  }, [locationId, cabinType]);

  const loadSites = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.getAvailableSites(locationId, cabinType);
      if (response.success) {
        setSites(response.sites || []);
      } else {
        setError("Failed to load available sites");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load sites");
    } finally {
      setLoading(false);
    }
  };

  const loadLocation = async () => {
    try {
      const response = await apiClient.getLocations();
      if (response.success) {
        const loc = response.locations.find((l: Location) => l._id === locationId);
        if (loc) {
          setLocation(loc);
        }
      }
    } catch (err: any) {
      console.error("Failed to load location:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading available sites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          No available {cabinType} sites at this location. Please contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#0e181f]">
          Available Sites
        </h3>
        {location?.siteMapUrl && (
          <a
            href={location.siteMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#86dbdf] hover:underline font-semibold"
          >
            📄 View Site Map
          </a>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Choose your preferred site number. Each site has a specific location within the park.
        {location?.siteMapUrl && " View the site map to see the layout."}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
        {sites.map((site) => (
          <button
            key={site._id}
            onClick={() => onSiteSelect(site)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedSiteId === site._id
                ? "border-[#ec874c] bg-[#ec874c] text-white"
                : "border-gray-300 bg-white text-[#0e181f] hover:border-[#86dbdf]"
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold mb-1">#{site.siteNumber}</p>
              <p className="text-xs opacity-80">{site.cabinType}</p>
              <p className="text-xs mt-2 font-semibold">
                ${site.siteLeaseFee?.toLocaleString()}/yr
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-[#f5f5f5] rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> The site lease fee shown is the annual cost to lease the land where your cabin will be located.
          This is separate from the cabin purchase price.
        </p>
      </div>
    </div>
  );
};

