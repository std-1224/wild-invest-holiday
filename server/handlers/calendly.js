/**
 * Calendly Handler
 * Handles Calendly webhook events and booking management
 */
import { connectDB } from '../lib/db.js';
import CalendlyBooking from '../models/CalendlyBooking.js';
import User from '../models/User.js';
import { verifyToken } from '../lib/jwt.js';

const CALENDLY_API_BASE = 'https://api.calendly.com';
const CALENDLY_TOKEN = process.env.CALENDLY_TOKEN;

/**
 * Helper function to make Calendly API requests
 */
async function calendlyApiRequest(endpoint, options = {}) {
  if (!CALENDLY_TOKEN) {
    throw new Error('CALENDLY_TOKEN not configured');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${CALENDLY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendly API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * POST /api/calendly/webhook
 * Handle Calendly webhook events
 * 
 * Calendly sends webhooks for:
 * - invitee.created (new booking)
 * - invitee.canceled (booking canceled)
 */
export async function handleCalendlyWebhook(req, res) {
  try {
    await connectDB();

    const { event, payload } = req.body;

    console.log('📅 Calendly webhook received:', event);

    // Handle different event types
    switch (event) {
      case 'invitee.created':
        await handleInviteeCreated(payload);
        break;
      case 'invitee.canceled':
        await handleInviteeCanceled(payload);
        break;
      case 'invitee.rescheduled':
        await handleInviteeRescheduled(payload);
        break;
      default:
        console.log(`⚠️  Unhandled Calendly event type: ${event}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('❌ Error processing Calendly webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message,
    });
  }
}

/**
 * Handle invitee.created event (new booking)
 */
async function handleInviteeCreated(payload) {
  const { event, invitee, questions_and_answers } = payload;

  // Try to find user by email
  const user = await User.findOne({ email: invitee.email.toLowerCase() });

  // Determine event type based on event name
  let eventType = 'general_inquiry';
  const eventName = event.name.toLowerCase();
  if (eventName.includes('inspection')) {
    eventType = 'inspection';
  } else if (eventName.includes('consultation') || eventName.includes('owner')) {
    eventType = 'owner_consultation';
  }

  // Parse custom answers
  const customAnswers = (questions_and_answers || []).map(qa => ({
    question: qa.question,
    answer: qa.answer,
  }));

  // Create booking record
  const booking = new CalendlyBooking({
    userId: user?._id || null,
    calendlyEventUri: event.uri,
    calendlyInviteeUri: invitee.uri,
    eventType,
    eventTypeName: event.name,
    inviteeName: invitee.name,
    inviteeEmail: invitee.email.toLowerCase(),
    inviteePhone: invitee.phone_number || '',
    scheduledStartTime: new Date(event.start_time),
    scheduledEndTime: new Date(event.end_time),
    timezone: invitee.timezone || 'Australia/Melbourne',
    location: event.location?.join_url || event.location?.location || '',
    status: 'scheduled',
    customAnswers,
    webhookPayload: payload,
  });

  await booking.save();

  console.log(`✅ Calendly booking created: ${booking._id} for ${invitee.email}`);
}

/**
 * Handle invitee.canceled event (booking canceled)
 */
async function handleInviteeCanceled(payload) {
  const { invitee, cancellation } = payload;

  const booking = await CalendlyBooking.findOne({
    calendlyInviteeUri: invitee.uri,
  });

  if (booking) {
    booking.status = 'canceled';
    booking.canceledAt = new Date(cancellation.canceled_at);
    booking.canceledBy = cancellation.canceled_by || 'invitee';
    booking.cancellationReason = cancellation.reason || '';
    await booking.save();

    console.log(`✅ Calendly booking canceled: ${booking._id}`);
  } else {
    console.warn(`⚠️  Booking not found for invitee URI: ${invitee.uri}`);
  }
}

/**
 * Handle invitee.rescheduled event (booking rescheduled)
 */
async function handleInviteeRescheduled(payload) {
  const { event, invitee, old_invitee, questions_and_answers } = payload;

  // Mark old booking as rescheduled
  const oldBooking = await CalendlyBooking.findOne({
    calendlyInviteeUri: old_invitee.uri,
  });

  if (oldBooking) {
    oldBooking.status = 'rescheduled';
    oldBooking.canceledAt = new Date();
    oldBooking.cancellationReason = 'Rescheduled to new time';
    await oldBooking.save();
    console.log(`✅ Old booking marked as rescheduled: ${oldBooking._id}`);
  }

  // Create new booking for rescheduled time
  const user = await User.findOne({ email: invitee.email.toLowerCase() });

  let eventType = 'general_inquiry';
  const eventName = event.name.toLowerCase();
  if (eventName.includes('inspection')) {
    eventType = 'inspection';
  } else if (eventName.includes('consultation') || eventName.includes('owner')) {
    eventType = 'owner_consultation';
  }

  const customAnswers = (questions_and_answers || []).map(qa => ({
    question: qa.question,
    answer: qa.answer,
  }));

  const newBooking = new CalendlyBooking({
    userId: user?._id || null,
    calendlyEventUri: event.uri,
    calendlyInviteeUri: invitee.uri,
    eventType,
    eventTypeName: event.name,
    inviteeName: invitee.name,
    inviteeEmail: invitee.email.toLowerCase(),
    inviteePhone: invitee.phone_number || '',
    scheduledStartTime: new Date(event.start_time),
    scheduledEndTime: new Date(event.end_time),
    timezone: invitee.timezone || 'Australia/Melbourne',
    location: event.location?.join_url || event.location?.location || '',
    status: 'scheduled',
    customAnswers,
    webhookPayload: payload,
    metadata: {
      rescheduledFrom: oldBooking?._id || null,
    },
  });

  await newBooking.save();
  console.log(`✅ New rescheduled booking created: ${newBooking._id} for ${invitee.email}`);
}

/**
 * GET /api/calendly/bookings
 * Get all bookings for authenticated user
 */
export async function handleGetBookings(req, res) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find bookings by userId or email
    const bookings = await CalendlyBooking.find({
      $or: [
        { userId: user._id },
        { inviteeEmail: user.email.toLowerCase() },
      ],
    })
      .sort({ scheduledStartTime: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching Calendly bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
}

/**
 * GET /api/calendly/bookings/upcoming
 * Get upcoming bookings for authenticated user
 */
export async function handleGetUpcomingBookings(req, res) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find upcoming bookings
    const bookings = await CalendlyBooking.find({
      $or: [
        { userId: user._id },
        { inviteeEmail: user.email.toLowerCase() },
      ],
      status: 'scheduled',
      scheduledStartTime: { $gte: new Date() },
    })
      .sort({ scheduledStartTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message,
    });
  }
}

/**
 * POST /api/calendly/bookings/track
 * Track a booking when user clicks Calendly button (before webhook)
 * This creates a preliminary record that will be updated by webhook
 */
export async function handleTrackBooking(req, res) {
  try {
    await connectDB();

    const { eventType, source } = req.body;

    // Get user if authenticated
    let userId = null;
    let userEmail = null;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user) {
          userId = user._id;
          userEmail = user.email;
        }
      } catch (err) {
        // Not authenticated, continue as guest
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Booking tracking initiated',
      userId,
      userEmail,
    });
  } catch (error) {
    console.error('Error tracking booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to track booking',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/calendly/bookings/:bookingId
 * Cancel a booking in both database AND Calendly via API
 */
export async function handleCancelBooking(req, res) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const { bookingId } = req.params;

    const booking = await CalendlyBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership
    if (booking.userId?.toString() !== decoded.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // Check if already canceled
    if (booking.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already canceled',
      });
    }

    let calendlyCanceled = false;
    let calendlyError = null;

    // Try to cancel in Calendly via API
    if (booking.calendlyInviteeUri && CALENDLY_TOKEN) {
      try {
        // Extract the invitee UUID from the URI
        // URI format: https://api.calendly.com/scheduled_events/{event_uuid}/invitees/{invitee_uuid}
        const inviteeUuid = booking.calendlyInviteeUri.split('/').pop();

        // Cancel the invitee in Calendly
        await calendlyApiRequest(`/scheduled_event_invitees/${inviteeUuid}/cancellation`, {
          method: 'POST',
          body: JSON.stringify({
            reason: 'Canceled by user via Wild Things portal',
          }),
        });

        calendlyCanceled = true;
        console.log(`✅ Canceled booking in Calendly: ${inviteeUuid}`);
      } catch (apiError) {
        console.error('⚠️  Failed to cancel in Calendly API:', apiError.message);
        calendlyError = apiError.message;
        // Continue to update local database even if Calendly API fails
      }
    }

    // Update booking status in database
    booking.status = 'canceled';
    booking.canceledAt = new Date();
    booking.canceledBy = 'invitee';
    booking.cancellationReason = 'Canceled by user via Wild Things portal';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: calendlyCanceled
        ? 'Booking canceled successfully in both Calendly and database'
        : 'Booking canceled in database (Calendly cancellation failed)',
      booking,
      calendlyCanceled,
      calendlyError,
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
}

/**
 * POST /api/calendly/bookings/sync
 * Sync bookings from Calendly API to database
 * Useful for catching missed webhooks or verifying data
 */
export async function handleSyncBookings(req, res) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!CALENDLY_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'Calendly API token not configured',
      });
    }

    let syncedCount = 0;
    let updatedCount = 0;

    try {
      // Get user's Calendly URI (we need to fetch this from Calendly API)
      // For now, we'll sync based on email by fetching all scheduled events

      // Fetch scheduled events from Calendly
      // Note: This requires knowing the user's Calendly user URI
      // For a complete implementation, you'd need to store the Calendly user URI
      // or use the organization endpoint

      const response = await calendlyApiRequest('/scheduled_events', {
        method: 'GET',
      });

      const events = response.collection || [];

      for (const event of events) {
        // Fetch invitees for this event
        const inviteesResponse = await calendlyApiRequest(event.uri + '/invitees');
        const invitees = inviteesResponse.collection || [];

        for (const invitee of invitees) {
          // Check if invitee email matches user
          if (invitee.email.toLowerCase() === user.email.toLowerCase()) {
            // Check if booking exists in database
            const existingBooking = await CalendlyBooking.findOne({
              calendlyInviteeUri: invitee.uri,
            });

            if (existingBooking) {
              // Update existing booking
              existingBooking.status = invitee.status === 'canceled' ? 'canceled' : 'scheduled';
              if (invitee.canceled) {
                existingBooking.canceledAt = new Date(invitee.canceled_at);
                existingBooking.cancellationReason = invitee.cancellation_reason || '';
              }
              await existingBooking.save();
              updatedCount++;
            } else {
              // Create new booking
              const eventType = event.name.toLowerCase().includes('inspection')
                ? 'inspection'
                : event.name.toLowerCase().includes('consultation')
                ? 'owner_consultation'
                : 'general_inquiry';

              const newBooking = new CalendlyBooking({
                userId: user._id,
                calendlyEventUri: event.uri,
                calendlyInviteeUri: invitee.uri,
                eventType,
                eventTypeName: event.name,
                inviteeName: invitee.name,
                inviteeEmail: invitee.email.toLowerCase(),
                scheduledStartTime: new Date(event.start_time),
                scheduledEndTime: new Date(event.end_time),
                timezone: invitee.timezone || 'Australia/Melbourne',
                location: event.location?.join_url || event.location?.location || '',
                status: invitee.status === 'canceled' ? 'canceled' : 'scheduled',
                source: 'direct',
              });

              if (invitee.canceled) {
                newBooking.canceledAt = new Date(invitee.canceled_at);
                newBooking.cancellationReason = invitee.cancellation_reason || '';
              }

              await newBooking.save();
              syncedCount++;
            }
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Bookings synced successfully',
        syncedCount,
        updatedCount,
        totalProcessed: syncedCount + updatedCount,
      });
    } catch (apiError) {
      console.error('Calendly API error during sync:', apiError);
      return res.status(500).json({
        success: false,
        message: 'Failed to sync with Calendly API',
        error: apiError.message,
      });
    }
  } catch (error) {
    console.error('Error syncing bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync bookings',
      error: error.message,
    });
  }
}

/**
 * GET /api/calendly/bookings/:bookingId/verify
 * Verify a single booking against Calendly API
 */
export async function handleVerifyBooking(req, res) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyToken(token);
    const { bookingId } = req.params;

    const booking = await CalendlyBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify ownership
    if (booking.userId?.toString() !== decoded.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this booking',
      });
    }

    if (!CALENDLY_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'Calendly API token not configured',
      });
    }

    try {
      // Fetch invitee from Calendly API
      const inviteeUuid = booking.calendlyInviteeUri.split('/').pop();
      const invitee = await calendlyApiRequest(`/scheduled_event_invitees/${inviteeUuid}`);

      // Check if status matches
      const calendlyStatus = invitee.resource.canceled ? 'canceled' : 'scheduled';
      const statusMatch = booking.status === calendlyStatus;

      // Update if mismatch
      if (!statusMatch) {
        booking.status = calendlyStatus;
        if (invitee.resource.canceled) {
          booking.canceledAt = new Date(invitee.resource.canceled_at);
          booking.cancellationReason = invitee.resource.cancellation_reason || '';
        }
        await booking.save();
      }

      return res.status(200).json({
        success: true,
        message: statusMatch ? 'Booking verified - status matches' : 'Booking updated from Calendly',
        booking,
        calendlyData: invitee.resource,
        statusMatch,
      });
    } catch (apiError) {
      console.error('Calendly API error during verification:', apiError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify with Calendly API',
        error: apiError.message,
      });
    }
  } catch (error) {
    console.error('Error verifying booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify booking',
      error: error.message,
    });
  }
}

