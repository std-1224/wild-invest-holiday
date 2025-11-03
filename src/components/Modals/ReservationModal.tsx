import React, { useState } from "react";
import { colors } from "../../config/mockCalculate";

type ReservationExtras = Record<string, boolean>;

interface ReservationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  cabinType: string;
  location: string;
  specialRequests: string;
}

interface AccountData {
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface ReservationModalProps {
  setShowReservationModal: (value: boolean) => void;
  showReservationModal: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

// Reservation Modal with Account Creation
export const ReservationModal: React.FC<ReservationModalProps> = ({
  setShowReservationModal,
  showReservationModal,
  setIsLoggedIn,
}) => {
  const [reservationData, setReservationData] = useState<ReservationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    cabinType: "",
    location: "",
    specialRequests: "",
  });
  const [step, setStep] = useState<number>(1); // 1: Reservation, 2: Account Creation, 3: Confirmation
  const [accountData, setAccountData] = useState<AccountData>({
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [reservationExtras, setReservationExtras] = useState<ReservationExtras>({});

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); // Move to account creation step
  };

  const handleAccountCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      accountData.password === accountData.confirmPassword &&
      accountData.agreeToTerms
    ) {
      // Create account and complete reservation
      setIsLoggedIn(true);
      setStep(3);

      // Simulate account creation
      console.log("Account created for:", reservationData.email);
      console.log("Reservation details:", reservationData);
    }
  };

  const handleCompleteReservation = () => {
    setShowReservationModal(false);
    setStep(1);
    setReservationData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      guests: 1,
      cabinType: "",
      location: "",
      specialRequests: "",
    });
  };

  if (!showReservationModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <h2
              className="text-2xl font-bold mb-6 text-center italic"
              style={{
                fontFamily:
                  '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                fontWeight: "900",
                fontStyle: "italic",
                color: colors.darkBlue,
              }}
            >
              Book Your Stay
            </h2>
            <form onSubmit={handleReservationSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={reservationData.firstName}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={reservationData.lastName}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={reservationData.email}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={reservationData.phone}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={reservationData.checkIn}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        checkIn: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={reservationData.checkOut}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        checkOut: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Number of Guests
                  </label>
                  <select
                    value={reservationData.guests}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        guests: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Cabin Type
                  </label>
                  <select
                    value={reservationData.cabinType}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        cabinType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  >
                    <option value="">Select Cabin</option>
                    <option value="1BR">1 Bedroom Cabin</option>
                    <option value="2BR">2 Bedroom Cabin</option>
                    <option value="3BR">3 Bedroom Cabin</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.darkBlue }}
                  >
                    Location
                  </label>
                  <select
                    value={reservationData.location}
                    onChange={(e) =>
                      setReservationData({
                        ...reservationData,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    required
                  >
                    <option value="">Select Location</option>
                    <option value="Mansfield">Mansfield</option>
                    <option value="Byron Bay">Byron Bay</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.darkBlue }}
                >
                  Special Requests
                </label>
                <textarea
                  value={reservationData.specialRequests}
                  onChange={(e) =>
                    setReservationData({
                      ...reservationData,
                      specialRequests: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  rows={3}
                  placeholder="Any special requests or requirements..."
                />
              </div>

              {/* Extras Selection */}
              <div className="mb-6">
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: colors.darkBlue }}
                >
                  Add Extras to Your Stay
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: "breakfast",
                      name: "Continental Breakfast",
                      description: "Daily breakfast for your stay",
                      price: 25,
                      unit: "per day",
                    },
                    {
                      id: "cleaning",
                      name: "Premium Cleaning Service",
                      description: "Daily housekeeping service",
                      price: 50,
                      unit: "per day",
                    },
                    {
                      id: "activities",
                      name: "Activity Package",
                      description: "Guided tours and outdoor activities",
                      price: 75,
                      unit: "per person",
                    },
                    {
                      id: "transport",
                      name: "Airport Transfer",
                      description: "Round-trip airport transportation",
                      price: 120,
                      unit: "per trip",
                    },
                  ].map((extra) => (
                    <label
                      key={extra.id}
                      className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border-2"
                      style={{
                        backgroundColor: reservationExtras[extra.id]
                          ? `${colors.yellow}20`
                          : "white",
                        borderColor: reservationExtras[extra.id]
                          ? colors.yellow
                          : colors.aqua,
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={reservationExtras[extra.id] || false}
                          onChange={() =>
                            setReservationExtras((prev) => ({
                              ...prev,
                              [extra.id]: !prev[extra.id as keyof ReservationExtras],
                            }))
                          }
                          className="w-5 h-5"
                          style={{ accentColor: colors.yellow }}
                        />
                        <div>
                          <p
                            className="font-bold"
                            style={{ color: colors.darkBlue }}
                          >
                            {extra.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {extra.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold text-lg"
                          style={{ color: colors.yellow }}
                        >
                          ${extra.price}
                        </p>
                        <p className="text-xs text-gray-500">{extra.unit}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reservation Summary */}
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: `${colors.aqua}20`,
                  border: `2px solid ${colors.aqua}`,
                }}
              >
                <h3
                  className="font-bold mb-2"
                  style={{ color: colors.darkBlue }}
                >
                  Reservation Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cabin Type:</span>
                    <span className="font-bold">
                      {reservationData.cabinType || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-bold">
                      {reservationData.location || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                      <span className="font-bold">{reservationData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nights:</span>
                    <span className="font-bold">
                      {reservationData.checkIn && reservationData.checkOut
                        ? Math.ceil(
                            (new Date(reservationData.checkOut).getTime() -
                              new Date(reservationData.checkIn).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : "Select dates"}
                    </span>
                  </div>
                  {Object.keys(reservationExtras).some(
                    (key) => reservationExtras[key]
                  ) && (
                    <div className="border-t pt-2">
                      <p
                        className="font-bold mb-1"
                        style={{ color: colors.darkBlue }}
                      >
                        Selected Extras:
                      </p>
                      {Object.entries(reservationExtras).map(
                        ([key, selected]) => {
                          if (!selected) return null;
                          const extra = [
                            {
                              id: "breakfast",
                              name: "Continental Breakfast",
                              price: 25,
                            },
                            {
                              id: "cleaning",
                              name: "Premium Cleaning Service",
                              price: 50,
                            },
                            {
                              id: "activities",
                              name: "Activity Package",
                              price: 75,
                            },
                            {
                              id: "transport",
                              name: "Airport Transfer",
                              price: 120,
                            },
                          ].find((e) => e.id === key);
                          return extra ? (
                            <div
                              key={key}
                              className="flex justify-between text-xs"
                            >
                              <span>{extra.name}</span>
                              <span style={{ color: colors.yellow }}>
                                ${extra.price}
                              </span>
                            </div>
                          ) : null;
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: colors.yellow,
                    color: colors.darkBlue,
                  }}
                >
                  Continue to Account Creation
                </button>
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: colors.darkBlue,
                    color: colors.white,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2
              className="text-2xl font-bold mb-6 text-center italic"
              style={{
                fontFamily:
                  '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                fontWeight: "900",
                fontStyle: "italic",
                color: colors.darkBlue,
              }}
            >
              Create Your Account
            </h2>
            <p className="text-center mb-6" style={{ color: colors.darkBlue }}>
              To complete your reservation, please create an account with us.
            </p>
            <form onSubmit={handleAccountCreation}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.darkBlue }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={accountData.password}
                  onChange={(e) =>
                    setAccountData({ ...accountData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.darkBlue }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={(e) =>
                    setAccountData({
                      ...accountData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accountData.agreeToTerms}
                    onChange={(e) =>
                      setAccountData({
                        ...accountData,
                        agreeToTerms: e.target.checked,
                      })
                    }
                    className="mr-2"
                    required
                  />
                  <span className="text-sm" style={{ color: colors.darkBlue }}>
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: colors.yellow,
                    color: colors.darkBlue,
                  }}
                >
                  Create Account & Complete Reservation
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: colors.darkBlue,
                    color: colors.white,
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center">
              <h2
                className="text-2xl font-bold mb-6 italic"
                style={{
                  fontFamily:
                    '"Eurostile Condensed", "Arial Black", Impact, sans-serif',
                  fontWeight: "900",
                  fontStyle: "italic",
                  color: colors.darkBlue,
                }}
              >
                Reservation Confirmed!
              </h2>
              <div
                className="mb-6 p-4 rounded-lg"
                style={{ backgroundColor: colors.aqua + "20" }}
              >
                <p
                  className="text-lg font-bold mb-2"
                  style={{ color: colors.darkBlue }}
                >
                  {reservationData.firstName} {reservationData.lastName}
                </p>
                <p className="text-sm" style={{ color: colors.darkBlue }}>
                  {reservationData.cabinType} Cabin at{" "}
                  {reservationData.location}
                </p>
                <p className="text-sm" style={{ color: colors.darkBlue }}>
                  {reservationData.checkIn} to {reservationData.checkOut}
                </p>
                <p className="text-sm" style={{ color: colors.darkBlue }}>
                  {reservationData.guests}{" "}
                  {reservationData.guests === 1 ? "Guest" : "Guests"}
                </p>
              </div>
              <p className="mb-6" style={{ color: colors.darkBlue }}>
                Your account has been created and your reservation is confirmed.
                You'll receive a confirmation email shortly.
              </p>
              <button
                onClick={handleCompleteReservation}
                className="px-8 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                style={{
                  backgroundColor: colors.yellow,
                  color: colors.darkBlue,
                }}
              >
                Continue to My Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
