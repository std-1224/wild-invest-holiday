import React, { useState, useEffect } from 'react';
import { Menu, X, Calculator } from 'lucide-react';
import apiClient from './api/client';

const WildThingsWebsite = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatSent, setChatSent] = useState(false);
  const [roiInputs, setRoiInputs] = useState({
    cabinType: '1BR',
    occupancyRate: 66,
    nightlyRate: 160
  });
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false);
  const [existingAccountEmail, setExistingAccountEmail] = useState('');
  const [showAnimatedLogo, setShowAnimatedLogo] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, totalEarned: 0 });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [investmentAttitude, setInvestmentAttitude] = useState('Retain Money to Reinvest');
  const [userInvestments, setUserInvestments] = useState([
    {
      id: 1,
      cabinType: '2BR',
      location: 'Mansfield',
      purchaseDate: '2024-01-15',
      purchasePrice: 125000,
      currentValue: 135000,
      totalIncome: 8500,
      monthlyIncome: 850,
      averagePerNight: 285,
      status: 'Active',
      nextPayment: '2024-11-15',
      occupancyRate: 72,
      nightsBooked: 21,
      roi: 6.80,
      bookedDates: [
        '2024-11-15', '2024-11-16', '2024-11-22', '2024-11-23', '2024-11-24',
        '2024-12-20', '2024-12-21', '2024-12-22', '2024-12-23', '2024-12-24',
        '2024-12-25', '2024-12-26', '2024-12-27', '2024-12-28', '2024-12-29'
      ]
    },
    {
      id: 2,
      cabinType: '1BR',
      location: 'Mansfield',
      purchaseDate: '2024-03-20',
      purchasePrice: 100000,
      currentValue: 108000,
      totalIncome: 6200,
      monthlyIncome: 620,
      averagePerNight: 240,
      status: 'Active',
      nextPayment: '2024-11-20',
      occupancyRate: 65,
      nightsBooked: 19,
      roi: 6.20,
      bookedDates: [
        '2024-11-10', '2024-11-11', '2024-11-17', '2024-11-18',
        '2024-12-14', '2024-12-15', '2024-12-16', '2024-12-30', '2024-12-31'
      ]
    }
  ]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedCabinForInvestment, setSelectedCabinForInvestment] = useState(null);
  const [showExistingOwnerModal, setShowExistingOwnerModal] = useState(false);
  const [showFloatingInvestmentPanel, setShowFloatingInvestmentPanel] = useState(false);
  const [showAttitudeChangeModal, setShowAttitudeChangeModal] = useState(false);
  const [pendingAttitudeChange, setPendingAttitudeChange] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedInvestmentForBoost, setSelectedInvestmentForBoost] = useState(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true }
  ]);
  const [floatingInvestmentData, setFloatingInvestmentData] = useState({
    selectedCabin: null,
    selectedLocation: 'mansfield',
    selectedExtras: [],
    paymentMethod: 'external' // 'account' or 'external'
  });
  const [existingOwnerData, setExistingOwnerData] = useState({
    useAccountFunds: false,
    accountBalance: 0,
    selectedPaymentMethod: 'account' // 'account' or 'external'
  });
  const [contractData, setContractData] = useState({
    clientName: '',
    clientEmail: '',
    cabinType: '',
    location: '',
    purchasePrice: 0,
    depositAmount: 0,
    contractStatus: 'Draft'
  });
  const [reservationData, setReservationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    cabinType: '',
    location: '',
    specialRequests: ''
  });
  const [reservationExtras, setReservationExtras] = useState({});
  const [hoveredExperience, setHoveredExperience] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [contracts, setContracts] = useState([
    {
      id: 1,
      clientName: 'John Smith',
      clientEmail: 'john@example.com',
      cabinType: '2BR',
      location: 'Mansfield',
      purchasePrice: 125000,
      depositAmount: 37500,
      contractStatus: 'Signed',
      signedDate: '2024-01-15',
      invoiceNumber: 'INV-2024-001',
      paymentStatus: 'Paid',
      contracts: [
        { type: 'Sale Agreement', status: 'Signed', signedDate: '2024-01-15' },
        { type: 'Land Lease Agreement', status: 'Signed', signedDate: '2024-01-15' },
        { type: 'Site Management Agreement', status: 'Signed', signedDate: '2024-01-15' }
      ]
    },
    {
      id: 2,
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@example.com',
      cabinType: '1BR',
      location: 'Mansfield',
      purchasePrice: 100000,
      depositAmount: 30000,
      contractStatus: 'Pending Signature',
      signedDate: null,
      invoiceNumber: 'INV-2024-002',
      paymentStatus: 'Pending',
      contracts: [
        { type: 'Sale Agreement', status: 'Pending Signature', signedDate: null },
        { type: 'Land Lease Agreement', status: 'Pending Signature', signedDate: null },
        { type: 'Site Management Agreement', status: 'Pending Signature', signedDate: null }
      ]
    }
  ]);

  const colors = {
    yellow: '#FFCF00',
    darkBlue: '#0E181F',
    aqua: '#86DBDF',
    orange: '#EC874C',
    peach: '#FFCDA3',
    white: '#FFFFFF',
    lightGray: '#F5F5F5'
  };

  const defaultNightlyRates = {
    '1BR': 160,
    '2BR': 200,
    '3BR': 250
  };

  // Available extras for purchase
  // Extras with cabin-specific pricing for solar
  const getExtrasForCabin = (cabinType) => {
    const solarPrice = cabinType === '1BR' ? 20000 : cabinType === '2BR' ? 30000 : 40000;
    return [
      { 
        id: 'furniture', 
        name: 'Premium Furniture Package', 
        price: 12000,
        nightlyImpact: 25,
        impactDescription: '+$25/night - Premium appeal increases rates',
        annualCostSavings: 0
      },
      { 
        id: 'appliances', 
        name: 'High-End Appliances', 
        price: 5000,
        nightlyImpact: 15,
        impactDescription: '+$15/night - Luxury amenities attract premium guests',
        annualCostSavings: 0
      },
      { 
        id: 'solar', 
        name: 'Off Grid Solar & Battery Package', 
        price: solarPrice,
        nightlyImpact: 0, // Solar doesn't increase nightly rate
        impactDescription: 'No impact on nightly rate - Eliminates $20/night energy costs',
        annualCostSavings: 0 // Will be calculated based on occupancy
      },
      { 
        id: 'insurance', 
        name: 'Insurance Package', 
        price: 1200,
        nightlyImpact: 0,
        impactDescription: 'No impact on nightly rate',
        annualCostSavings: 0
      },
      { 
        id: 'maintenance', 
        name: 'Annual Maintenance Package', 
        price: 800,
        nightlyImpact: 0,
        impactDescription: 'No impact on nightly rate',
        annualCostSavings: 0
      },
      { 
        id: 'decor', 
        name: 'Professional Interior Decor', 
        price: 2500,
        nightlyImpact: 12,
        impactDescription: '+$12/night - Enhanced aesthetics increase appeal',
        annualCostSavings: 0
      },
      { 
        id: 'outdoor', 
        name: 'Outdoor Furniture Set', 
        price: 2000,
        nightlyImpact: 8,
        impactDescription: '+$8/night - Outdoor luxury adds value',
        annualCostSavings: 0
      },
      { 
        id: 'entertainment', 
        name: 'Entertainment System', 
        price: 1500,
        nightlyImpact: 10,
        impactDescription: '+$10/night - Premium entertainment increases rates',
        annualCostSavings: 0
      },
      { 
        id: 'linen', 
        name: 'Premium Linen Package', 
        price: 800,
        nightlyImpact: 5,
        impactDescription: '+$5/night - Luxury comfort attracts guests',
        annualCostSavings: 0
      },
      { 
        id: 'bbq', 
        name: 'BBQ & Outdoor Kitchen', 
        price: 1200,
        nightlyImpact: 8,
        impactDescription: '+$8/night - Outdoor cooking adds appeal',
        annualCostSavings: 0
      },
      { 
        id: 'firepit', 
        name: 'Fire Pit & Seating Area', 
        price: 900,
        nightlyImpact: 6,
        impactDescription: '+$6/night - Cozy atmosphere increases bookings',
        annualCostSavings: 0
      }
    ];
  };
  
  const extras = getExtrasForCabin('3BR'); // Default for ROI calculator

  const handleCabinTypeChange = (newCabinType) => {
    setRoiInputs({
      ...roiInputs,
      cabinType: newCabinType,
      nightlyRate: defaultNightlyRates[newCabinType]
    });
    setSelectedExtras([]); // Clear selected extras when changing cabin type
  };

  const cabins = {
    '1BR': {
      name: '1 Bedroom Cabin',
      price: 110000,
      siteFee: 100,
      bedrooms: 1,
      image: '/1BR.jpg',
      rentOffPeak: 150,
      rentPeak: 400
    },
    '2BR': {
      name: '2 Bedroom Cabin',
      price: 170000,
      siteFee: 130,
      bedrooms: 2,
      image: '/2BR.jpg',
      rentOffPeak: 200,
      rentPeak: 500
    },
    '3BR': {
      name: '3 Bedroom Cabin',
      price: 250000,
      siteFee: 150,
      bedrooms: 3,
      image: '/3BR.jpg',
      rentOffPeak: 300,
      rentPeak: 700
    }
  };

  // Calculate dynamic nightly rate based on selected extras
  const calculateDynamicNightlyRate = (selectedExtras, cabinType) => {
    const baseRate = defaultNightlyRates[cabinType];
    const extras = getExtrasForCabin(cabinType);
    
    const totalImpact = extras.reduce((total, extra) => {
      return total + (selectedExtras.includes(extra.id) ? extra.nightlyImpact : 0);
    }, 0);
    
    return Math.max(baseRate + totalImpact, 50); // Minimum $50/night
  };

  const calculateROI = (cabinType, occupancyRate, nightlyRate, selectedExtras = []) => {
    const cabin = cabins[cabinType];
    const daysPerYear = 365;
    const occupiedDays = (occupancyRate / 100) * daysPerYear;
    
    // Calculate dynamic nightly rate based on selected extras
    const dynamicNightlyRate = calculateDynamicNightlyRate(selectedExtras, cabinType);
    
    // Calculate total investment including extras
    const extras = getExtrasForCabin(cabinType);
    const extrasCost = extras.reduce((total, extra) => {
      return total + (selectedExtras.includes(extra.id) ? extra.price : 0);
    }, 0);
    const totalInvestment = cabin.price + extrasCost;
    
    // Calculate gross revenue with dynamic pricing
    const grossRevenue = occupiedDays * dynamicNightlyRate;
    const managementFee = grossRevenue * 0.20;
    const siteFeeAnnual = cabin.siteFee * 52;
    
    // Calculate energy costs (realistic assumption: $15-25 per occupied night)
    const energyCostPerNight = 20; // $20/night average energy cost
    const totalEnergyCosts = occupiedDays * energyCostPerNight;
    
    // Calculate annual cost savings from extras (mainly solar)
    let annualCostSavings = extras.reduce((total, extra) => {
      return total + (selectedExtras.includes(extra.id) ? extra.annualCostSavings : 0);
    }, 0);
    
    // Add solar savings if selected (eliminates energy costs)
    if (selectedExtras.includes('solar')) {
      annualCostSavings += totalEnergyCosts; // Solar eliminates all energy costs
    }
    
    // Net income includes cost savings and deducts energy costs
    const netIncome = grossRevenue - managementFee - siteFeeAnnual - totalEnergyCosts + annualCostSavings;
    const roi = (netIncome / totalInvestment) * 100;
    
    return {
      grossRevenue,
      managementFee,
      siteFeeAnnual,
      totalEnergyCosts,
      annualCostSavings,
      netIncome,
      roi,
      dynamicNightlyRate,
      baseNightlyRate: nightlyRate,
      totalInvestment,
      extrasCost
    };
  };

  const roiResults = calculateROI(roiInputs.cabinType, roiInputs.occupancyRate, roiInputs.nightlyRate, selectedExtras);

  // Calculate ROI impact for individual extras
  const calculateExtraROI = (extraId, cabinType) => {
    const baseROI = calculateROI(cabinType, roiInputs.occupancyRate, roiInputs.nightlyRate, []);
    const withExtraROI = calculateROI(cabinType, roiInputs.occupancyRate, roiInputs.nightlyRate, [extraId]);
    
    return {
      baseROI: baseROI.roi,
      withExtraROI: withExtraROI.roi,
      roiImpact: withExtraROI.roi - baseROI.roi,
      extra: getExtrasForCabin(cabinType).find(e => e.id === extraId)
    };
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send to your backend/email service
    // For now, we'll create a mailto link
    const subject = encodeURIComponent(`Wild Things Inquiry from ${chatName}`);
    const body = encodeURIComponent(`Name: ${chatName}\nEmail: ${chatEmail}\n\nMessage:\n${chatMessage}`);
    window.location.href = `mailto:james.s@wildthings.com.au?subject=${subject}&body=${body}`;
    setChatSent(true);
    setTimeout(() => {
      setChatOpen(false);
      setChatSent(false);
      setChatMessage('');
      setChatName('');
      setChatEmail('');
    }, 2000);
  };

  const ChatWidget = () => (
    <>
      {/* Chat Button */}
      {!chatOpen && (
        <button
          id="chat-widget"
          onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: colors.yellow,
            border: `3px solid ${colors.darkBlue}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '350px',
          maxWidth: 'calc(100vw - 48px)',
          backgroundColor: colors.white,
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 1000,
          overflow: 'hidden',
          border: `3px solid ${colors.yellow}`
        }}>
          {/* Chat Header */}
          <div style={{
            backgroundColor: colors.darkBlue,
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: colors.yellow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                👋
              </div>
              <div>
                <div style={{color: colors.white, fontWeight: 'bold'}}>James</div>
                <div style={{color: colors.aqua, fontSize: '12px'}}>Wild Things Team</div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{
                color: colors.white,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '0',
                width: '30px',
                height: '30px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div style={{padding: '16px', maxHeight: '400px', overflowY: 'auto'}}>
            {!chatSent ? (
              <>
                <div style={{
                  backgroundColor: `${colors.aqua}33`,
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <p style={{margin: 0, fontSize: '14px', color: colors.darkBlue}}>
                    Hi! I'm James. How can I help you today? Feel free to ask about cabin investments or holiday stays!
                  </p>
                </div>

                <form onSubmit={handleChatSubmit} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    required
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: `2px solid ${colors.aqua}`,
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={chatEmail}
                    onChange={(e) => setChatEmail(e.target.value)}
                    required
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: `2px solid ${colors.aqua}`,
                      fontSize: '14px'
                    }}
                  />
                  <textarea
                    placeholder="Your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    required
                    rows={4}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: `2px solid ${colors.aqua}`,
                      fontSize: '14px',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: colors.yellow,
                      color: colors.darkBlue,
                      padding: '12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </>
            ) : (
              <div style={{
                backgroundColor: `${colors.yellow}33`,
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{fontSize: '48px', marginBottom: '12px'}}>✅</div>
                <p style={{margin: 0, fontWeight: 'bold', color: colors.darkBlue}}>
                  Message sent! I'll get back to you soon.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const NavBar = () => (
    <div className="fixed top-0 w-full z-50" style={{backgroundColor: 'rgba(134, 219, 223, 0.9)', padding: '15px 0', borderBottom: '4px solid #FFCF00'}}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div onClick={() => setCurrentPage('home')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
            <img 
              src="/logo-wildthings.svg" 
              alt="Wild Things" 
              style={{height: '90px'}}
            />
          </div>
          
          {/* Desktop links */}
          <div className="hidden lg:flex" style={{flexWrap: 'wrap', alignItems: 'center', gap: '20px'}}>
            <button 
              onClick={() => setCurrentPage('home')} 
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: currentPage === 'home' ? 'underline' : 'none',
                textDecorationColor: '#FFCF00',
                textDecorationThickness: '3px'
              }}
            >
              HOME
            </button>
            <button 
              onClick={() => setCurrentPage('holiday-homes')} 
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: currentPage === 'holiday-homes' ? 'underline' : 'none',
                textDecorationColor: '#FFCF00',
                textDecorationThickness: '3px'
              }}
            >
              INVEST
            </button>
            <button 
              onClick={() => setCurrentPage('locations')} 
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: currentPage === 'locations' ? 'underline' : 'none',
                textDecorationColor: '#FFCF00',
                textDecorationThickness: '3px'
              }}
            >
              LOCATIONS
            </button>
            <a 
              href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#FFCF00', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: 'none',
                textShadow: '2px 2px 0px #0E181F',
                padding: '0',
                margin: '0'
              }}
            >
              BOOK A STAY
            </a>
            <a 
              href="https://wildthings.myshopify.com" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: 'none',
                padding: '0',
                margin: '0'
              }}
            >
              MERCH
            </a>
            {isLoggedIn ? (
              <button 
                onClick={() => setCurrentPage('investor-portal')}
                style={{
                  color: '#0E181F', 
                  fontSize: '18px', 
                  fontWeight: '900', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  fontStyle: 'italic',
                  textDecoration: currentPage === 'investor-portal' ? 'underline' : 'none',
                  textDecorationColor: '#FFCF00',
                  textDecorationThickness: '3px',
                  padding: '0',
                  margin: '0'
                }}
              >
                MY ACCOUNT
              </button>
            ) : null}
          </div>

          {/* Investor Login Tab - Top Right */}
          {!isLoggedIn && (
            <button 
              onClick={() => setShowLoginModal(true)}
              style={{
                position: 'fixed',
                top: '0',
                right: '20px',
                padding: '8px 16px',
                backgroundColor: colors.orange,
                color: colors.white,
                border: 'none',
                borderRadius: '0 0 8px 8px',
                cursor: 'pointer',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.darkBlue;
                e.target.style.transform = 'translateY(2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.orange;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Investor Login
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#0E181F',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden" style={{backgroundColor: 'rgba(134, 219, 223, 0.9)', borderTop: '3px solid #FFCF00'}}>
          <div className="px-4 py-3" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <button 
              onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} 
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: currentPage === 'home' ? 'underline' : 'none',
                textDecorationColor: '#FFCF00',
                textDecorationThickness: '3px'
              }}
            >
              HOME
            </button>
            <button 
              onClick={() => { setCurrentPage('holiday-homes'); setMobileMenuOpen(false); }} 
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: currentPage === 'holiday-homes' ? 'underline' : 'none',
                textDecorationColor: '#FFCF00',
                textDecorationThickness: '3px'
              }}
            >
              INVEST
            </button>
            <button 
              onClick={() => { setCurrentPage('locations'); setMobileMenuOpen(false); }} 
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                textDecoration: currentPage === 'locations' ? 'underline' : 'none',
                textDecorationColor: '#FFCF00',
                textDecorationThickness: '3px'
              }}
            >
              LOCATIONS
            </button>
            <a 
              href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#FFCF00', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                textDecoration: 'none',
                textShadow: '2px 2px 0px #0E181F',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                fontStyle: 'italic'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              BOOK A STAY
            </a>
            <a 
              href="https://wildthings.myshopify.com" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#0E181F', 
                fontSize: '18px', 
                fontWeight: '900', 
                backgroundColor: 'transparent',
                border: 'none',
                textDecoration: 'none',
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              MERCH
            </a>
            {isLoggedIn && (
              <button 
                onClick={() => { setCurrentPage('investor-portal'); setMobileMenuOpen(false); }}
                style={{
                  color: '#0E181F', 
                  fontSize: '18px', 
                  fontWeight: '900', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  textDecoration: currentPage === 'investor-portal' ? 'underline' : 'none',
                  textDecorationColor: '#FFCF00',
                  textDecorationThickness: '3px'
                }}
              >
                MY ACCOUNT
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const HomePage = () => (
    <div className="pt-32 w-full max-w-full overflow-x-hidden">
      <div
        className="relative overflow-hidden min-h-[calc(100vh-8rem)] w-full max-w-full"
        style={{ minHeight: 'calc(100svh - 8rem)' }}
      >
        <div className="absolute inset-0" style={{backgroundColor: colors.darkBlue}}>
          <video 
            src="/hero-video.mp4"
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{backgroundColor: 'rgba(14, 24, 31, 0.3)'}}></div>
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8" style={{minHeight: '100vh'}}>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 italic leading-tight" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic', 
            letterSpacing: '-0.02em',
            color: colors.yellow,
            textShadow: `2px 2px 0 ${colors.darkBlue}`,
            maxWidth: '95vw'
          }}>
            RECONNECT WITH THE WILD
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl font-medium px-2" style={{color: colors.white}}>
            Disconnect from the world, get into nature
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-lg px-4 sm:px-0">
            <a 
              href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-lg text-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
            >
              Book Your Next Holiday
            </a>
            <button 
              onClick={() => setCurrentPage('holiday-homes')}
              className="px-8 py-4 rounded-lg text-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.orange, color: colors.white}}
            >
              Invest in Holiday Homes
            </button>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.lightGray}}>
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center italic px-2" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            WILD ADVENTURES
          </h2>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-full overflow-x-hidden">
            <p className="text-xl mb-6 text-center" style={{color: colors.darkBlue}}>Check out our latest adventures on TikTok!</p>
            
            {/* TikTok Video Carousel */}
            <div className="relative mb-6 -mx-4 md:mx-0">
              <div className="overflow-x-auto pb-4 px-4" style={{scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch'}}>
                <div className="flex gap-3 md:gap-4" style={{minWidth: 'min-content'}}>
                  {/* TikTok Video Embeds - Replace these URLs with your actual TikTok video IDs */}
                  {[
                    '7234567890123456789', // Replace with actual video IDs
                    '7234567890123456790',
                    '7234567890123456791',
                    '7234567890123456792'
                  ].map((videoId, index) => (
                    <div key={index} className="flex-shrink-0" style={{width: 'min(325px, 85vw)'}}>
                      <blockquote 
                        className="tiktok-embed" 
                        cite={`https://www.tiktok.com/@wildthingsaustralia/video/${videoId}`}
                        data-video-id={videoId}
                        style={{maxWidth: '100%', minWidth: '280px'}}
                      >
                        <section>
                          <a 
                            target="_blank" 
                            rel="noopener noreferrer"
                            href={`https://www.tiktok.com/@wildthingsaustralia/video/${videoId}`}
                          >
                            Wild Adventure #{index + 1}
                          </a>
                        </section>
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scroll hint */}
              <p className="text-sm text-center text-gray-500 mb-4">
                ← Scroll to see more adventures →
              </p>
            </div>

            <div className="text-center">
              <a 
                href="https://www.tiktok.com/@wildthingsaustralia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.darkBlue, color: colors.white}}
            >
                Follow @wildthingsaustralia on TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="py-12 sm:py-16 md:py-20 px-4 w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.darkBlue}}>
        <div className="max-w-4xl mx-auto text-center w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 italic px-2" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.yellow
          }}>
            OUR MISSION
          </h2>
          <div className="space-y-4 sm:space-y-6 px-2" style={{color: colors.white, fontSize: '1rem', lineHeight: '1.8'}}>
            <p className="text-base sm:text-lg md:text-xl" style={{fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: '500'}}>
              We are on a mission to create havens where everyone can come to disconnect from the world, from technology, and reconnect with family and nature.
            </p>
          </div>
        </div>
      </div>

      {/* Google Reviews Section */}
      <div className="py-12 sm:py-16 px-4 w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.white}}>
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center italic px-2" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            WHAT OUR GUESTS SAY
          </h2>
          <p className="text-center text-gray-700 mb-6 sm:mb-8 px-2">
            Reviews from Mansfield Lakeside Ski Village
          </p>
          
          {/* Google Reviews Embed */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '1.5rem'}}>
              <div style={{fontSize: '48px'}}>⭐⭐⭐⭐⭐</div>
              <div>
                <div style={{fontSize: '32px', fontWeight: 'bold', color: colors.darkBlue}}>4.8/5</div>
                <div style={{fontSize: '14px', color: '#666'}}>Based on Google Reviews</div>
              </div>
            </div>

            {/* Review Cards Carousel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {[
                {
                  name: "Sarah M.",
                  rating: 5,
                  date: "2 weeks ago",
                  text: "Amazing place for families! The kids loved the playground and pool. Our cabin was spotless and had everything we needed. Can't wait to come back in winter for the skiing!"
                },
                {
                  name: "David R.",
                  rating: 5,
                  date: "1 month ago",
                  text: "Perfect location for exploring Mt Buller and Mansfield. The staff were incredibly helpful and the facilities were top-notch. Highly recommend for anyone looking for a relaxing getaway."
                },
                {
                  name: "Emma L.",
                  rating: 5,
                  date: "3 weeks ago",
                  text: "We had the most wonderful stay! The cabins are modern and comfortable, and the lake activities were fantastic. Already planning our next trip here!"
                }
              ].map((review, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: colors.lightGray,
                    border: `2px solid ${colors.aqua}`
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <div>
                      <div style={{fontWeight: 'bold', color: colors.darkBlue}}>{review.name}</div>
                      <div style={{fontSize: '12px', color: '#666'}}>{review.date}</div>
                    </div>
                    <div style={{color: colors.yellow, fontSize: '18px'}}>
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  <p style={{color: colors.darkBlue, lineHeight: '1.6', fontSize: '14px'}}>
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a 
                href="https://www.google.com/search?q=Mansfield+Lakeside+Ski+Village"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
              >
                Read All Reviews on Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HolidayHomesPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
      setOpenFaq(openFaq === index ? null : index);
    };

    const investmentSteps = [
      { title: 'Reservation', subtitle: 'Week 0', icon: '💳', timeline: 'Start' },
      { title: 'Sign Purchase Agreement', subtitle: 'Week 1', icon: '📝', timeline: '1 week' },
      { title: 'Pay Deposit', subtitle: '30%', icon: '💰', timeline: '2 weeks' },
      { title: 'Build Complete', subtitle: '30% - 8 weeks', icon: '🏗️', timeline: '10 weeks' },
      { title: 'Inspect Cabin', subtitle: 'Week 11', icon: '🔍', timeline: '11 weeks' },
      { title: 'Hand Over Keys', subtitle: '50% - Week 12', icon: '🗝️', timeline: '12 weeks' }
    ];

    const faqs = [
      {
        question: "Can I claim depreciation if I don't own the land?",
        answer: "Absolutely. Because you own the entire cabin structure and its internal fittings, you're entitled to claim full depreciation—just like any other income-producing property. Capital Works (Division 43): Up to 2.5% per year of the build cost for 40 years. Plant & Equipment (Division 40): Accelerated deductions on appliances, air-conditioning, furniture and fixtures. Wild Things provides an itemised depreciation schedule with every sale so investors can maximise their allowable deductions from day one."
      },
      {
        question: "Can I deduct the annual site lease payments?",
        answer: "Yes — the site lease or ground rent is a fully deductible operating expense because it's paid solely for the purpose of earning rental income. Unlike a traditional property, you don't tie up capital in the land, yet still receive a steady income stream and tax-deductible rent payments."
      },
      {
        question: "Are management, cleaning and booking fees deductible?",
        answer: "Yes. All ongoing costs—management fees, cleaning, repairs, marketing, utilities, insurance and online booking commissions—are 100% deductible. Wild Things handles these services under a transparent management agreement, meaning investors enjoy hands-off returns with strong tax efficiency."
      },
      {
        question: "Can I claim interest if I finance my cabin purchase?",
        answer: "Yes. Any interest or bank charges on finance used to acquire or improve your cabin are deductible, provided the cabin is used to generate income. Many Wild Things investors use this to create negatively geared benefits in the early years while building long-term capital value."
      },
      {
        question: "How does GST apply?",
        answer: "On purchase: GST applies to new cabins, but registered investors can claim back input tax credits, reducing the effective purchase price. On income: If your total turnover exceeds $75,000 p.a., you register for GST, charge it on nightly stays, and claim GST on your expenses. Wild Things can assist your accountant in setting up a simple structure that ensures all GST benefits are captured correctly."
      },
      {
        question: "Can I offset losses against my other income (negative gearing)?",
        answer: "Yes. If interest, rent, depreciation and other deductible costs exceed your rental income, the net loss can offset your other taxable income. This makes the early investment years especially attractive from a cash-flow and tax-minimisation perspective."
      },
      {
        question: "Can I buy a Wild Things cabin through my Self-Managed Super Fund (SMSF)?",
        answer: "Yes — many investors do. An SMSF can purchase a cabin at market value from Wild Things provided: It's held purely as an investment, not used personally. It meets the sole-purpose test of generating retirement benefits. Because cabins are operated as short-term accommodation within a commercial business, they may qualify as business real property, making SMSF ownership entirely compliant when structured correctly. Our team can connect you with SMSF-specialist accountants familiar with the Wild Things model."
      },
      {
        question: "Does the land lease itself increase in value?",
        answer: "While you don't own the underlying land, the leasehold rights and cabin value can appreciate over time due to: Upgrades in park infrastructure and amenities, Rising nightly tariffs and occupancy rates, and Limited supply of quality cabin sites in prime holiday destinations. As the park brand and demand grow, your cabin's resale and income potential both rise, delivering the benefits of appreciation without landholding costs."
      },
      {
        question: "Can I sell or transfer my cabin later on?",
        answer: "Yes — you're free to on-sell your cabin at any time. The new buyer simply takes over the remaining lease term (subject to standard park approval). Wild Things cabins are designed as liquid assets: they can be sold privately, via agents, or directly through the Wild Things resale program, often achieving premiums in high-occupancy parks. A modest transfer fee may apply, disclosed upfront."
      },
      {
        question: "Is the eventual sale subject to Capital Gains Tax (CGT)?",
        answer: "Yes. As with any investment, CGT applies on sale, but you can claim the 50% CGT discount after 12 months (for individuals or trusts). Because purchase costs, depreciation and selling expenses can be included in the cost base, many investors find their effective tax rate on gains is very low."
      },
      {
        question: "Can I use the cabin personally?",
        answer: "Yes — occasional personal stays are allowed under most management agreements. You simply apportion deductions for the rental and private-use periods. This gives you the rare combination of a profitable investment that can also deliver lifestyle value when desired."
      },
      {
        question: "Can I claim travel expenses to inspect or maintain my cabin?",
        answer: "If your cabin is part of a commercial short-stay operation (as with Wild Things' managed parks), reasonable travel to inspect or manage the investment may be deductible, subject to ATO guidelines. This can include mileage or accommodation for periodic visits."
      },
      {
        question: "What happens if the park relocates, upgrades or renews sites?",
        answer: "Your investment remains protected. Wild Things cabins are relocatable assets, meaning they can be repositioned or upgraded as the park evolves. Any new capital works or improvements become additional depreciable items, enhancing future deductions and value."
      },
      {
        question: "What ownership structures work best for investors?",
        answer: "Personal ownership: Simple, full access to CGT discount. Company or trust: Income splitting and asset-protection advantages. SMSF: 15% tax in accumulation phase, 0% in pension phase. Wild Things can coordinate with your accountant to select the structure that delivers the best after-tax outcome."
      },
      {
        question: "Does the remaining lease term affect resale value?",
        answer: "Yes—but in a positive, predictable way. Cabins with long remaining leases (10–25 years) and strong park branding command the highest resale prices. Wild Things offers long initial lease terms with renewal options, preserving value and investor confidence well into the future."
      }
    ];

    return (
      <div className="pt-20 min-h-screen w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.lightGray}}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            INVEST IN A HOLIDAY HOME
          </h1>
          <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl mx-auto">
            Invest in your own piece of paradise. Earn passive income while providing families with unforgettable outdoor experiences.
          </p>

          {/* Investment Timeline */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center italic" style={{
              fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
              color: colors.darkBlue
            }}>
              YOUR INVESTMENT JOURNEY
            </h2>
            <div className="hidden md:flex" style={{justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'}}>
              {investmentSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="timeline-step" style={{flex: '1 1 120px', minWidth: '120px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: colors.yellow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      margin: '0 auto 8px',
                      border: `3px solid ${colors.darkBlue}`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255, 207, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}>
                      {step.icon}
                    </div>
                    <h3 className="font-bold mb-1 text-sm" style={{
                      color: colors.darkBlue, 
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>{step.title}</h3>
                    <p className="text-xs text-gray-600 mb-1" style={{
                      height: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>{step.subtitle}</p>
                    <div style={{
                      backgroundColor: colors.aqua,
                      color: colors.darkBlue,
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      height: '20px',
                      lineHeight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      {step.timeline}
                    </div>
                  </div>
                  {index < investmentSteps.length - 1 && (
                    <div style={{
                      flex: '0 0 30px',
                      height: '2px',
                      backgroundColor: colors.aqua,
                      position: 'relative',
                      animation: 'pulse 2s infinite',
                      marginBottom: '72px'
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: '-6px',
                        top: '-4px',
                        width: '0',
                        height: '0',
                        borderLeft: `6px solid ${colors.aqua}`,
                        borderTop: '4px solid transparent',
                        borderBottom: '4px solid transparent'
                      }}></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* Mobile vertical layout */}
            <div className="md:hidden space-y-6">
              {investmentSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="timeline-step flex flex-col items-center text-center">
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: colors.yellow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      margin: '0 auto 12px',
                      border: `4px solid ${colors.darkBlue}`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(255, 207, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}>
                      {step.icon}
                    </div>
                    <h3 className="font-bold mb-1" style={{
                      color: colors.darkBlue, 
                      height: '28px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-1" style={{
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>{step.subtitle}</p>
                    <div style={{
                      backgroundColor: colors.aqua,
                      color: colors.darkBlue,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      height: '24px',
                      lineHeight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      {step.timeline}
                    </div>
                  </div>
                  {index < investmentSteps.length - 1 && (
                    <div className="flex justify-center">
                    <div style={{
                        width: '3px',
                        height: '40px',
                      backgroundColor: colors.aqua,
                        position: 'relative',
                        animation: 'pulse 2s infinite'
                    }}>
                      <div style={{
                        position: 'absolute',
                          bottom: '-8px',
                          left: '-5px',
                        width: '0',
                        height: '0',
                          borderTop: `8px solid ${colors.aqua}`,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent'
                      }}></div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://calendly.com/james-s-wildthings"
                target="_blank"
                rel="noopener noreferrer"
                  className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
                style={{backgroundColor: colors.orange, color: colors.white}}
              >
                📅 Book an Inspection
              </a>
              <button 
                onClick={() => document.getElementById('chat-widget')?.click()}
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
                style={{backgroundColor: colors.aqua, color: colors.darkBlue}}
              >
                💬 Chat with James
              </button>
              </div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap'}}>
            <div style={{flex: '1 1 600px', minWidth: '300px'}}>
              <div className="space-y-8 mb-8">
                {Object.entries(cabins).map(([key, cabin]) => (
                  <div key={key} className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {key === '3BR' ? (
                        <div style={{position: 'relative', width: '100%', height: '100%', minHeight: '320px'}}>
                          <video 
                            src="/3br-cabin-video.mp4"
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            webkit-playsinline="true"
                            preload="metadata"
                            style={{width: '100%', height: '100%', objectFit: 'cover', minHeight: '320px'}}
                          />
                        </div>
                      ) : key === '1BR' ? (
                        <div style={{position: 'relative', width: '100%', height: '100%', minHeight: '320px'}}>
                          <video 
                            src="/1br-cabin-video.mp4"
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            webkit-playsinline="true"
                            preload="metadata"
                            style={{width: '100%', height: '100%', objectFit: 'cover', minHeight: '320px'}}
                          />
                        </div>
                      ) : key === '2BR' ? (
                        <div style={{position: 'relative', width: '100%', height: '100%', minHeight: '320px'}}>
                          <video 
                            src="/2BR.mp4"
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            webkit-playsinline="true"
                            preload="metadata"
                            style={{width: '100%', height: '100%', objectFit: 'cover', minHeight: '320px'}}
                          />
                        </div>
                      ) : (
                      <img src={cabin.image} alt={cabin.name} style={{width: '100%', height: '100%', objectFit: 'cover', minHeight: '320px'}} />
                      )}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-2 italic" style={{
                          fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                          color: colors.darkBlue
                        }}>
                          {cabin.name.toUpperCase()}
                        </h3>
                        <div className="text-3xl font-bold mb-4" style={{color: colors.yellow}}>
                          ${cabin.price.toLocaleString('en-AU')}
                          <span className="text-sm ml-2" style={{color: colors.darkBlue}}>plus GST</span>
                        </div>

                        <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: `${colors.aqua}33`}}>
                          <h4 className="font-bold text-sm mb-2" style={{color: colors.darkBlue}}>Rental Rates:</h4>
                          <div className="text-sm space-y-1" style={{color: colors.darkBlue}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                              <span>Off Peak:</span>
                              <span className="font-bold" style={{color: colors.darkBlue}}>${cabin.rentOffPeak}/night</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                              <span>Peak{key === '3BR' ? ' (snow)' : ''}:</span>
                              <span className="font-bold" style={{color: colors.darkBlue}}>${cabin.rentPeak}/night</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4 text-sm" style={{color: colors.darkBlue}}>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.aqua, marginRight: '8px'}}></div>
                            <span>${cabin.siteFee}/week site fee</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.aqua, marginRight: '8px'}}></div>
                            <span>20% management fee</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setSelectedCabinForInvestment(key);
                            setShowInvestmentModal(true);
                          }}
                          className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 mb-2"
                          style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
                        >
                          Reserve Yours Today
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:sticky md:w-auto" style={{flex: '0 0 auto', minWidth: '300px', top: '100px', maxWidth: '100%'}}>
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <Calculator size={28} style={{color: colors.yellow, marginRight: '12px'}} />
                  <h2 className="text-2xl font-bold italic" style={{
                    fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                    color: colors.darkBlue
                  }}>
                    ROI CALCULATOR
                  </h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Cabin Type</label>
                    <div className="space-y-2">
                      {Object.entries(cabins).map(([key, cabin]) => (
                        <div 
                          key={key}
                          onClick={() => handleCabinTypeChange(key)}
                          className="cursor-pointer rounded-lg overflow-hidden transition-all"
                          style={{
                            border: `3px solid ${roiInputs.cabinType === key ? colors.yellow : colors.aqua}`,
                            boxShadow: roiInputs.cabinType === key ? '0 4px 12px rgba(255, 207, 0, 0.3)' : 'none'
                          }}
                        >
                          <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '8px'}}>
                            <img 
                              src={cabin.image} 
                              alt={cabin.name}
                              style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                            <div style={{flex: 1}}>
                              <div style={{fontWeight: 'bold', fontSize: '14px', color: colors.darkBlue}}>
                                {cabin.name}
                              </div>
                              <div style={{fontSize: '16px', fontWeight: 'bold', color: colors.yellow}}>
                                ${cabin.price.toLocaleString('en-AU')} plus GST
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Occupancy Rate (%)</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={roiInputs.occupancyRate || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setRoiInputs({...roiInputs, occupancyRate: value === '' ? 0 : (isNaN(value) ? 0 : value)});
                      }}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                      style={{border: `2px solid ${colors.aqua}`}}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Nightly Rate ($)</label>
                    <input 
                      type="number"
                      min="0"
                      value={roiInputs.nightlyRate || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                        setRoiInputs({...roiInputs, nightlyRate: value === '' ? 0 : (isNaN(value) ? 0 : value)});
                      }}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                      style={{border: `2px solid ${colors.aqua}`}}
                    />
                  </div>
                </div>

                {/* Optional Extras Selection */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3" style={{color: colors.darkBlue}}>Optional Extras</h3>
                  <div className="space-y-2">
                    {getExtrasForCabin(roiInputs.cabinType).map(extra => (
                      <label 
                        key={extra.id}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                        style={{
                          backgroundColor: selectedExtras.includes(extra.id) ? `${colors.yellow}33` : colors.lightGray,
                          border: `2px solid ${selectedExtras.includes(extra.id) ? colors.yellow : 'transparent'}`
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedExtras.includes(extra.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExtras([...selectedExtras, extra.id]);
                            } else {
                              setSelectedExtras(selectedExtras.filter(id => id !== extra.id));
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-sm" style={{color: colors.darkBlue}}>{extra.name}</div>
                          <div className="text-xs" style={{color: colors.orange}}>{extra.impactDescription}</div>
                          {(() => {
                            const extraROI = calculateExtraROI(extra.id, roiInputs.cabinType);
                            return (
                              <div className="text-xs mt-1" style={{color: extraROI.roiImpact > 0 ? '#059669' : extraROI.roiImpact < 0 ? '#EF4444' : '#6B7280'}}>
                                ROI Impact: {extraROI.roiImpact > 0 ? '+' : ''}{extraROI.roiImpact.toFixed(1)}%
                                {extra.id === 'solar' && (
                                  <span className="ml-1">(Eliminates ${(roiInputs.occupancyRate/100 * 365 * 20).toLocaleString()} energy costs)</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="font-bold text-sm" style={{color: colors.darkBlue}}>
                          ${extra.price.toLocaleString()}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dynamic Pricing Display */}
                <div className="rounded-lg p-4 mb-4" style={{backgroundColor: `${colors.yellow}33`, border: `2px solid ${colors.yellow}`}}>
                  <h3 className="font-bold mb-3 text-sm" style={{color: colors.darkBlue}}>Dynamic Nightly Rate</h3>
                  <div className="space-y-2 text-sm">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Base Rate ({roiInputs.cabinType}):</span>
                      <span className="font-bold">${defaultNightlyRates[roiInputs.cabinType]}</span>
                    </div>
                    {selectedExtras.length > 0 && (
                      <div style={{display: 'flex', justifyContent: 'space-between', color: colors.orange}}>
                        <span>Options Impact:</span>
                        <span className="font-bold">
                          {roiResults.dynamicNightlyRate - defaultNightlyRates[roiInputs.cabinType] >= 0 ? '+' : ''}
                          ${(roiResults.dynamicNightlyRate - defaultNightlyRates[roiInputs.cabinType]).toFixed(0)}
                        </span>
                      </div>
                    )}
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `2px solid ${colors.darkBlue}`, fontWeight: 'bold'}}>
                      <span>Final Rate:</span>
                      <span style={{color: colors.darkBlue}}>${roiResults.dynamicNightlyRate.toFixed(0)}/night</span>
                    </div>
                  </div>
                </div>

                {/* Total Investment Display */}
                <div className="rounded-lg p-4 mb-4" style={{backgroundColor: `${colors.aqua}33`}}>
                  <h3 className="font-bold mb-3 text-sm" style={{color: colors.darkBlue}}>Total Investment</h3>
                  <div className="space-y-2 text-sm">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Base Cabin Price:</span>
                      <span className="font-bold">${cabins[roiInputs.cabinType].price.toLocaleString()}</span>
                    </div>
                    {roiResults.extrasCost > 0 && (
                      <div style={{display: 'flex', justifyContent: 'space-between', color: colors.orange}}>
                        <span>Selected Extras:</span>
                        <span className="font-bold">+${roiResults.extrasCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `2px solid ${colors.darkBlue}`, fontWeight: 'bold'}}>
                      <span>Total:</span>
                      <span style={{color: colors.darkBlue}}>${roiResults.totalInvestment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 mb-4" style={{backgroundColor: `${colors.aqua}33`}}>
                  <h3 className="font-bold mb-3 text-sm" style={{color: colors.darkBlue}}>Annual Revenue</h3>
                  <div className="space-y-2 text-sm">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Gross Revenue:</span>
                      <span className="font-bold">${roiResults.grossRevenue.toLocaleString('en-AU', {maximumFractionDigits: 0})} plus GST</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', color: colors.orange}}>
                      <span>Management (20%):</span>
                      <span className="font-bold">-${roiResults.managementFee.toLocaleString('en-AU', {maximumFractionDigits: 0})}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', color: colors.orange}}>
                      <span>Site Fee:</span>
                      <span className="font-bold">-${roiResults.siteFeeAnnual.toLocaleString('en-AU', {maximumFractionDigits: 0})}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', color: colors.orange}}>
                      <span>Energy Costs:</span>
                      <span className="font-bold">-${roiResults.totalEnergyCosts.toLocaleString('en-AU', {maximumFractionDigits: 0})}</span>
                    </div>
                    {roiResults.annualCostSavings > 0 && (
                      <div style={{display: 'flex', justifyContent: 'space-between', color: '#059669'}}>
                        <span>Cost Savings (Solar):</span>
                        <span className="font-bold">+${roiResults.annualCostSavings.toLocaleString('en-AU', {maximumFractionDigits: 0})}</span>
                      </div>
                    )}
                    <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `2px solid ${colors.darkBlue}`, color: '#059669', fontWeight: 'bold'}}>
                      <span>Net Income:</span>
                      <span>${roiResults.netIncome.toLocaleString('en-AU', {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.orange, borderRadius: '8px', padding: '1rem', marginBottom: '1rem'}}>
                  <h3 className="font-bold mb-1 text-sm" style={{color: colors.white}}>Estimated Annual ROI</h3>
                  <div className="text-4xl font-bold" style={{color: colors.white}}>{roiResults.roi.toFixed(1)}%</div>
                  {roiResults.extrasCost > 0 && (
                    <p className="text-xs mt-2" style={{color: colors.white}}>Based on ${roiResults.totalInvestment.toLocaleString()} total investment</p>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setSelectedCabinForInvestment(roiInputs.cabinType);
                    setShowInvestmentModal(true);
                  }}
                  className="w-full py-4 rounded-lg font-bold transition-all hover:opacity-90 mb-4"
                  style={{backgroundColor: colors.yellow, color: colors.darkBlue, fontSize: '18px'}}
                >
                  Reserve {cabins[roiInputs.cabinType].name} Today
                </button>
                
                <p className="text-xs text-gray-600 italic">
                  * High-level estimate. Insurance, interest, maintenance not included.
                </p>
              </div>
            </div>
          </div>
        </div>

        {selectedCabin && (
          <ReservationModal 
            cabin={cabins[selectedCabin]} 
            cabinType={selectedCabin}
            onClose={() => setSelectedCabin(null)}
            colors={colors}
            extras={extras}
          />
        )}

        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-center italic" style={{
              fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
              color: colors.darkBlue
            }}>
              INVESTOR FAQS
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="rounded-lg overflow-hidden transition-all"
                  style={{border: `2px solid ${colors.aqua}`}}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left font-bold transition-all hover:opacity-90 flex justify-between items-center"
                    style={{
                      backgroundColor: openFaq === index ? colors.yellow : colors.white,
                      color: colors.darkBlue
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{fontSize: '24px', transition: 'transform 0.3s', transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                      ▼
                    </span>
                  </button>
                  {openFaq === index && (
                    <div 
                      className="p-4"
                      style={{
                        backgroundColor: `${colors.aqua}11`,
                        borderTop: `2px solid ${colors.aqua}`
                      }}
                    >
                      <p style={{color: colors.darkBlue, lineHeight: '1.6'}}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const LocationsPage = () => {
    // Reset hover state when component mounts and cleanup timeouts
    React.useEffect(() => {
      setHoveredExperience(null);
      return () => {
        // Cleanup timeout on unmount
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
      };
    }, []);

    const parkExperiences = [
      { 
        name: 'Water Ski', 
        icon: '🚤',
        image: '/water-ski.svg',
        description: 'Experience the thrill of water skiing on our pristine lake'
      },
      { 
        name: 'Playground', 
        icon: '🛝',
        image: '/playground.svg',
        description: 'Family fun with our state-of-the-art playground equipment'
      },
      { 
        name: 'Pool', 
        icon: '🏊',
        image: '/pool.svg',
        description: 'Relax and swim in our heated outdoor pool'
      },
      { 
        name: 'Skiing (Winter)', 
        icon: '⛷️',
        image: '/skiing.svg',
        description: 'Hit the slopes at nearby Mt Buller ski resort'
      },
      { 
        name: 'Hiking', 
        icon: '🥾',
        image: '/hiking.svg',
        description: 'Explore scenic trails through Victoria\'s High Country'
      },
      { 
        name: 'Mansfield Museum', 
        icon: '🏛️',
        image: '/museum.svg',
        description: 'Discover local history and culture'
      },
      { 
        name: 'Mt Buller', 
        icon: '🏔️',
        image: '/mt-buller.svg',
        description: 'Iconic mountain destination just 30 minutes away'
      },
      { 
        name: 'Food Trucks', 
        icon: '🚚',
        image: '/food-trucks.svg',
        description: 'Gourmet food trucks on-site serving delicious meals'
      },
      { 
        name: 'Bottle Shop', 
        icon: '🍷',
        image: '/bottle-shop.svg',
        description: 'Local wines, craft beers, and premium beverages'
      },
      { 
        name: 'Pizza Ovens', 
        icon: '🍕',
        image: '/pizza-ovens.svg',
        description: 'Wood-fired pizza ovens for authentic Italian dining'
      }
    ];

    return (
      <div className="pt-20 min-h-screen w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.lightGray}}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            OUR LOCATIONS
          </h1>
          <p className="text-xl text-center text-gray-700 mb-12">
            Discover your next adventure
          </p>

          {/* Mansfield Location */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
            {/* Mobile Layout: Video on top, content below */}
            <div className="md:hidden">
              <div 
                style={{position: 'relative', width: '100%', height: '250px'}}
              >
                <video 
                  src="/mansfield-flythrough.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />
              </div>
          <div className="p-6">
                <h2 className="text-3xl font-bold mb-3 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                color: colors.darkBlue
              }}>
                  Mansfield, Vic
              </h2>
                <p className="text-gray-700 mb-4 text-sm">
                  Nestled in Victoria's High Country with year-round adventure.
                </p>

                {/* Park Experiences - Smaller buttons for mobile */}
            <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 italic" style={{
                    fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                color: colors.darkBlue
              }}>
                    PARK EXPERIENCES
              </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {parkExperiences.map((experience, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg"
                    style={{
                          backgroundColor: `${colors.aqua}22`, 
                          border: `2px solid ${colors.aqua}`
                        }}
                      >
                        <span style={{fontSize: '16px'}}>{experience.icon}</span>
                        <span className="font-medium text-xs" style={{color: colors.darkBlue}}>
                          {experience.name}
                      </span>
                    </div>
                ))}
              </div>
            </div>

                <a 
                  href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90 text-sm"
                style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
              >
                  Book Mansfield Stay
                </a>
          </div>
        </div>

            {/* Desktop Layout: Side by side */}
            <div className="hidden md:grid" style={{gridTemplateColumns: '1fr 1fr', gap: 0}}>
              <div 
                style={{position: 'relative', width: '100%', height: '100%', minHeight: '400px', overflow: 'hidden'}}
              >
                <video 
                  src="/mansfield-flythrough.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    minHeight: '400px'
                  }}
                />
              </div>
              <div className="p-8">
                <h2 className="text-4xl font-bold mb-4 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  Mansfield, Vic
                </h2>
                <p className="text-gray-700 mb-6">
                  Nestled in Victoria's High Country with year-round adventure.
                </p>

                {/* Park Experiences */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 italic" style={{
                    fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                    color: colors.darkBlue
                  }}>
                    PARK EXPERIENCES
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {parkExperiences.map((experience, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg"
                        style={{
                          backgroundColor: `${colors.aqua}22`, 
                          border: `2px solid ${colors.aqua}`
                        }}
                      >
                        <span style={{fontSize: '24px'}}>{experience.icon}</span>
                        <span className="font-medium" style={{color: colors.darkBlue}}>
                          {experience.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <a 
                  href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
                >
                  Book Mansfield Stay
                </a>
              </div>
            </div>
          </div>

          {/* Byron Bay - Coming Soon */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
              <div style={{position: 'relative', width: '100%', height: '100%', minHeight: '400px'}}>
                <video 
                  src="/byron-coming-soon.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                style={{width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px'}}
              />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="inline-block px-4 py-2 rounded-full mb-4" style={{
                  backgroundColor: colors.orange,
                  color: colors.white,
                  fontWeight: 'bold',
                  fontSize: '14px',
                  alignSelf: 'flex-start'
                }}>
                  COMING SOON
                </div>
                <h2 className="text-4xl font-bold mb-4 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  Byron Bay, NSW
                </h2>
                <p className="text-gray-700 mb-6">
                  Australia's iconic coastal paradise. Beach vibes, rainforest adventures, and unforgettable sunrises await at our newest location.
                </p>
                <button 
                  disabled
                  className="inline-block px-8 py-3 rounded-lg font-bold opacity-50 cursor-not-allowed"
                  style={{backgroundColor: colors.yellow, color: colors.darkBlue, alignSelf: 'flex-start'}}
                >
                  Opening 2025
                </button>
              </div>
            </div>
          </div>

          {/* TikTok Feed Section */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-4xl font-bold mb-6 text-center italic" style={{
              fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
              color: colors.darkBlue
            }}>
              WILD ADVENTURES ON TIKTOK
            </h2>
            <p className="text-center text-gray-700 mb-8">
              Follow our latest adventures, tips, and behind-the-scenes moments!
            </p>
            
            {/* TikTok Carousel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* TikTok Video Placeholders */}
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className="rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl"
                  style={{
                    backgroundColor: colors.darkBlue,
                    aspectRatio: '9/16',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.white,
                    fontSize: '48px'
                  }}>
                    ▶️
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    color: colors.white
                  }}>
                    <p className="font-bold text-sm">Wild Adventure #{num}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a 
                href="https://www.tiktok.com/@user93338714482522"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
                style={{backgroundColor: colors.darkBlue, color: colors.white}}
              >
                Follow @wildthings on TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Investor Portal Component
  const InvestorPortal = () => {
    const totalValue = userInvestments.reduce((sum, investment) => sum + investment.currentValue, 0);
    const totalIncome = userInvestments.reduce((sum, investment) => sum + investment.totalIncome, 0);
    const monthlyIncome = userInvestments.reduce((sum, investment) => sum + investment.monthlyIncome, 0);
    const [investmentAttitude, setInvestmentAttitude] = useState('retain'); // 'retain' or 'payout'
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'
    const [userProfile, setUserProfile] = useState({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+61 400 000 000'
    });

  return (
      <div className="min-h-screen py-8 w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.lightGray}}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex-1">
          {/* Header */}
          <div className="text-center mb-8 pt-24">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 italic" style={{
              fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
              color: colors.darkBlue
            }}>
              My Wild Investments
            </h1>
            
            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-4 flex-wrap">
              <button
                onClick={() => setActiveTab('overview')}
                className="px-6 py-2 rounded-lg font-bold transition-all"
                style={{
                  backgroundColor: activeTab === 'overview' ? colors.yellow : colors.lightGray,
                  color: colors.darkBlue
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-6 py-2 rounded-lg font-bold transition-all"
                style={{
                  backgroundColor: activeTab === 'settings' ? colors.yellow : colors.lightGray,
                  color: colors.darkBlue
                }}
              >
                Account Settings
              </button>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setCurrentPage('home');
                }}
                className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-80"
                style={{
                  backgroundColor: colors.orange,
                  color: colors.white
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
          <>

          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between" style={{minHeight: '160px'}}>
              <h3 className="text-lg font-bold mb-2" style={{color: colors.darkBlue, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Total Investment</h3>
              <div>
                <p className="text-3xl font-bold" style={{color: colors.darkBlue, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  ${userInvestments.reduce((sum, inv) => sum + inv.purchasePrice, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{height: '20px'}}>plus GST</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between" style={{minHeight: '160px'}}>
              <h3 className="text-lg font-bold mb-2" style={{color: colors.darkBlue, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Total ROI</h3>
              <div>
                <p className="text-3xl font-bold" style={{color: colors.orange, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {((totalIncome / userInvestments.reduce((sum, inv) => sum + inv.purchasePrice, 0)) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{height: '20px'}}>annual return</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between" style={{minHeight: '160px'}}>
              <h3 className="text-lg font-bold mb-2" style={{color: colors.darkBlue, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Wild Things Account</h3>
              <div>
                <p className="text-3xl font-bold" style={{color: colors.yellow, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  ${(totalIncome * 0.3).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{height: '20px'}}>available balance</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-between" style={{minHeight: '160px'}}>
              <h3 className="text-lg font-bold mb-2" style={{color: colors.darkBlue, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Total Income (12mo)</h3>
              <div>
                <p className="text-3xl font-bold" style={{color: colors.aqua, height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  ${totalIncome.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1" style={{height: '20px'}}>past year</p>
              </div>
            </div>
          </div>

          {/* Investment Attitude */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
            <h3 className="text-2xl font-bold mb-4" style={{color: colors.darkBlue}}>Investment Attitude</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  if (investmentAttitude !== 'retain') {
                    setPendingAttitudeChange('retain');
                    setShowAttitudeChangeModal(true);
                  }
                }}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  investmentAttitude === 'retain' 
                    ? 'text-white' 
                    : 'text-gray-600'
                }`}
                style={{
                  backgroundColor: investmentAttitude === 'retain' ? colors.yellow : colors.lightGray,
                  color: investmentAttitude === 'retain' ? colors.darkBlue : colors.darkBlue
                }}
              >
                Retain Money to Reinvest
              </button>
              <button 
                onClick={() => {
                  if (investmentAttitude !== 'payout') {
                    setPendingAttitudeChange('payout');
                    setShowAttitudeChangeModal(true);
                  }
                }}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  investmentAttitude === 'payout' 
                    ? 'text-white' 
                    : 'text-gray-600'
                }`}
                style={{
                  backgroundColor: investmentAttitude === 'payout' ? colors.yellow : colors.lightGray,
                  color: investmentAttitude === 'payout' ? colors.darkBlue : colors.darkBlue
                }}
              >
                Payout Monthly
              </button>
            </div>
            <p className="text-sm mt-2" style={{color: colors.darkBlue}}>
              {investmentAttitude === 'retain' 
                ? 'Your earnings will be retained in your Wild Things account for reinvestment opportunities.'
                : 'Your earnings will be paid out to your nominated bank account monthly.'
              }
            </p>
          </div>

          {/* Referral Program */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 mb-12 border-2" style={{borderColor: colors.orange}}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  🎁 Refer & Earn $1,000
                </h3>
                <p className="text-sm mb-3" style={{color: colors.darkBlue}}>
                  Share your referral code with friends and family. When they invest in a Wild Things cabin, you both get <strong>$1,000</strong> towards your next cabin purchase!
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-lg p-3 border-2" style={{borderColor: colors.orange}}>
                    <p className="text-xs text-gray-600 mb-1">Your Referral Code</p>
                    <p className="text-2xl font-bold tracking-wider" style={{color: colors.orange}}>{referralCode}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                      alert('Referral code copied to clipboard!');
                    }}
                    className="px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{backgroundColor: colors.orange, color: colors.white}}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-xs text-gray-600 mb-1">Referrals Made</p>
                  <p className="text-4xl font-bold" style={{color: colors.orange}}>0</p>
                  <p className="text-xs text-gray-600 mt-1">$0 earned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cabins Owned */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h3 className="text-4xl font-bold mb-8 text-center italic" style={{
              fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
              color: colors.darkBlue
            }}>
              CABINS OWNED
            </h3>
            <div className="space-y-8">
              {userInvestments.map((investment) => (
                <div key={investment.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-lg overflow-hidden border-2" style={{borderColor: colors.aqua}}>
                  {/* Cabin Header with Photo */}
                  <div className="relative">
                    <div className="h-48 bg-cover bg-center" style={{
                      backgroundImage: `url(/${investment.cabinType}.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="text-3xl font-bold italic mb-1" style={{
                          fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                        }}>
                          {investment.cabinType} CABIN
                        </h4>
                        <p className="text-lg font-medium" style={{color: colors.aqua}}>
                          📍 {investment.location}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          investment.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {investment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1" style={{color: colors.darkBlue}}>Purchase Price</p>
                        <p className="text-xl font-bold" style={{color: colors.darkBlue}}>
                          ${investment.purchasePrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">plus GST</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1" style={{color: colors.darkBlue}}>Current Value</p>
                        <p className="text-xl font-bold" style={{color: colors.yellow}}>
                          ${investment.currentValue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">plus GST</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1" style={{color: colors.darkBlue}}>ROI</p>
                        <p className="text-xl font-bold" style={{color: colors.orange}}>
                          {investment.roi ? investment.roi.toFixed(2) : '0.00'}%
                        </p>
                        <p className="text-xs text-gray-600">annual return</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1" style={{color: colors.darkBlue}}>Total Income</p>
                        <p className="text-xl font-bold" style={{color: colors.aqua}}>
                          ${investment.totalIncome.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">lifetime</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1" style={{color: colors.darkBlue}}>Avg Per Night</p>
                        <p className="text-xl font-bold" style={{color: colors.yellow}}>
                          ${investment.averagePerNight ? investment.averagePerNight.toLocaleString() : Math.round(investment.monthlyIncome / 30).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">per night</p>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>📄 Legal Documents & Contracts</h4>
                      <div className="space-y-2 mb-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">📋</span>
                            <div>
                              <p className="font-bold text-sm" style={{color: colors.darkBlue}}>Sale Agreement</p>
                              <p className="text-xs text-gray-600">Signed {investment.purchaseDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              Signed
                            </span>
                            <button className="text-blue-600 text-sm hover:underline">View →</button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🏠</span>
                            <div>
                              <p className="font-bold text-sm" style={{color: colors.darkBlue}}>Land Lease Agreement</p>
                              <p className="text-xs text-gray-600">Signed {investment.purchaseDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              Signed
                            </span>
                            <button className="text-blue-600 text-sm hover:underline">View →</button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-2 sm:gap-0">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">⚙️</span>
                            <div>
                              <p className="font-bold text-sm" style={{color: colors.darkBlue}}>Site Management Agreement</p>
                              <p className="text-xs text-gray-600">Signed {investment.purchaseDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              Signed
                            </span>
                            <button className="text-blue-600 text-sm hover:underline">View →</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Section */}
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4">
                      <h4 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>💰 Billing & Invoices</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400" style={{borderColor: colors.lightGray}}>
                          <span className="text-3xl mb-2">🏢</span>
                          <p className="font-bold text-sm mb-1" style={{color: colors.darkBlue}}>Management</p>
                          <p className="text-xs text-gray-600 mb-2">Monthly invoices</p>
                          <span className="text-blue-600 text-xs font-medium">View →</span>
                        </button>
                        <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400" style={{borderColor: colors.lightGray}}>
                          <span className="text-3xl mb-2">🏡</span>
                          <p className="font-bold text-sm mb-1" style={{color: colors.darkBlue}}>Land Lease</p>
                          <p className="text-xs text-gray-600 mb-2">Site fees</p>
                          <span className="text-blue-600 text-xs font-medium">View →</span>
                        </button>
                        <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400" style={{borderColor: colors.lightGray}}>
                          <span className="text-3xl mb-2">🔧</span>
                          <p className="font-bold text-sm mb-1" style={{color: colors.darkBlue}}>Maintenance</p>
                          <p className="text-xs text-gray-600 mb-2">Service records</p>
                          <span className="text-blue-600 text-xs font-medium">View →</span>
                        </button>
                        <button className="flex flex-col items-center text-center p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all hover:border-aqua-400" style={{borderColor: colors.lightGray}}>
                          <span className="text-3xl mb-2">🧹</span>
                          <p className="font-bold text-sm mb-1" style={{color: colors.darkBlue}}>Cleaning</p>
                          <p className="text-xs text-gray-600 mb-2">Service invoices</p>
                          <span className="text-blue-600 text-xs font-medium">View →</span>
                        </button>
                      </div>
                    </div>

                    {/* Boost Marketing Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2" style={{borderColor: colors.orange}}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold flex items-center gap-2" style={{color: colors.darkBlue}}>
                            🚀 Boost Your Cabin
                          </h4>
                          <p className="text-xs text-gray-600">Increase bookings with targeted marketing</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedInvestmentForBoost(investment);
                            setShowBoostModal(true);
                          }}
                          className="px-4 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                          style={{backgroundColor: colors.orange, color: colors.white}}
                        >
                          Boost Now
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                        <div className="bg-white rounded p-1 sm:p-2 text-center border" style={{borderColor: colors.aqua}}>
                          <p className="font-bold text-xs" style={{color: colors.darkBlue}}>Wild</p>
                          <p className="text-xs" style={{color: colors.orange}}>$500/mo</p>
                        </div>
                        <div className="bg-white rounded p-1 sm:p-2 text-center border" style={{borderColor: colors.aqua}}>
                          <p className="font-bold text-xs" style={{color: colors.darkBlue}}>Wilder</p>
                          <p className="text-xs" style={{color: colors.orange}}>$1k/mo</p>
                        </div>
                        <div className="bg-white rounded p-1 sm:p-2 text-center border" style={{borderColor: colors.aqua}}>
                          <p className="font-bold text-xs" style={{color: colors.darkBlue}}>Wildest</p>
                          <p className="text-xs" style={{color: colors.orange}}>$2k/mo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
          )}

          {/* Account Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>First Name</label>
                    <input
                      type="text"
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Last Name</label>
                    <input
                      type="text"
                      value={userProfile.lastName}
                      onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Phone</label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                </div>
                <button
                  onClick={() => alert('Profile updated successfully!')}
                  className="mt-4 px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
                >
                  Save Changes
                </button>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{borderColor: colors.aqua}}
                    />
                  </div>
                  <button
                    onClick={() => alert('Password changed successfully!')}
                    className="px-6 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{backgroundColor: colors.aqua, color: colors.darkBlue}}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-6 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  Payment Methods
                </h3>
                <div className="space-y-3 mb-4">
                  {savedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 rounded-lg border-2"
                      style={{borderColor: method.isDefault ? colors.yellow : colors.lightGray}}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💳</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{color: colors.darkBlue}}>
                              {method.brand} •••• {method.last4}
                            </span>
                            {method.isDefault && (
                              <span className="px-2 py-1 rounded text-xs font-bold" style={{backgroundColor: colors.yellow, color: colors.darkBlue}}>
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">Expires {method.expiry}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => {
                              setSavedPaymentMethods(savedPaymentMethods.map(pm => ({
                                ...pm,
                                isDefault: pm.id === method.id
                              })));
                              alert('Default payment method updated!');
                            }}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Remove this payment method?')) {
                              setSavedPaymentMethods(savedPaymentMethods.filter(pm => pm.id !== method.id));
                            }
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newCard = {
                      id: (savedPaymentMethods.length + 1).toString(),
                      last4: '1234',
                      brand: 'Mastercard',
                      expiry: '06/26',
                      isDefault: savedPaymentMethods.length === 0
                    };
                    setSavedPaymentMethods([...savedPaymentMethods, newCard]);
                    alert('New card added! (In production, this would open Stripe payment form)');
                  }}
                  className="w-full py-3 rounded-lg font-bold border-2 border-dashed transition-all hover:bg-gray-50"
                  style={{borderColor: colors.aqua, color: colors.darkBlue}}
                >
                  + Add New Payment Method
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Sticky Investment Panel - Right Side - Only show on Overview tab */}
        {activeTab === 'overview' && (
        <div className="w-full lg:w-[420px] lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)] overflow-y-auto p-4 lg:flex-shrink-0" style={{scrollBehavior: 'smooth'}}>
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4 italic" style={{
              fontFamily: 'Roboto Condensed, Impact, Arial Black, sans-serif',
              fontWeight: '900',
              fontStyle: 'italic',
              color: colors.darkBlue
            }}>
              Grow Your Wild Portfolio
            </h3>

            {/* Location Selection */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Location</label>
              <select
                value={floatingInvestmentData.selectedLocation}
                onChange={(e) => setFloatingInvestmentData({...floatingInvestmentData, selectedLocation: e.target.value})}
                className="w-full p-2 border-2 rounded-lg"
                style={{borderColor: colors.aqua}}
              >
                <option value="mansfield">Mansfield</option>
                <option value="byron">Byron Bay (Coming Soon)</option>
              </select>
            </div>

            {/* Cabin Selection */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Cabin Type</label>
              <div className="space-y-2">
                {Object.entries(cabins).map(([key, cabin]) => (
                  <div
                    key={key}
                    onClick={() => setFloatingInvestmentData({...floatingInvestmentData, selectedCabin: key})}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      floatingInvestmentData.selectedCabin === key 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <h4 className="font-bold text-sm" style={{color: colors.darkBlue}}>{cabin.name}</h4>
                    <p className="font-bold text-sm" style={{color: colors.yellow}}>
                      ${cabin.price.toLocaleString()} plus GST
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Estimated ROI: <span className="font-bold" style={{color: colors.darkBlue}}>
                          {key === '1BR' ? '53.1%' : key === '2BR' ? '43.7%' : '42.7%'}
                        </span>
                      </p>
                      <p className="text-xs font-bold" style={{color: '#10B981'}}>
                        ~${key === '1BR' ? '58,447' : key === '2BR' ? '74,355' : '106,650'}/year potential income
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras */}
            {floatingInvestmentData.selectedCabin && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Optional Extras</label>
                <div className="space-y-2">
                  {getExtrasForCabin(floatingInvestmentData.selectedCabin).map((extra) => (
                    <label key={extra.id} className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={floatingInvestmentData.selectedExtras?.includes(extra.id) || false}
                          onChange={(e) => {
                            const currentExtras = floatingInvestmentData.selectedExtras || [];
                            if (e.target.checked) {
                              setFloatingInvestmentData({
                                ...floatingInvestmentData,
                                selectedExtras: [...currentExtras, extra.id]
                              });
                            } else {
                              setFloatingInvestmentData({
                                ...floatingInvestmentData,
                                selectedExtras: currentExtras.filter(id => id !== extra.id)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm" style={{color: colors.darkBlue}}>{extra.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{color: colors.darkBlue}}>
                        ${extra.price.toLocaleString()} plus GST
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method */}
            {floatingInvestmentData.selectedCabin && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{color: colors.darkBlue}}>Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    style={{borderColor: floatingInvestmentData.paymentMethod === 'external' ? colors.yellow : colors.lightGray}}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="external"
                      checked={floatingInvestmentData.paymentMethod === 'external'}
                      onChange={(e) => setFloatingInvestmentData({...floatingInvestmentData, paymentMethod: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm" style={{color: colors.darkBlue}}>Pay with Card/Bank Transfer</span>
                  </label>
                  {userInvestments.length > 0 && (
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{borderColor: floatingInvestmentData.paymentMethod === 'account' ? colors.aqua : colors.lightGray}}
                      onClick={(e) => {
                        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="account"
                        checked={floatingInvestmentData.paymentMethod === 'account'}
                        onChange={(e) => {
                          setFloatingInvestmentData({...floatingInvestmentData, paymentMethod: e.target.value});
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm block" style={{color: colors.darkBlue}}>Use Wild Things Account Balance</span>
                        <span className="text-xs" style={{color: colors.aqua}}>Available: ${(totalIncome * 0.3).toLocaleString()}</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {floatingInvestmentData.selectedCabin && (() => {
              const holdingDeposit = 100;
              const wildThingsBalance = totalIncome * 0.3;
              const amountFromAccount = floatingInvestmentData.paymentMethod === 'account' && userInvestments.length > 0 
                ? Math.min(wildThingsBalance, holdingDeposit) 
                : 0;
              const amountDueToday = holdingDeposit - amountFromAccount;
              
              return (
                <div className="mb-4 p-4 rounded-lg" style={{backgroundColor: `${colors.yellow}20`}}>
                  <h4 className="font-bold mb-2" style={{color: colors.darkBlue}}>Investment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Cabin:</span>
                      <span className="font-bold">${cabins[floatingInvestmentData.selectedCabin].price.toLocaleString()}</span>
                    </div>
                    {floatingInvestmentData.selectedExtras?.length > 0 && (
                      <div className="flex justify-between">
                        <span>Extras:</span>
                        <span className="font-bold">
                          ${[
                            { id: 'insurance', price: 1200 },
                            { id: 'maintenance', price: 800 },
                            { id: 'furniture', price: 12000 },
                            { id: 'appliances', price: 5000 }
                          ]
                            .filter(e => floatingInvestmentData.selectedExtras.includes(e.id))
                            .reduce((sum, e) => sum + e.price, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-bold">Holding Deposit:</span>
                      <span className="font-bold" style={{color: colors.yellow}}>${holdingDeposit}</span>
                    </div>
                    {floatingInvestmentData.paymentMethod === 'account' && userInvestments.length > 0 && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{color: colors.aqua}}>Less: Wild Things Account Balance:</span>
                        <span className="text-xs font-bold" style={{color: colors.aqua}}>-${amountFromAccount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-bold">Amount Due Today:</span>
                      <span className="font-bold" style={{color: amountDueToday === 0 ? colors.aqua : colors.darkBlue}}>
                        ${amountDueToday.toLocaleString()}
                      </span>
                    </div>
                    {floatingInvestmentData.paymentMethod === 'account' && userInvestments.length > 0 && wildThingsBalance < holdingDeposit && (
                      <div className="mt-2 p-2 rounded" style={{backgroundColor: `${colors.aqua}20`}}>
                        <p className="text-xs" style={{color: colors.darkBlue}}>
                          Your Wild Things Account balance (${wildThingsBalance.toLocaleString()}) will be applied. 
                          Remaining ${(holdingDeposit - wildThingsBalance).toLocaleString()} due via external payment.
                        </p>
                      </div>
                    )}
                    {floatingInvestmentData.paymentMethod === 'account' && userInvestments.length > 0 && wildThingsBalance >= holdingDeposit && (
                      <div className="mt-2 p-2 rounded" style={{backgroundColor: `${colors.aqua}20`}}>
                        <p className="text-xs" style={{color: colors.darkBlue}}>
                          Fully covered by your Wild Things Account balance (${wildThingsBalance.toLocaleString()} available).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Proceed Button */}
            <button
              onClick={() => {
                if (floatingInvestmentData.selectedCabin) {
                  setSelectedCabinForInvestment(floatingInvestmentData.selectedCabin);
                  setShowInvestmentModal(true);
                }
              }}
              disabled={!floatingInvestmentData.selectedCabin}
              className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
        )}
        </div>
      </div>
    );
  };

  // Login Modal
  const LoginModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
      e.preventDefault();
      // Simulate login - in real app, this would call your auth API
      if (email && password) {
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setCurrentPage('investor-portal');
      }
    };

    if (!showLoginModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Login to Your Account
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{focusRingColor: colors.aqua}}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{focusRingColor: colors.aqua}}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.darkBlue, color: colors.white}}
              >
                Cancel
              </button>
            </div>
          </form>
          <p className="text-center mt-4 text-sm" style={{color: colors.darkBlue}}>
            Don't have an account?{' '}
            <button
              onClick={() => {
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}
              className="font-bold"
              style={{color: colors.aqua}}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Reservation Modal with Account Creation
  const ReservationModal = () => {
    const [step, setStep] = useState(1); // 1: Reservation, 2: Account Creation, 3: Confirmation
    const [accountData, setAccountData] = useState({
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    });

    const handleReservationSubmit = (e) => {
      e.preventDefault();
      setStep(2); // Move to account creation step
    };

    const handleAccountCreation = (e) => {
      e.preventDefault();
      if (accountData.password === accountData.confirmPassword && accountData.agreeToTerms) {
        // Create account and complete reservation
        setIsLoggedIn(true);
        setStep(3);
        
        // Simulate account creation
        console.log('Account created for:', reservationData.email);
        console.log('Reservation details:', reservationData);
      }
    };

    const handleCompleteReservation = () => {
      setShowReservationModal(false);
      setStep(1);
      setReservationData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        cabinType: '',
        location: '',
        specialRequests: ''
      });
    };

    if (!showReservationModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                color: colors.darkBlue
              }}>
                Book Your Stay
              </h2>
              <form onSubmit={handleReservationSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={reservationData.firstName}
                      onChange={(e) => setReservationData({...reservationData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={reservationData.lastName}
                      onChange={(e) => setReservationData({...reservationData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={reservationData.email}
                      onChange={(e) => setReservationData({...reservationData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={reservationData.phone}
                      onChange={(e) => setReservationData({...reservationData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={reservationData.checkIn}
                      onChange={(e) => setReservationData({...reservationData, checkIn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={reservationData.checkOut}
                      onChange={(e) => setReservationData({...reservationData, checkOut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Number of Guests
                    </label>
                    <select
                      value={reservationData.guests}
                      onChange={(e) => setReservationData({...reservationData, guests: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Cabin Type
                    </label>
                    <select
                      value={reservationData.cabinType}
                      onChange={(e) => setReservationData({...reservationData, cabinType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    >
                      <option value="">Select Cabin</option>
                      <option value="1BR">1 Bedroom Cabin</option>
                      <option value="2BR">2 Bedroom Cabin</option>
                      <option value="3BR">3 Bedroom Cabin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                      Location
                    </label>
                    <select
                      value={reservationData.location}
                      onChange={(e) => setReservationData({...reservationData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{focusRingColor: colors.aqua}}
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Mansfield">Mansfield</option>
                      <option value="Byron Bay">Byron Bay</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                    Special Requests
                  </label>
                  <textarea
                    value={reservationData.specialRequests}
                    onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{focusRingColor: colors.aqua}}
                    rows="3"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                {/* Extras Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>
                    Add Extras to Your Stay
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'breakfast', name: 'Continental Breakfast', description: 'Daily breakfast for your stay', price: 25, unit: 'per day' },
                      { id: 'cleaning', name: 'Premium Cleaning Service', description: 'Daily housekeeping service', price: 50, unit: 'per day' },
                      { id: 'activities', name: 'Activity Package', description: 'Guided tours and outdoor activities', price: 75, unit: 'per person' },
                      { id: 'transport', name: 'Airport Transfer', description: 'Round-trip airport transportation', price: 120, unit: 'per trip' }
                    ].map((extra) => (
                      <label 
                        key={extra.id}
                        className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border-2"
                        style={{
                          backgroundColor: reservationExtras[extra.id] ? `${colors.yellow}20` : 'white',
                          borderColor: reservationExtras[extra.id] ? colors.yellow : colors.aqua
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={reservationExtras[extra.id] || false}
                            onChange={() => setReservationExtras(prev => ({
                              ...prev,
                              [extra.id]: !prev[extra.id]
                            }))}
                            className="w-5 h-5"
                            style={{accentColor: colors.yellow}}
                          />
                          <div>
                            <p className="font-bold" style={{color: colors.darkBlue}}>{extra.name}</p>
                            <p className="text-sm text-gray-600">{extra.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" style={{color: colors.yellow}}>${extra.price}</p>
                          <p className="text-xs text-gray-500">{extra.unit}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reservation Summary */}
                <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: `${colors.aqua}20`, border: `2px solid ${colors.aqua}`}}>
                  <h3 className="font-bold mb-2" style={{color: colors.darkBlue}}>Reservation Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cabin Type:</span>
                      <span className="font-bold">{reservationData.cabinType || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-bold">{reservationData.location || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span className="font-bold">{reservationData.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span className="font-bold">
                        {reservationData.checkIn && reservationData.checkOut ? 
                          Math.ceil((new Date(reservationData.checkOut) - new Date(reservationData.checkIn)) / (1000 * 60 * 60 * 24)) : 
                          'Select dates'
                        }
                      </span>
                    </div>
                    {Object.keys(reservationExtras).some(key => reservationExtras[key]) && (
                      <div className="border-t pt-2">
                        <p className="font-bold mb-1" style={{color: colors.darkBlue}}>Selected Extras:</p>
                        {Object.entries(reservationExtras).map(([key, selected]) => {
                          if (!selected) return null;
                          const extra = [
                            { id: 'breakfast', name: 'Continental Breakfast', price: 25 },
                            { id: 'cleaning', name: 'Premium Cleaning Service', price: 50 },
                            { id: 'activities', name: 'Activity Package', price: 75 },
                            { id: 'transport', name: 'Airport Transfer', price: 120 }
                          ].find(e => e.id === key);
                          return extra ? (
                            <div key={key} className="flex justify-between text-xs">
                              <span>{extra.name}</span>
                              <span style={{color: colors.yellow}}>${extra.price}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
                  >
                    Continue to Account Creation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(false)}
                    className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{backgroundColor: colors.darkBlue, color: colors.white}}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                color: colors.darkBlue
              }}>
                Create Your Account
              </h2>
              <p className="text-center mb-6" style={{color: colors.darkBlue}}>
                To complete your reservation, please create an account with us.
              </p>
              <form onSubmit={handleAccountCreation}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({...accountData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{focusRingColor: colors.aqua}}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({...accountData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{focusRingColor: colors.aqua}}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={accountData.agreeToTerms}
                      onChange={(e) => setAccountData({...accountData, agreeToTerms: e.target.checked})}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm" style={{color: colors.darkBlue}}>
                      I agree to the Terms of Service and Privacy Policy
                    </span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
                  >
                    Create Account & Complete Reservation
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                    style={{backgroundColor: colors.darkBlue, color: colors.white}}
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
                <h2 className="text-2xl font-bold mb-6 italic" style={{
                  fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                  color: colors.darkBlue
                }}>
                  Reservation Confirmed!
                </h2>
                <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: colors.aqua + '20'}}>
                  <p className="text-lg font-bold mb-2" style={{color: colors.darkBlue}}>
                    {reservationData.firstName} {reservationData.lastName}
                  </p>
                  <p className="text-sm" style={{color: colors.darkBlue}}>
                    {reservationData.cabinType} Cabin at {reservationData.location}
                  </p>
                  <p className="text-sm" style={{color: colors.darkBlue}}>
                    {reservationData.checkIn} to {reservationData.checkOut}
                  </p>
                  <p className="text-sm" style={{color: colors.darkBlue}}>
                    {reservationData.guests} {reservationData.guests === 1 ? 'Guest' : 'Guests'}
                  </p>
                </div>
                <p className="mb-6" style={{color: colors.darkBlue}}>
                  Your account has been created and your reservation is confirmed. 
                  You'll receive a confirmation email shortly.
                </p>
                <button
                  onClick={handleCompleteReservation}
                  className="px-8 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                  style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
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

  // Contract Creation Modal
  const ContractModal = () => {
    const handleCreateContract = (e) => {
      e.preventDefault();
      const newContract = {
        id: contracts.length + 1,
        ...contractData,
        invoiceNumber: `INV-2024-${String(contracts.length + 1).padStart(3, '0')}`,
        contractStatus: 'Pending Signature',
        paymentStatus: 'Pending',
        contracts: [
          { type: 'Sale Agreement', status: 'Pending Signature', signedDate: null },
          { type: 'Land Lease Agreement', status: 'Pending Signature', signedDate: null },
          { type: 'Site Management Agreement', status: 'Pending Signature', signedDate: null }
        ]
      };
      setContracts([...contracts, newContract]);
      setShowContractModal(false);
      setContractData({
        clientName: '',
        clientEmail: '',
        cabinType: '',
        location: '',
        purchasePrice: 0,
        depositAmount: 0,
        contractStatus: 'Draft'
      });
    };

    if (!showContractModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Create New Contract
          </h2>
          <form onSubmit={handleCreateContract}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Client Name
                </label>
                <input
                  type="text"
                  value={contractData.clientName}
                  onChange={(e) => setContractData({...contractData, clientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Client Email
                </label>
                <input
                  type="email"
                  value={contractData.clientEmail}
                  onChange={(e) => setContractData({...contractData, clientEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Cabin Type
                </label>
                <select
                  value={contractData.cabinType}
                  onChange={(e) => setContractData({...contractData, cabinType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                >
                  <option value="">Select Cabin Type</option>
                  <option value="1BR">1 Bedroom Cabin</option>
                  <option value="2BR">2 Bedroom Cabin</option>
                  <option value="3BR">3 Bedroom Cabin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Location
                </label>
                <select
                  value={contractData.location}
                  onChange={(e) => setContractData({...contractData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                >
                  <option value="">Select Location</option>
                  <option value="Mansfield">Mansfield</option>
                  <option value="Byron Bay">Byron Bay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  value={contractData.purchasePrice}
                  onChange={(e) => {
                    const price = parseInt(e.target.value) || 0;
                    setContractData({
                      ...contractData, 
                      purchasePrice: price,
                      depositAmount: Math.round(price * 0.3) // 30% deposit
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Deposit Amount ($)
                </label>
                <input
                  type="number"
                  value={contractData.depositAmount}
                  onChange={(e) => setContractData({...contractData, depositAmount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
              >
                Generate Contract
              </button>
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.darkBlue, color: colors.white}}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Digital Signature Modal
  const SignatureModal = () => {
    const handleDigitalSignature = () => {
      // Simulate digital signature process
      console.log('Contract signed by:', contractData.clientName);
      console.log('Signature date:', new Date().toISOString().split('T')[0]);
      
      // Update contract status
      const updatedContracts = contracts.map(contract => 
        contract.id === contracts.length ? 
        { ...contract, contractStatus: 'Signed', signedDate: new Date().toISOString().split('T')[0] } : 
        contract
      );
      setContracts(updatedContracts);
      setShowContractModal(false);
      
      // Trigger invoice generation (simulated)
      console.log('Invoice generated for:', contractData.clientName);
      console.log('Amount:', contractData.depositAmount);
    };

    if (!showContractModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Digital Signature
          </h2>
          
          <div className="mb-6">
            <p className="text-center mb-4" style={{color: colors.darkBlue}}>
              Please review the contract details and sign digitally
            </p>
            
            {/* Signature Canvas Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <p className="text-gray-500">Digital Signature Canvas</p>
              <p className="text-sm text-gray-400 mt-2">
                In production, this would be a real signature capture component
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDigitalSignature}
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
            >
              Sign Contract
            </button>
            <button
              onClick={() => setShowContractModal(false)}
              className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.darkBlue, color: colors.white}}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Existing Owner Investment Modal
  const ExistingOwnerModal = () => {
    const totalValue = userInvestments.reduce((sum, investment) => sum + investment.currentValue, 0);
    const totalIncome = userInvestments.reduce((sum, investment) => sum + investment.totalIncome, 0);
    const accountBalance = totalIncome * 0.3; // 30% retained in account
    const [selectedCabin, setSelectedCabin] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('account');
    const [investmentData, setInvestmentData] = useState({ location: 'mansfield' });
    const [selectedExtras, setSelectedExtras] = useState([]);

    const handleCabinSelection = (cabinType) => {
      setSelectedCabin(cabinType);
    };

    const handleInvestmentSubmit = (e) => {
      e.preventDefault();
      
      if (selectedCabin && paymentMethod === 'account') {
        const cabin = cabins[selectedCabin];
        const holdingDeposit = 100;
        const totalPrice = cabin.price;
        
        if (accountBalance >= holdingDeposit) {
          // Deduct from account balance
          console.log('Using Wild Things account funds for new investment');
          console.log('Account balance before:', accountBalance);
          console.log('Holding deposit:', holdingDeposit);
          console.log('Remaining balance:', accountBalance - holdingDeposit);
          
          // Add new investment
          const newInvestment = {
            id: userInvestments.length + 1,
            cabinType: selectedCabin,
            location: 'Mansfield',
            purchaseDate: new Date().toISOString().split('T')[0],
            purchasePrice: totalPrice,
            currentValue: totalPrice * 1.08,
            totalIncome: 0,
            monthlyIncome: 0,
            status: 'Active',
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
          
          setUserInvestments([...userInvestments, newInvestment]);
          setShowExistingOwnerModal(false);
          setCurrentPage('investor-portal');
        } else {
          alert('Insufficient funds in Wild Things account');
        }
      }
    };

    if (!showExistingOwnerModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Grow Your Wild Portfolio
          </h2>

          {/* Account Balance */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-2" style={{color: colors.darkBlue}}>Your Wild Things Account</h3>
            <p className="text-2xl font-bold" style={{color: colors.yellow}}>
              Available Balance: ${accountBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              This is your retained earnings available for reinvestment
            </p>
          </div>

          {/* Location Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>Select Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  investmentData.location === 'mansfield'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setInvestmentData({...investmentData, location: 'mansfield'})}
              >
                <h4 className="font-bold text-lg" style={{color: colors.darkBlue}}>Mansfield</h4>
                <p className="text-sm text-gray-600">Victoria's High Country</p>
                <p className="text-sm text-gray-500">Premium mountain location</p>
              </div>
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  investmentData.location === 'byron'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setInvestmentData({...investmentData, location: 'byron'})}
              >
                <h4 className="font-bold text-lg" style={{color: colors.darkBlue}}>Byron Bay</h4>
                <p className="text-sm text-gray-600">Coming Soon</p>
                <p className="text-sm text-gray-500">Coastal paradise location</p>
              </div>
            </div>
          </div>

          {/* Cabin Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>Select Cabin Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(cabins).map(([key, cabin]) => (
                <div 
                  key={key}
                  onClick={() => handleCabinSelection(key)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCabin === key 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <h4 className="font-bold" style={{color: colors.darkBlue}}>{cabin.name}</h4>
                  <p className="text-lg font-bold" style={{color: colors.yellow}}>
                    ${cabin.price.toLocaleString()} plus GST
                  </p>
                  <p className="text-sm text-gray-600">{cabin.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Extras Selection */}
          {selectedCabin && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>Optional Investment Extras</h3>
              <div className="space-y-3">
                {getExtrasForCabin(selectedCabin).map((extra) => (
                  <label key={extra.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExtras([...selectedExtras, extra.id]);
                        } else {
                          setSelectedExtras(selectedExtras.filter(id => id !== extra.id));
                        }
                      }}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="flex-1">
                      <span className="font-medium" style={{color: colors.darkBlue}}>{extra.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ${extra.price.toLocaleString()} + GST
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          {selectedCabin && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="account"
                    checked={paymentMethod === 'account'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-bold" style={{color: colors.darkBlue}}>
                      Use Wild Things Account Funds
                    </div>
                    <div className="text-sm text-gray-600">
                      Pay holding deposit from your account balance
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="external"
                    checked={paymentMethod === 'external'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-bold" style={{color: colors.darkBlue}}>
                      External Payment
                    </div>
                    <div className="text-sm text-gray-600">
                      Pay with external payment method
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Investment Summary */}
          {selectedCabin && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>Investment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cabin Type:</span>
                  <span className="font-bold">{cabins[selectedCabin].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purchase Price:</span>
                  <span className="font-bold">${cabins[selectedCabin].price.toLocaleString()} plus GST</span>
                </div>
                <div className="flex justify-between">
                  <span>Holding Deposit:</span>
                  <span className="font-bold">$100</span>
                </div>
                {paymentMethod === 'account' && (
                  <div className="flex justify-between">
                    <span>Payment Source:</span>
                    <span className="font-bold" style={{color: colors.yellow}}>Wild Things Account</span>
                  </div>
                )}
                {paymentMethod === 'account' && (
                  <div className="flex justify-between">
                    <span>Remaining Balance:</span>
                    <span className="font-bold">${(accountBalance - 100).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleInvestmentSubmit}
              disabled={!selectedCabin}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
            >
              {paymentMethod === 'account' ? 'Pay from Account' : 'Proceed to Payment'}
            </button>
            <button
              onClick={() => setShowExistingOwnerModal(false)}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.darkBlue, color: colors.white}}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Floating Investment Panel
  const FloatingInvestmentPanel = () => {
    const totalIncome = userInvestments.reduce((sum, investment) => sum + investment.totalIncome, 0);
    const accountBalance = totalIncome * 0.3; // 30% retained in account

    const handleCabinSelection = (cabinType) => {
      setFloatingInvestmentData({...floatingInvestmentData, selectedCabin: cabinType});
    };

    const handleExtraToggle = (extraId) => {
      const currentExtras = floatingInvestmentData.selectedExtras;
      const newExtras = currentExtras.includes(extraId) 
        ? currentExtras.filter(id => id !== extraId)
        : [...currentExtras, extraId];
      setFloatingInvestmentData({...floatingInvestmentData, selectedExtras: newExtras});
    };

    const calculateExtrasTotal = () => {
      const cabinType = floatingInvestmentData.selectedCabin?.name;
      const solarPrice = cabinType === '1 Bedroom Cabin' ? 20000 : cabinType === '2 Bedroom Cabin' ? 30000 : 40000;
      const extras = [
        { id: 'insurance', price: 1200 },
        { id: 'maintenance', price: 800 },
        { id: 'furniture', price: 12000 },
        { id: 'appliances', price: 5000 },
        { id: 'solar', price: solarPrice }
      ];
      return extras.reduce((total, extra) => {
        return total + (floatingInvestmentData.selectedExtras.includes(extra.id) ? extra.price : 0);
      }, 0);
    };

    const handleProceedToPayment = () => {
      // Close floating panel and open investment modal
      setShowFloatingInvestmentPanel(false);
      setSelectedCabinForInvestment(floatingInvestmentData.selectedCabin);
      setShowInvestmentModal(true);
    };

    if (!showFloatingInvestmentPanel) return null;

    return (
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold italic" style={{
                fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                color: colors.darkBlue
              }}>
                New Investment
              </h2>
              <button
                onClick={() => setShowFloatingInvestmentPanel(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                style={{color: colors.darkBlue}}
              >
                <span className="text-2xl font-bold">×</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Location Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>Location</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="location"
                    checked={floatingInvestmentData.selectedLocation === 'mansfield'}
                    onChange={() => setFloatingInvestmentData({...floatingInvestmentData, selectedLocation: 'mansfield'})}
                    className="w-4 h-4"
                  />
                  <span style={{color: colors.darkBlue}}>Mansfield, Victoria</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="location"
                    checked={floatingInvestmentData.selectedLocation === 'byron'}
                    onChange={() => setFloatingInvestmentData({...floatingInvestmentData, selectedLocation: 'byron'})}
                    className="w-4 h-4"
                  />
                  <span style={{color: colors.darkBlue}}>Byron Bay (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Cabin Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>Cabin Type</h3>
              <div className="space-y-3">
                {Object.entries(cabins).map(([key, cabin]) => (
                  <div 
                    key={key}
                    onClick={() => handleCabinSelection(key)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      floatingInvestmentData.selectedCabin === key 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <h4 className="font-bold text-sm" style={{color: colors.darkBlue}}>{cabin.name}</h4>
                    <p className="font-bold" style={{color: colors.yellow}}>
                      ${cabin.price.toLocaleString()} plus GST
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras Selection */}
            {floatingInvestmentData.selectedCabin && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>Extras</h3>
                <div className="space-y-2">
                  {[
                    { id: 'insurance', name: 'Insurance', price: 1200 },
                    { id: 'maintenance', name: 'Maintenance', price: 800 },
                    { id: 'furniture', name: 'Furniture', price: 12000 },
                    { id: 'appliances', name: 'Appliances', price: 5000 }
                  ].map((extra) => (
                    <label key={extra.id} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={floatingInvestmentData.selectedExtras.includes(extra.id)}
                          onChange={() => handleExtraToggle(extra.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{color: colors.darkBlue}}>{extra.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{color: colors.yellow}}>
                        ${extra.price.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method */}
            {floatingInvestmentData.selectedCabin && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>Payment</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={floatingInvestmentData.paymentMethod === 'external'}
                      onChange={() => setFloatingInvestmentData({...floatingInvestmentData, paymentMethod: 'external'})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm" style={{color: colors.darkBlue}}>External Payment</span>
                  </label>
                  {userInvestments.length > 0 && (
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={floatingInvestmentData.paymentMethod === 'account'}
                        onChange={() => setFloatingInvestmentData({...floatingInvestmentData, paymentMethod: 'account'})}
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="text-sm font-bold" style={{color: colors.darkBlue}}>Wild Things Account</span>
                        <p className="text-xs text-gray-600">Balance: ${accountBalance.toLocaleString()}</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Investment Summary */}
            {floatingInvestmentData.selectedCabin && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-3" style={{color: colors.darkBlue}}>Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Cabin:</span>
                    <span className="font-bold">${cabins[floatingInvestmentData.selectedCabin].price.toLocaleString()}</span>
                  </div>
                  {calculateExtrasTotal() > 0 && (
                    <div className="flex justify-between">
                      <span>Extras:</span>
                      <span className="font-bold">${calculateExtrasTotal().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span>Holding Deposit:</span>
                    <span className="font-bold" style={{color: colors.yellow}}>$100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handleProceedToPayment}
              disabled={!floatingInvestmentData.selectedCabin}
              className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Investment Deposit Modal
  const InvestmentModal = () => {
  const [investmentData, setInvestmentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: 'Mansfield',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  // Initialize selectedExtras from floatingInvestmentData
  const initializeExtras = () => {
    const extrasObj = {};
    if (floatingInvestmentData.selectedExtras) {
      floatingInvestmentData.selectedExtras.forEach(extraId => {
        extrasObj[extraId] = true;
      });
    }
    return extrasObj;
  };
  
  const [selectedExtras, setSelectedExtras] = useState(initializeExtras());
  
  // Update extras when modal opens with floatingInvestmentData
  React.useEffect(() => {
    if (showInvestmentModal && floatingInvestmentData.selectedExtras) {
      const extrasObj = {};
      floatingInvestmentData.selectedExtras.forEach(extraId => {
        extrasObj[extraId] = true;
      });
      setSelectedExtras(extrasObj);
    }
  }, [showInvestmentModal, floatingInvestmentData.selectedExtras]);
  
    // Early return after hooks
    if (!showInvestmentModal || !selectedCabinForInvestment) {
      return null;
    }

    const selectedCabin = selectedCabinForInvestment ? cabins[selectedCabinForInvestment] : null;
    const holdingDeposit = 100; // $100 holding deposit
    const depositPercentage = 0.3; // 30% deposit
    const calculatedDeposit = selectedCabin ? Math.round(selectedCabin.price * depositPercentage) : 0;
    const balanceDue = selectedCabin ? calculatedDeposit : 0; // 30% becomes due after holding deposit
    
    // Wild Things Account Balance (for existing owners)
    const totalIncome = userInvestments.reduce((sum, investment) => sum + investment.totalIncome, 0);
    const wildThingsBalance = totalIncome * 0.3;
    const isUsingAccountBalance = floatingInvestmentData.paymentMethod === 'account' && userInvestments.length > 0;

    // Get cabin-specific extras
    const extras = getExtrasForCabin(selectedCabinForInvestment);

    const toggleExtra = (extraId) => {
      setSelectedExtras(prev => ({
        ...prev,
        [extraId]: !prev[extraId]
      }));
    };

    const calculateExtrasTotal = () => {
      return extras.reduce((total, extra) => {
        return total + (selectedExtras[extra.id] ? extra.price : 0);
      }, 0);
    };

    const calculateTotalDeposit = () => {
      return holdingDeposit + balanceDue + calculateExtrasTotal();
    };

    const handleInvestmentSubmit = (e) => {
      e.preventDefault();
      
      // Create investment account and process deposit
      console.log('Investment Account Created:', investmentData);
      console.log('Holding Deposit:', holdingDeposit);
      console.log('Balance Due:', balanceDue);
      console.log('Total Deposit:', calculateTotalDeposit());
      console.log('Cabin Type:', selectedCabinForInvestment);
      
      // Simulate account creation and login
      setIsLoggedIn(true);
      setShowInvestmentModal(false);
      
      // Add to user investments
      const newInvestment = {
        id: userInvestments.length + 1,
        cabinType: selectedCabinForInvestment,
        location: investmentData.location,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: selectedCabin.price,
        currentValue: selectedCabin.price,
        totalIncome: 0,
        monthlyIncome: 0,
        status: 'Pending Build',
        nextPayment: 'Build Complete (30%)'
      };
      setUserInvestments([...userInvestments, newInvestment]);
      
      // Redirect to investor portal
      setCurrentPage('investor-portal');
    };

    if (!showInvestmentModal || !selectedCabin) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={() => setShowInvestmentModal(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            style={{color: colors.darkBlue}}
          >
            <span className="text-2xl font-bold">×</span>
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Reserve Your Investment
          </h2>
          
          {/* Cabin Image and Details */}
          <div className="mb-6">
            <img 
              src={selectedCabin.image} 
              alt={selectedCabin.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold" style={{color: colors.darkBlue}}>
                  {selectedCabin.name}
                </h3>
                <p className="text-sm" style={{color: colors.darkBlue}}>
                  📍 {investmentData.location || 'Mansfield'}, Victoria
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: `${colors.yellow}20`, border: `2px solid ${colors.yellow}`}}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium" style={{color: colors.darkBlue}}>Purchase Price</p>
                <p className="text-xl font-bold" style={{color: colors.darkBlue}}>${selectedCabin.price.toLocaleString()} plus GST</p>
              </div>
              <div>
                <p className="font-medium" style={{color: colors.darkBlue}}>Holding Deposit</p>
                <p className="text-xl font-bold" style={{color: colors.yellow}}>${holdingDeposit}</p>
              </div>
              <div>
                <p className="font-medium" style={{color: colors.darkBlue}}>30% Due Later</p>
                <p className="text-xl font-bold" style={{color: colors.aqua}}>${balanceDue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Extras Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>
              Optional Investment Extras
            </h3>
            <div className="space-y-3">
              {extras.map((extra) => (
                <div key={extra.id}>
                  <label 
                    className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border-2"
                    style={{
                      backgroundColor: selectedExtras[extra.id] ? `${colors.yellow}20` : 'white',
                      borderColor: selectedExtras[extra.id] ? colors.yellow : colors.aqua
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedExtras[extra.id] || false}
                        onChange={() => toggleExtra(extra.id)}
                        className="w-5 h-5"
                        style={{accentColor: colors.yellow}}
                      />
                      <div>
                        <p className="font-bold" style={{color: colors.darkBlue}}>{extra.name}</p>
                        <p className="text-sm text-gray-600">{extra.impactDescription || extra.description}</p>
                        {(() => {
                          const extraROI = calculateExtraROI(extra.id, selectedCabinForInvestment);
                          return (
                            <div className="text-xs mt-1" style={{color: extraROI.roiImpact > 0 ? '#059669' : extraROI.roiImpact < 0 ? '#EF4444' : '#6B7280'}}>
                              ROI Impact: {extraROI.roiImpact > 0 ? '+' : ''}{extraROI.roiImpact.toFixed(1)}%
                              {extra.id === 'solar' && (
                                <span className="ml-1">(Eliminates ${(66/100 * 365 * 20).toLocaleString()} energy costs)</span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg" style={{color: colors.yellow}}>${extra.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{extra.id === 'insurance' || extra.id === 'maintenance' ? 'per year' : ''}</p>
                    </div>
                  </label>
                  
                  {/* Furniture Package Details - Unfurl when selected */}
                  {extra.id === 'furniture' && selectedExtras[extra.id] && extra.items && (
                    <div className="ml-12 mt-2 p-4 rounded-lg border-l-4" style={{
                      backgroundColor: `${colors.yellow}10`,
                      borderColor: colors.yellow
                    }}>
                      <p className="text-sm font-bold mb-2" style={{color: colors.darkBlue}}>📦 Package Includes:</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {extra.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span style={{color: colors.aqua}}>✓</span>
                            <span style={{color: colors.darkBlue}}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleInvestmentSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  First Name
                </label>
                <input
                  type="text"
                  value={investmentData.firstName}
                  onChange={(e) => setInvestmentData({...investmentData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={investmentData.lastName}
                  onChange={(e) => setInvestmentData({...investmentData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={investmentData.email}
                  onChange={(e) => setInvestmentData({...investmentData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={investmentData.phone}
                  onChange={(e) => setInvestmentData({...investmentData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                Preferred Location
              </label>
              <select
                value={investmentData.location}
                onChange={(e) => setInvestmentData({...investmentData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{focusRingColor: colors.aqua}}
                required
              >
                <option value="Mansfield">Mansfield, Victoria</option>
                <option value="Byron Bay">Byron Bay, NSW</option>
              </select>
            </div>

            {/* Account Creation Fields */}
            <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: `${colors.aqua}10`, border: `1px solid ${colors.aqua}`}}>
              <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>
                Create Your Investment Account
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={investmentData.password}
                    onChange={(e) => setInvestmentData({...investmentData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{focusRingColor: colors.aqua}}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={investmentData.confirmPassword}
                    onChange={(e) => setInvestmentData({...investmentData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{focusRingColor: colors.aqua}}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={investmentData.agreeToTerms}
                    onChange={(e) => setInvestmentData({...investmentData, agreeToTerms: e.target.checked})}
                    className="mr-2"
                    required
                  />
                  <span className="text-sm" style={{color: colors.darkBlue}}>
                    I agree to the Investment Terms & Conditions and Privacy Policy
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-6 p-6 rounded-xl shadow-lg" style={{backgroundColor: 'white', border: `1px solid ${colors.lightGray}`}}>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{backgroundColor: colors.aqua}}>
                  <span className="text-white font-bold text-sm">$</span>
                </div>
                <h3 className="text-xl font-bold" style={{color: colors.darkBlue, fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontStyle: 'italic'}}>Investment Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Cabin Type</span>
                  <span className="font-bold text-base" style={{color: colors.darkBlue}}>{selectedCabin.name}</span>
                </div>
                
                {/* Base Cabin Price */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Base Cabin Price</span>
                  <div className="text-right">
                    <div className="font-bold text-base" style={{color: colors.darkBlue}}>${selectedCabin.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="text-xs text-gray-500">plus GST</div>
                  </div>
                </div>
                
                {/* Extras Breakdown */}
                {calculateExtrasTotal() > 0 && (
                  <>
                    <div className="text-xs font-medium" style={{color: colors.darkBlue}}>Selected Extras:</div>
                    {getExtrasForCabin(selectedCabinForInvestment).map(extra => (
                      selectedExtras[extra.id] && (
                        <div key={extra.id} className="flex justify-between ml-4">
                          <span className="text-xs">{extra.name}:</span>
                          <span className="text-xs font-bold" style={{color: colors.yellow}}>
                            ${extra.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} plus GST
                          </span>
                        </div>
                      )
                    ))}
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-medium">Total Extras:</span>
                      <span className="font-bold" style={{color: colors.yellow}}>${calculateExtrasTotal().toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} plus GST</span>
                    </div>
                  </>
                )}
                
                {/* Total Purchase Price */}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Total Purchase Price:</span>
                  <span className="font-bold text-lg">${(selectedCabin.price + calculateExtrasTotal()).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} plus GST</span>
                </div>

                {/* Expected ROI Display */}
                {(() => {
                  const selectedExtrasList = Object.keys(selectedExtras).filter(key => selectedExtras[key]);
                  const expectedROI = calculateROI(selectedCabinForInvestment, 66, defaultNightlyRates[selectedCabinForInvestment], selectedExtrasList);
                  const baseROI = calculateROI(selectedCabinForInvestment, 66, defaultNightlyRates[selectedCabinForInvestment], []);
                  const roiImprovement = expectedROI.roi - baseROI.roi;
                  const annualIncomeImprovement = expectedROI.netIncome - baseROI.netIncome;
                  
                  return (
                    <div className="mt-4 p-4 rounded-lg border-2" style={{
                      backgroundColor: `${colors.yellow}20`,
                      borderColor: colors.yellow
                    }}>
                      <div className="text-center">
                        <h4 className="font-bold text-lg mb-2" style={{color: colors.darkBlue}}>Expected Annual ROI</h4>
                        <div className="text-3xl font-bold mb-2" style={{color: colors.orange}}>{expectedROI.roi.toFixed(1)}%</div>
                        
                        {/* ROI Improvement */}
                        {roiImprovement > 0 && (
                          <div className="text-sm mb-1" style={{color: '#059669'}}>
                            +{roiImprovement.toFixed(1)}% improvement with selected options
                          </div>
                        )}
                        
                        {/* Annual Income Improvement */}
                        {annualIncomeImprovement > 0 && (
                          <div className="text-sm font-bold mb-2" style={{color: '#059669'}}>
                            +${annualIncomeImprovement.toLocaleString('en-AU', {maximumFractionDigits: 0})} extra annual income
                          </div>
                        )}
                        
                        {/* Base vs Expected Income Comparison */}
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-gray-600">Base Annual Income</div>
                            <div className="font-bold" style={{color: colors.darkBlue}}>
                              ${baseROI.netIncome.toLocaleString('en-AU', {maximumFractionDigits: 0})}
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-gray-600">With Selected Options</div>
                            <div className="font-bold" style={{color: colors.orange}}>
                              ${expectedROI.netIncome.toLocaleString('en-AU', {maximumFractionDigits: 0})}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs mt-2 text-gray-600">
                          Based on 66% occupancy rate and dynamic pricing
                        </div>
                        {selectedExtrasList.length > 0 && (
                          <div className="text-xs mt-1 text-gray-600">
                            Includes {selectedExtrasList.length} selected option{selectedExtrasList.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Wild Things Account Balance Deduction */}
                {isUsingAccountBalance && wildThingsBalance > 0 && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium" style={{color: colors.aqua}}>Less: Wild Things Account Balance:</span>
                    <span className="font-bold text-lg" style={{color: colors.aqua}}>-${wildThingsBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                )}
                
                {/* Adjusted Total After Account Balance */}
                {isUsingAccountBalance && wildThingsBalance > 0 && (
                  <div className="flex justify-between">
                    <span className="font-bold">Adjusted Total Purchase Price:</span>
                    <span className="font-bold text-lg">${Math.max(0, (selectedCabin.price + calculateExtrasTotal()) - wildThingsBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} plus GST</span>
                  </div>
                )}
                
                {/* Payment Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-bold mb-3" style={{color: colors.darkBlue}}>Payment Milestones</div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm" style={{color: colors.darkBlue}}>Holding Deposit</div>
                        <div className="text-xs" style={{color: colors.aqua}}>Due today</div>
                      </div>
                      <div className="font-bold text-sm" style={{color: colors.yellow}}>${Math.max(0, holdingDeposit - (isUsingAccountBalance ? Math.min(wildThingsBalance, holdingDeposit) : 0))}</div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-shrink-0 mr-2">
                        <div className="font-medium text-sm" style={{color: colors.darkBlue}}>30% Deposit</div>
                        <div className="text-xs" style={{color: colors.aqua}}>Due at signing</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm whitespace-nowrap">${(Math.max(0, ((selectedCabin.price + calculateExtrasTotal()) - (isUsingAccountBalance ? wildThingsBalance : 0)) * 0.3)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div className="text-xs">plus GST</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-shrink-0 mr-2">
                        <div className="font-medium text-sm" style={{color: colors.darkBlue}}>30% Progress Payment</div>
                        <div className="text-xs" style={{color: colors.aqua}}>Due at 50% completion</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm whitespace-nowrap">${(Math.max(0, ((selectedCabin.price + calculateExtrasTotal()) - (isUsingAccountBalance ? wildThingsBalance : 0)) * 0.3)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div className="text-xs">plus GST</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div className="flex-shrink-0 mr-2">
                        <div className="font-medium text-sm" style={{color: colors.darkBlue}}>40% Final Payment</div>
                        <div className="text-xs" style={{color: colors.aqua}}>Due at handover</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm whitespace-nowrap">${(Math.max(0, ((selectedCabin.price + calculateExtrasTotal()) - (isUsingAccountBalance ? wildThingsBalance : 0)) * 0.4)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div className="text-xs">plus GST</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Total Amount Due Today */}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-sm">Total Amount Due Today:</span>
                  <span className="font-bold text-lg" style={{color: isUsingAccountBalance && wildThingsBalance >= holdingDeposit ? colors.aqua : colors.yellow}}>
                    ${Math.max(0, holdingDeposit - (isUsingAccountBalance ? Math.min(wildThingsBalance, holdingDeposit) : 0)).toLocaleString()}
                  </span>
                </div>
                
                {/* Account Balance Message */}
                {isUsingAccountBalance && (
                  <div className="mt-2 p-3 rounded" style={{backgroundColor: `${colors.aqua}20`}}>
                    <p className="text-xs" style={{color: colors.darkBlue}}>
                      <strong>Your Wild Things Account balance of ${wildThingsBalance.toLocaleString()}</strong> has been applied to reduce your total purchase price.
                      {wildThingsBalance >= holdingDeposit ? (
                        <> The holding deposit is fully covered.</>
                      ) : (
                        <> ${Math.max(0, holdingDeposit - wildThingsBalance).toLocaleString()} holding deposit due today.</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
              >
                Pay Holding Deposit
              </button>
              <button
                type="button"
                onClick={() => setShowInvestmentModal(false)}
                className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.darkBlue, color: colors.white}}
              >
                Cancel Investment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Register Modal
  const RegisterModal = () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const handleRegister = (e) => {
      e.preventDefault();
      if (formData.password === formData.confirmPassword) {
        // Simulate registration - in real app, this would call your auth API
        setIsLoggedIn(true);
        setShowRegisterModal(false);
        setCurrentPage('investor-portal');
      }
    };

    if (!showRegisterModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Create Your Account
          </h2>
          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{focusRingColor: colors.aqua}}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{focusRingColor: colors.aqua}}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{focusRingColor: colors.aqua}}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{color: colors.darkBlue}}>
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{focusRingColor: colors.aqua}}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.yellow, color: colors.darkBlue}}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                style={{backgroundColor: colors.darkBlue, color: colors.white}}
              >
                Cancel
              </button>
            </div>
          </form>
          <p className="text-center mt-4 text-sm" style={{color: colors.darkBlue}}>
            Already have an account?{' '}
            <button
              onClick={() => {
                setShowRegisterModal(false);
                setShowLoginModal(true);
              }}
              className="font-bold"
              style={{color: colors.aqua}}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Investment Attitude Change Confirmation Modal
  const AttitudeChangeModal = () => {
    if (!showAttitudeChangeModal) return null;

    const newAttitude = pendingAttitudeChange === 'retain' ? 'Retain Money to Reinvest' : 'Payout Monthly';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{zIndex: 9999}}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative" style={{zIndex: 10000}}>
          <h2 className="text-2xl font-bold mb-4 italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            Confirm Investment Attitude Change
          </h2>
          <p className="mb-4" style={{color: colors.darkBlue, fontWeight: '500'}}>
            You're about to change your investment attitude to: <strong>{newAttitude}</strong>
          </p>
          <div className="p-4 rounded-lg mb-6" style={{backgroundColor: `${colors.aqua}20`, border: `2px solid ${colors.aqua}`}}>
            <p className="text-sm" style={{color: colors.darkBlue}}>
              <strong>Please note:</strong> Changing this decision is OK, but any payments will fall on the following month, not now.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked! Confirming attitude change to:', pendingAttitudeChange);
                setInvestmentAttitude(pendingAttitudeChange);
                setShowAttitudeChangeModal(false);
                setPendingAttitudeChange(null);
                console.log('Attitude changed successfully to:', pendingAttitudeChange);
              }}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.yellow, 
                color: colors.darkBlue,
                border: `2px solid ${colors.yellow}`,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              Confirm Change
            </button>
            <button
              onClick={() => {
                setShowAttitudeChangeModal(false);
                setPendingAttitudeChange(null);
              }}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.darkBlue, color: colors.white}}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Boost Marketing Modal
  const BoostModal = () => {
    const [selectedBoostTier, setSelectedBoostTier] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(savedPaymentMethods.find(pm => pm.isDefault)?.id || null);
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCardData, setNewCardData] = useState({
      cardNumber: '',
      expiry: '',
      cvv: '',
      name: '',
      setAsDefault: false
    });

    const boostTiers = [
      {
        id: 'wild',
        name: 'Wild',
        price: 500,
        features: [
          'Featured listing on homepage',
          'Social media posts (2/month)',
          'Email newsletter feature',
          'Priority search placement'
        ]
      },
      {
        id: 'wilder',
        name: 'Wilder',
        price: 1000,
        features: [
          'Everything in Wild',
          'Targeted Facebook ads',
          'Instagram story campaigns',
          'Google Ads placement',
          'Professional photo shoot'
        ],
        popular: true
      },
      {
        id: 'wildest',
        name: 'Wildest',
        price: 2000,
        features: [
          'Everything in Wilder',
          'Dedicated marketing manager',
          'Video content creation',
          'Influencer partnerships',
          'Premium ad placements',
          'Monthly performance reports'
        ]
      }
    ];

    const handleAddCard = () => {
      const newCard = {
        id: (savedPaymentMethods.length + 1).toString(),
        last4: newCardData.cardNumber.slice(-4),
        brand: 'Visa', // Would detect from card number in production
        expiry: newCardData.expiry,
        isDefault: newCardData.setAsDefault || savedPaymentMethods.length === 0
      };

      if (newCard.isDefault) {
        setSavedPaymentMethods(savedPaymentMethods.map(pm => ({...pm, isDefault: false})));
      }

      setSavedPaymentMethods([...savedPaymentMethods, newCard]);
      setSelectedPaymentMethod(newCard.id);
      setShowAddCard(false);
      setNewCardData({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: '',
        setAsDefault: false
      });
    };

    const handleBoostSubmit = () => {
      const tier = boostTiers.find(t => t.id === selectedBoostTier);
      console.log('Boost activated:', {
        investment: selectedInvestmentForBoost,
        tier: tier.name,
        price: tier.price,
        paymentMethod: selectedPaymentMethod
      });
      
      alert(`Boost activated! Your ${tier.name} package ($${tier.price}/month) is now active.`);
      setShowBoostModal(false);
      setSelectedBoostTier(null);
    };

    if (!showBoostModal || !selectedInvestmentForBoost) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={() => setShowBoostModal(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            style={{color: colors.darkBlue}}
          >
            <span className="text-2xl font-bold">×</span>
          </button>

          <h2 className="text-3xl font-bold mb-2 italic" style={{
            fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
            color: colors.darkBlue
          }}>
            🚀 Boost Your Cabin
          </h2>
          <p className="text-sm mb-6" style={{color: colors.darkBlue}}>
            {selectedInvestmentForBoost.cabinType} Cabin - {selectedInvestmentForBoost.location}
          </p>

          {/* Boost Tiers */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>Select Your Marketing Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {boostTiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedBoostTier(tier.id)}
                  className={`relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedBoostTier === tier.id ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    borderColor: selectedBoostTier === tier.id ? colors.orange : colors.aqua,
                    backgroundColor: selectedBoostTier === tier.id ? `${colors.orange}10` : 'white',
                    ringColor: colors.orange
                  }}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2" style={{transform: 'translateX(-50%)'}}>
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{backgroundColor: colors.orange, color: colors.white}}>
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <h4 className="text-xl sm:text-2xl font-bold mb-2 italic" style={{
                    fontFamily: '"Eurostile Condensed", "Arial Black", Impact, sans-serif', fontWeight: '900', fontStyle: 'italic',
                    color: colors.darkBlue
                  }}>
                    {tier.name}
                  </h4>
                  <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" style={{color: colors.orange}}>
                    ${tier.price}
                    <span className="text-xs sm:text-sm font-normal text-gray-600">/month</span>
                  </p>
                  <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span style={{color: colors.aqua, flexShrink: 0}}>✓</span>
                        <span style={{color: colors.darkBlue}}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          {selectedBoostTier && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4" style={{color: colors.darkBlue}}>Payment Method</h3>
              
              {/* Saved Payment Methods */}
              <div className="space-y-3 mb-4">
                {savedPaymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center p-4 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all"
                    style={{
                      borderColor: selectedPaymentMethod === method.id ? colors.orange : colors.lightGray,
                      backgroundColor: selectedPaymentMethod === method.id ? `${colors.orange}10` : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => setSelectedPaymentMethod(method.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{color: colors.darkBlue}}>
                          {method.brand} •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <span className="px-2 py-1 rounded text-xs font-bold" style={{backgroundColor: colors.aqua, color: colors.white}}>
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">Expires {method.expiry}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Add New Card */}
              {!showAddCard ? (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="w-full py-3 rounded-lg font-bold border-2 border-dashed transition-all hover:bg-gray-50"
                  style={{borderColor: colors.aqua, color: colors.darkBlue}}
                >
                  + Add New Card
                </button>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border-2" style={{borderColor: colors.aqua}}>
                  <h4 className="font-bold mb-3" style={{color: colors.darkBlue}}>Add New Card</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{color: colors.darkBlue}}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={newCardData.cardNumber}
                        onChange={(e) => setNewCardData({...newCardData, cardNumber: e.target.value.replace(/\s/g, '')})}
                        maxLength="16"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: colors.darkBlue}}>
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          placeholder="12/25"
                          value={newCardData.expiry}
                          onChange={(e) => setNewCardData({...newCardData, expiry: e.target.value})}
                          maxLength="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{color: colors.darkBlue}}>
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={newCardData.cvv}
                          onChange={(e) => setNewCardData({...newCardData, cvv: e.target.value})}
                          maxLength="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{color: colors.darkBlue}}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={newCardData.name}
                        onChange={(e) => setNewCardData({...newCardData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newCardData.setAsDefault}
                        onChange={(e) => setNewCardData({...newCardData, setAsDefault: e.target.checked})}
                      />
                      <span className="text-sm" style={{color: colors.darkBlue}}>Set as default payment method</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddCard}
                        className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                        style={{backgroundColor: colors.aqua, color: colors.darkBlue}}
                      >
                        Save Card
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCard(false);
                          setNewCardData({
                            cardNumber: '',
                            expiry: '',
                            cvv: '',
                            name: '',
                            setAsDefault: false
                          });
                        }}
                        className="flex-1 py-2 rounded-lg font-bold transition-all hover:opacity-90"
                        style={{backgroundColor: colors.lightGray, color: colors.darkBlue}}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary & Confirm */}
          {selectedBoostTier && selectedPaymentMethod && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-bold mb-2" style={{color: colors.darkBlue}}>Boost Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-bold">{boostTiers.find(t => t.id === selectedBoostTier).name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Cost:</span>
                  <span className="font-bold" style={{color: colors.orange}}>
                    ${boostTiers.find(t => t.id === selectedBoostTier).price}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-bold">
                    {savedPaymentMethods.find(pm => pm.id === selectedPaymentMethod)?.brand} ••••{' '}
                    {savedPaymentMethods.find(pm => pm.id === selectedPaymentMethod)?.last4}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">First Payment:</span>
                  <span className="font-bold text-lg" style={{color: colors.orange}}>
                    ${boostTiers.find(t => t.id === selectedBoostTier).price}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                * Recurring monthly charge. Cancel anytime from your account settings.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBoostSubmit}
              disabled={!selectedBoostTier || !selectedPaymentMethod}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: colors.orange, color: colors.white}}
            >
              Activate Boost
            </button>
            <button
              onClick={() => {
                setShowBoostModal(false);
                setSelectedBoostTier(null);
              }}
              className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{backgroundColor: colors.darkBlue, color: colors.white}}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden" style={{backgroundColor: colors.lightGray, fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif'}}>
      <NavBar />
      
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'holiday-homes' && <HolidayHomesPage />}
      {currentPage === 'locations' && <LocationsPage />}
      {currentPage === 'investor-portal' && <InvestorPortal />}

      <ChatWidget />

      {/* Modals */}
      <LoginModal />
      <RegisterModal />
      <ReservationModal />
      <InvestmentModal />
      <ContractModal />
      <SignatureModal />
      <ExistingOwnerModal />
      <AttitudeChangeModal />
      <BoostModal />

      <footer className="text-white py-12 px-4" style={{backgroundColor: colors.darkBlue}}>
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Wild Things Pty Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WildThingsWebsite;
