// Mock RMS Server for Testing
// Run with: node api/mock-rms-server.js
// This simulates RMS Cloud API responses for development

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
const mockBookings = [
  {
    bookingId: 'BK001',
    cabinId: 1,
    ownerId: 'owner@example.com',
    bookingType: 'guest',
    checkInDate: '2025-11-15',
    checkOutDate: '2025-11-18',
    guestName: 'John Smith',
    status: 'confirmed',
    createdAt: '2025-11-01T10:00:00Z',
  },
  {
    bookingId: 'BK002',
    cabinId: 1,
    ownerId: 'owner@example.com',
    bookingType: 'owner',
    checkInDate: '2025-12-20',
    checkOutDate: '2025-12-27',
    guestName: 'Owner Stay',
    status: 'confirmed',
    createdAt: '2025-11-05T14:30:00Z',
  },
];

const mockPeakPeriods = [
  {
    name: 'Christmas Holiday',
    startDate: '2025-12-20',
    endDate: '2026-01-05',
    reason: 'Peak holiday season',
  },
];

// Middleware to check API key
const checkAuth = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (!apiKey || apiKey !== '123') {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
  }
  next();
};

// GET /availability - Fetch availability for a cabin
app.get('/availability', checkAuth, (req, res) => {
  const { cabinId, startDate, endDate } = req.query;
  
  console.log(`[Mock RMS] GET /availability - cabinId: ${cabinId}, dates: ${startDate} to ${endDate}`);
  
  const bookedDates = mockBookings
    .filter(b => b.cabinId === parseInt(cabinId))
    .map(b => {
      const checkIn = new Date(b.checkInDate);
      const checkOut = new Date(b.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      return {
        date: b.checkInDate,
        bookingType: b.bookingType,
        guestName: b.guestName,
        nights: nights,
        bookingId: b.bookingId,
      };
    });
  
  res.json({
    success: true,
    data: {
      cabinId: parseInt(cabinId),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookedDates: bookedDates,
      peakPeriods: mockPeakPeriods,
    },
  });
});

// GET /owner-allowance - Get owner's booking allowance
app.get('/owner-allowance', checkAuth, (req, res) => {
  const { ownerId, cabinId } = req.query;
  
  console.log(`[Mock RMS] GET /owner-allowance - ownerId: ${ownerId}, cabinId: ${cabinId}`);
  
  const ownerBookings = mockBookings.filter(
    b => b.ownerId === ownerId && b.bookingType === 'owner' && b.cabinId === parseInt(cabinId)
  );
  
  const daysUsed = ownerBookings.reduce((total, b) => {
    const checkIn = new Date(b.checkInDate);
    const checkOut = new Date(b.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return total + nights;
  }, 0);
  
  res.json({
    success: true,
    data: {
      ownerId: ownerId,
      cabinId: parseInt(cabinId),
      daysUsed: daysUsed,
      daysLimit: 180,
      daysRemaining: 180 - daysUsed,
      resetDate: '2026-01-01',
      lastUpdated: new Date().toISOString(),
    },
  });
});

// POST /bookings - Create a new booking
app.post('/bookings', checkAuth, (req, res) => {
  const { cabinId, ownerId, checkInDate, checkOutDate, bookingType, guestName } = req.body;
  
  console.log(`[Mock RMS] POST /bookings - Creating ${bookingType} booking for cabin ${cabinId}`);
  
  const newBooking = {
    bookingId: `BK${String(mockBookings.length + 1).padStart(3, '0')}`,
    cabinId: parseInt(cabinId),
    ownerId: ownerId,
    bookingType: bookingType || 'owner',
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    guestName: guestName || 'Owner Stay',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  
  mockBookings.push(newBooking);
  
  res.json({
    success: true,
    message: 'Booking created successfully',
    booking: newBooking,
  });
});

// DELETE /bookings/:bookingId - Cancel a booking
app.delete('/bookings/:bookingId', checkAuth, (req, res) => {
  const { bookingId } = req.params;
  
  console.log(`[Mock RMS] DELETE /bookings/${bookingId} - Cancelling booking`);
  
  const bookingIndex = mockBookings.findIndex(b => b.bookingId === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Booking not found' });
  }
  
  const booking = mockBookings[bookingIndex];
  booking.status = 'cancelled';
  
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    booking: booking,
    daysReturned: nights,
  });
});

// GET /bookings - Get all bookings for a cabin
app.get('/bookings', checkAuth, (req, res) => {
  const { cabinId, startDate, endDate } = req.query;
  
  console.log(`[Mock RMS] GET /bookings - cabinId: ${cabinId}`);
  
  let filteredBookings = mockBookings;
  
  if (cabinId) {
    filteredBookings = filteredBookings.filter(b => b.cabinId === parseInt(cabinId));
  }
  
  res.json({
    success: true,
    data: filteredBookings,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock RMS Server is running' });
});

app.listen(PORT, () => {
  console.log(`\n🎭 Mock RMS Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /availability?cabinId=1&startDate=2025-11-01&endDate=2025-12-31`);
  console.log(`   GET  /owner-allowance?ownerId=owner@example.com&cabinId=1`);
  console.log(`   GET  /bookings?cabinId=1`);
  console.log(`   POST /bookings`);
  console.log(`   DELETE /bookings/:bookingId`);
  console.log(`\n🔑 API Key: 123`);
  console.log(`   Use header: Authorization: Bearer 123\n`);
});

