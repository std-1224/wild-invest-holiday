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

interface AdminPortalProps {
  setIsLoggedIn: (value: boolean) => void;
  onNavigate: (page: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [ownerAgreements, setOwnerAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Xero connection state
  const [xeroConnected, setXeroConnected] = useState(false);
  const [xeroError, setXeroError] = useState("");

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [agreementType, setAgreementType] = useState("sale_agreement");
  const [cabinId, setCabinId] = useState("");

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

  // Load agreements when owner is selected
  useEffect(() => {
    if (selectedOwner) {
      loadOwnerAgreements(selectedOwner.id);
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
          <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
            Xero Integration
          </h2>

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Owner List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#0e181f]">
              All Owners ({owners.length})
            </h2>
            
            {loading && !selectedOwner && (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading owners...</p>
              </div>
            )}

            {!loading && owners.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No owners found</p>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {owners.map((owner) => (
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
      </div>
    </div>
  );
};

