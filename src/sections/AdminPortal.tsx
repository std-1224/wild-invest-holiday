import React, { useState, useEffect } from "react";
import { XeroConnect } from "../components/XeroConnect";
import apiClient from "../api/client";

interface Owner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  referralCode?: string;
  createdAt: string;
}

interface Agreement {
  id: string;
  owner_id: string;
  agreement_type: string;
  agreement_url: string;
  cabin_id?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Cabin {
  _id: string;
  cabinType: string;
  purchasePrice: number;
  purchaseDate: string;
  status: string;
  purchasedExtras: string[];
  locationId: {
    name: string;
    slug: string;
  };
  siteId: {
    siteNumber: string;
  };
}

interface AdminPortalProps {
  setIsLoggedIn: (value: boolean) => void;
  onNavigate: (page: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"owners" | "locations">("owners");

  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [ownerAgreements, setOwnerAgreements] = useState<Agreement[]>([]);
  const [ownerCabins, setOwnerCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Owner[]>([]);
  const [searching, setSearching] = useState(false);

  // Xero connection state
  const [xeroConnected, setXeroConnected] = useState(false);
  const [xeroError, setXeroError] = useState("");

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [agreementType, setAgreementType] = useState("sale_agreement");
  const [cabinId, setCabinId] = useState("");

  // Location management state
  const [locations, setLocations] = useState<any[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: "",
    description: "",
    address: "",
    totalSites: 0,
    cabinTypeDistribution: {
      "1BR": 50,
      "2BR": 50,
    },
  });

  // Check Xero connection status
  const checkXeroStatus = async () => {
    try {
      const response = await apiClient.getXeroStatus();
      if (response.success && response.connected) {
        setXeroConnected(true);

        // Check if token needs refresh
        if (response.needsRefresh) {
          setXeroError('Xero token has expired or is invalid. Please reconnect your Xero account.');
        } else {
          setXeroError("");
        }
      } else {
        setXeroConnected(false);
        setXeroError("");
      }
    } catch (error: any) {
      console.error("Error checking Xero status:", error);
      setXeroConnected(false);
      if (error.message && (
        error.message.includes('Failed to refresh Xero token') ||
        error.message.includes('refresh') ||
        error.message.includes('token')
      )) {
        setXeroError('Xero token has expired or is invalid. Please reconnect your Xero account.');
      }
    }
  };

  // Validate Xero connection by making an actual API call
  // This triggers the automatic token refresh in the backend
  const validateXeroConnection = async () => {
    try {
      console.log('🔄 Validating Xero connection (triggers token refresh if needed)...');

      // Call the dedicated validation endpoint
      const response = await apiClient.validateXeroConnection();

      if (response.success && response.validated) {
        console.log('✅ Xero connection validated successfully');
        console.log(`🏢 Tenant: ${response.tenantName}`);
        if (response.tokenExpiresAt) {
          console.log(`⏰ Token expires: ${new Date(response.tokenExpiresAt).toLocaleString()}`);
        }
        setXeroError("");
      } else if (response.requiresReconnect) {
        console.error('❌ Xero connection requires reconnection');
        setXeroError('Xero token has expired or is invalid. Please reconnect your Xero account.');
      } else {
        console.warn('⚠️ Xero validation returned unexpected result:', response);
      }
    } catch (error: any) {
      console.error('❌ Xero connection validation failed:', error);

      // Only show error if it's a real token issue
      if (error.message && (
        error.message.includes('Failed to refresh Xero token') ||
        error.message.includes('Token decryption failed') ||
        error.message.includes('Please reconnect') ||
        error.message.includes('requiresReconnect')
      )) {
        setXeroError('Xero token has expired or is invalid. Please reconnect your Xero account.');
      }
    }
  };

  // Load all owners on mount
  useEffect(() => {
    loadOwners();
    checkXeroStatus();

    // Listen for Xero connection changes
    const handleXeroConnectionChange = () => {
      checkXeroStatus();
    };

    window.addEventListener('xeroConnectionChanged', handleXeroConnectionChange);
    window.addEventListener('focus', handleXeroConnectionChange);

    return () => {
      window.removeEventListener('xeroConnectionChanged', handleXeroConnectionChange);
      window.removeEventListener('focus', handleXeroConnectionChange);
    };
  }, []);

  // Periodically validate Xero connection to trigger automatic token refresh
  useEffect(() => {
    // Initial validation after checking status
    const initialValidation = setTimeout(() => {
      if (xeroConnected) {
        validateXeroConnection();
      }
    }, 2000); // Wait 2 seconds after mount

    // Validate every 5 minutes to trigger token refresh
    const intervalId = setInterval(() => {
      if (xeroConnected) {
        console.log('🔄 Periodic Xero validation (5-minute interval)...');
        validateXeroConnection();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialValidation);
      clearInterval(intervalId);
    };
  }, [xeroConnected]);

  // Load agreements and cabins when owner is selected
  useEffect(() => {
    if (selectedOwner) {
      loadOwnerAgreements(selectedOwner.id);
      loadOwnerCabins(selectedOwner.id);
    }
  }, [selectedOwner]);

  const loadOwners = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.getAllOwners();
      if (response.success) {
        setOwners(response.owners || []);
      } else {
        setError((response as any).error || "Failed to load owners");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

  const loadOwnerAgreements = async (ownerId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.getAgreementsByOwner(ownerId);
      if (response.success) {
        setOwnerAgreements(response.agreements || []);
      } else {
        setError((response as any).error || "Failed to load agreements");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load agreements");
    } finally {
      setLoading(false);
    }
  };

  const loadOwnerCabins = async (ownerId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.getOwnerCabins(ownerId);
      if (response.success) {
        setOwnerCabins(response.cabins || []);
      } else {
        setError((response as any).error || "Failed to load cabins");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load cabins");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await apiClient.searchOwners(query);
      if (response.success) {
        setSearchResults(response.owners || []);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAgreement = async () => {
    if (!selectedOwner) {
      setError("Please select an owner first");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Upload file to S3
      const uploadResponse = await apiClient.uploadAgreementFile(selectedFile);

      if (!uploadResponse.success) {
        throw new Error((uploadResponse as any).error || "Failed to upload file");
      }

      // Step 2: Create agreement record
      const agreementData = {
        owner_id: selectedOwner.id,
        agreement_type: agreementType,
        agreement_url: uploadResponse.url,
        cabin_id: cabinId || null,
        file_name: uploadResponse.fileName,
        file_size: uploadResponse.fileSize,
        file_type: uploadResponse.fileType,
      };

      const createResponse = await apiClient.createAgreement(agreementData);

      if (createResponse.success) {
        setSuccess("Agreement uploaded successfully!");
        setSelectedFile(null);
        setCabinId("");
        setAgreementType("sale_agreement");
        
        // Reload agreements
        loadOwnerAgreements(selectedOwner.id);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error((createResponse as any).error || "Failed to create agreement");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload agreement");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const formatAgreementType = (type: string) => {
    const types: { [key: string]: string } = {
      sale_agreement: "Sale Agreement",
      land_lease: "Land Lease Agreement",
      site_management: "Site Management Agreement",
      other: "Other",
    };
    return types[type] || type;
  };

  // Location management functions
  const loadLocations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.getLocations();
      if (response.success) {
        setLocations(response.locations || []);
      } else {
        setError((response as any).error || "Failed to load locations");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!locationForm.name || !locationForm.totalSites) {
      setError("Please fill in location name and total sites");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.createLocation(locationForm);
      if (response.success) {
        setSuccess("Location created successfully!");
        setShowLocationForm(false);
        setLocationForm({
          name: "",
          description: "",
          address: "",
          totalSites: 0,
          cabinTypeDistribution: {
            "1BR": 50,
            "2BR": 50,
          },
        });
        loadLocations();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError((response as any).error || "Failed to create location");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  // Load locations when switching to locations tab
  useEffect(() => {
    if (activeTab === "locations") {
      loadLocations();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen pb-8 w-full max-w-full overflow-x-hidden bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 pt-24">
          <h1 className="text-4xl md:text-6xl font-black mb-4 italic text-[#0e181f] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
            Admin Portal
          </h1>
          <p className="text-lg text-gray-600">
            Manage owners and upload legal agreements
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Xero Connect Section */}
        <div className="mb-8">
          {/* Show Xero error if exists */}
          {xeroError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Xero Connection Issue
                  </p>
                  <p className="text-sm text-red-700">
                    {xeroError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show connection status */}
          {!xeroConnected && !xeroError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    Xero Not Connected
                  </p>
                  <p className="text-sm text-yellow-700">
                    Please connect your Xero account to manage invoices and payments.
                  </p>
                </div>
              </div>
            </div>
          )}

          <XeroConnect hasError={!!xeroError} />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-4 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab("owners")}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === "owners"
                  ? "border-b-4 border-[#ffcf00] text-[#0e181f]"
                  : "text-gray-500 hover:text-[#0e181f]"
              }`}
            >
              Owner Management
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === "locations"
                  ? "border-b-4 border-[#ffcf00] text-[#0e181f]"
                  : "text-gray-500 hover:text-[#0e181f]"
              }`}
            >
              Location Management
            </button>
          </div>
        </div>

        {/* Owner Management Tab */}
        {activeTab === "owners" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Owner List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              All Owners ({owners.length})
            </h2>

            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search owners by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:border-[#86dbdf] focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#86dbdf]"></div>
                  </div>
                )}
              </div>
            </div>

            {loading && !selectedOwner && (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading owners...</p>
              </div>
            )}

            {!loading && owners.length === 0 && searchQuery.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No owners found</p>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {(searchQuery.length >= 2 ? searchResults : owners).map((owner) => (
                <div
                  key={owner.id}
                  onClick={() => setSelectedOwner(owner)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOwner?.id === owner.id
                      ? "border-[#86dbdf] bg-[#86dbdf]/10"
                      : "border-gray-200 hover:border-[#86dbdf]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0e181f]">{owner.name}</h3>
                      <p className="text-sm text-gray-600">{owner.email}</p>
                      {owner.phone && (
                        <p className="text-sm text-gray-600">{owner.phone}</p>
                      )}
                      {owner.referralCode && (
                        <p className="text-xs text-[#ec874c] font-semibold mt-1">
                          Referral: {owner.referralCode}
                        </p>
                      )}
                    </div>
                    {selectedOwner?.id === owner.id && (
                      <div className="ml-2">
                        <svg
                          className="w-6 h-6 text-[#86dbdf]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Upload & Agreements */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
                Upload Agreement
              </h2>

              {!selectedOwner ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    ← Select an owner to upload agreements
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#86dbdf]/10 border border-[#86dbdf] rounded-lg p-4">
                    <p className="text-sm font-semibold text-[#0e181f]">
                      Selected Owner:
                    </p>
                    <p className="text-lg font-bold text-[#86dbdf]">
                      {selectedOwner.name}
                    </p>
                    <p className="text-sm text-gray-600">{selectedOwner.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0e181f]">
                      Agreement Type
                    </label>
                    <select
                      value={agreementType}
                      onChange={(e) => setAgreementType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#86dbdf]"
                    >
                      <option value="sale_agreement">Sale Agreement</option>
                      <option value="land_lease">Land Lease Agreement</option>
                      <option value="site_management">
                        Site Management Agreement
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0e181f]">
                      Cabin ID (Optional)
                    </label>
                    <select
                      value={cabinId}
                      onChange={(e) => setCabinId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#86dbdf] bg-white"
                    >
                      <option value="">Select Cabin Type</option>
                      <option value="1BR">1BR</option>
                      <option value="2BR">2BR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#0e181f]">
                      Select File
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#86dbdf]"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {selectedFile.name} (
                        {formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleUploadAgreement}
                    disabled={uploading || !selectedFile}
                    className="w-full px-6 py-3 rounded-lg font-bold transition-all bg-[#86dbdf] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "Upload Agreement"}
                  </button>
                </div>
              )}
            </div>

            {/* Cabins List */}
            {selectedOwner && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
                  Owned Cabins ({ownerCabins.length})
                </h2>

                {loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading cabins...</p>
                  </div>
                )}

                {!loading && ownerCabins.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No cabins found for this owner</p>
                  </div>
                )}

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {ownerCabins.map((cabin) => (
                    <div
                      key={cabin._id}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#86dbdf] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-[#0e181f] text-lg">
                              {cabin.cabinType} Cabin
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              cabin.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : cabin.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {cabin.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Location:</span> {cabin.locationId?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Site:</span> {cabin.siteId?.siteNumber || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Purchase Price:</span> ${cabin.purchasePrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Purchase Date:</span>{' '}
                            {new Date(cabin.purchaseDate).toLocaleDateString()}
                          </p>
                          {cabin.purchasedExtras && cabin.purchasedExtras.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-[#ec874c] mb-1">
                                Extras:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {cabin.purchasedExtras.map((extra, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-[#ffcda3] text-[#0e181f] rounded text-xs"
                                  >
                                    {extra}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agreements List */}
            {selectedOwner && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
                  Agreements ({ownerAgreements.length})
                </h2>

                {loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading agreements...</p>
                  </div>
                )}

                {!loading && ownerAgreements.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No agreements found</p>
                  </div>
                )}

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {ownerAgreements.map((agreement) => (
                    <div
                      key={agreement.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-[#86dbdf] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#0e181f]">
                            {formatAgreementType(agreement.agreement_type)}
                          </h3>
                          {agreement.cabin_id && (
                            <p className="text-sm text-gray-600">
                              Cabin: {agreement.cabin_id}
                            </p>
                          )}
                          {agreement.file_name && (
                            <p className="text-sm text-gray-600">
                              {agreement.file_name} (
                              {formatFileSize(agreement.file_size)})
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded:{" "}
                            {new Date(agreement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={agreement.agreement_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-3 py-1 bg-[#86dbdf] text-white rounded-lg text-sm font-semibold hover:opacity-90"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Location Management Tab */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            {/* Create Location Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowLocationForm(!showLocationForm)}
                className="px-6 py-3 bg-[#ffcf00] text-[#0e181f] rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                {showLocationForm ? "Cancel" : "Create New Location"}
              </button>
            </div>

            {/* Create Location Form */}
            {showLocationForm && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
                  Create New Location
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={locationForm.name}
                      onChange={(e) =>
                        setLocationForm({ ...locationForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                      placeholder="e.g., Mansfield"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                      Description
                    </label>
                    <textarea
                      value={locationForm.description}
                      onChange={(e) =>
                        setLocationForm({ ...locationForm, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                      rows={3}
                      placeholder="Brief description of the location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                      Address
                    </label>
                    <input
                      type="text"
                      value={locationForm.address}
                      onChange={(e) =>
                        setLocationForm({ ...locationForm, address: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                      Total Sites *
                    </label>
                    <input
                      type="number"
                      value={locationForm.totalSites}
                      onChange={(e) =>
                        setLocationForm({
                          ...locationForm,
                          totalSites: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                      placeholder="e.g., 286"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#0e181f]">
                      Cabin Type Distribution
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          1BR Cabins (%)
                        </label>
                        <input
                          type="number"
                          value={locationForm.cabinTypeDistribution["1BR"]}
                          onChange={(e) =>
                            setLocationForm({
                              ...locationForm,
                              cabinTypeDistribution: {
                                ...locationForm.cabinTypeDistribution,
                                "1BR": parseInt(e.target.value) || 0,
                                "2BR": 100 - (parseInt(e.target.value) || 0),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          2BR Cabins (%)
                        </label>
                        <input
                          type="number"
                          value={locationForm.cabinTypeDistribution["2BR"]}
                          onChange={(e) =>
                            setLocationForm({
                              ...locationForm,
                              cabinTypeDistribution: {
                                ...locationForm.cabinTypeDistribution,
                                "2BR": parseInt(e.target.value) || 0,
                                "1BR": 100 - (parseInt(e.target.value) || 0),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86dbdf]"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {locationForm.cabinTypeDistribution["1BR"] + locationForm.cabinTypeDistribution["2BR"]}%
                    </p>
                  </div>

                  <button
                    onClick={handleCreateLocation}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-[#ec874c] text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Location"}
                  </button>
                </div>
              </div>
            )}

            {/* Locations List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
                All Locations ({locations.length})
              </h2>

              {loading && (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading locations...</p>
                </div>
              )}

              {!loading && locations.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No locations found</p>
                </div>
              )}

              <div className="space-y-4">
                {locations.map((location) => (
                  <div
                    key={location._id}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#86dbdf] transition-all"
                  >
                    <h3 className="font-bold text-[#0e181f] text-lg mb-2">
                      {location.name}
                    </h3>
                    {location.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {location.description}
                      </p>
                    )}
                    {location.address && (
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {typeof location.address === 'string'
                          ? location.address
                          : [
                              location.address.street,
                              location.address.city,
                              location.address.state,
                              location.address.postcode,
                              location.address.country
                            ].filter(Boolean).join(', ')
                        }
                      </p>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">
                        <span className="font-semibold">Total Sites:</span> {location.totalSites}
                      </span>
                      <span className="text-gray-600">
                        <span className="font-semibold">Available:</span> {location.availableSites}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        location.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {location.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

