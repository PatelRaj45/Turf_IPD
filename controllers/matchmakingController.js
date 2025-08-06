import User from '../models/User.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Find compatible players
 * @route   POST /api/matchmaking/find-players
 * @access  Private
 */
export const findCompatiblePlayers = async (req, res, next) => {
  try {
    const { sport, skillLevel, location, date, time } = req.body;
    const userId = req.user.id;

    // Find users with similar preferences
    let query = User.find({
      _id: { $ne: userId },
      favoriteSports: sport,
      skillLevel: { $gte: skillLevel - 1, $lte: skillLevel + 1 }
    }).select('-password');

    // If location is provided, filter by location
    if (location) {
      query = query.where('address.city').regex(new RegExp(location, 'i'));
    }

    const compatiblePlayers = await query.limit(10);

    // Calculate compatibility scores
    const playersWithScores = compatiblePlayers.map(player => {
      const skillMatch = 1 - Math.abs(player.skillLevel - skillLevel) / 5;
      const locationMatch = location && player.address?.city === location ? 1 : 0.5;
      const availabilityMatch = player.availability ? 0.8 : 0.5;
      
      const compatibilityScore = (skillMatch + locationMatch + availabilityMatch) / 3;
      
      return {
        ...player.toObject(),
        compatibilityScore: Math.round(compatibilityScore * 100)
      };
    });

    // Sort by compatibility score
    playersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      data: playersWithScores
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a match request
 * @route   POST /api/matchmaking/create-request
 * @access  Private
 */
export const createMatchRequest = async (req, res, next) => {
  try {
    const { sport, skillLevel, location, date, time, maxPlayers, description } = req.body;
    const userId = req.user.id;

    const matchRequest = {
      creator: userId,
      sport,
      skillLevel,
      location,
      date,
      time,
      maxPlayers,
      description,
      status: 'open',
      players: [userId],
      createdAt: new Date()
    };

    // Store in database (you can create a MatchRequest model)
    // For now, we'll return the request data
    res.status(201).json({
      success: true,
      data: matchRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join a match request
 * @route   POST /api/matchmaking/join-request/:requestId
 * @access  Private
 */
export const joinMatchRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // In a real implementation, you would update the match request
    // For now, we'll return a success response
    res.status(200).json({
      success: true,
      message: 'Successfully joined the match request'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get match recommendations
 * @route   GET /api/matchmaking/recommendations
 * @access  Private
 */
export const getMatchRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { sport, location } = req.query;

    // Find compatible players based on user's preferences
    let query = User.find({
      _id: { $ne: req.user.id },
      favoriteSports: { $in: user.favoriteSports || [] }
    }).select('-password');

    if (sport) {
      query = query.where('favoriteSports').in([sport]);
    }

    if (location) {
      query = query.where('address.city').regex(new RegExp(location, 'i'));
    }

    const recommendations = await query
      .where('skillLevel').gte(user.skillLevel - 1).lte(user.skillLevel + 1)
      .limit(8);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available courts for matchmaking
 * @route   GET /api/matchmaking/available-courts
 * @access  Private
 */
export const getAvailableCourts = async (req, res, next) => {
  try {
    const { sport, date, location } = req.query;

    let query = Turf.find();

    if (sport) {
      query = query.where('sports').in([sport]);
    }

    if (location) {
      query = query.where('location').regex(new RegExp(location, 'i'));
    }

    const turfs = await query.sort({ rating: -1 });

    // Get availability for each turf
    const turfsWithAvailability = await Promise.all(
      turfs.map(async (turf) => {
        if (date) {
          const bookings = await Booking.find({
            turf: turf._id,
            bookingDate: new Date(date),
            bookingStatus: { $in: ['confirmed', 'pending'] }
          });

          const availableSlots = generateAvailableSlots(turf, bookings);
          return {
            ...turf.toObject(),
            availableSlots
          };
        }
        return turf;
      })
    );

    res.status(200).json({
      success: true,
      data: turfsWithAvailability
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send match invitation
 * @route   POST /api/matchmaking/send-invitation
 * @access  Private
 */
export const sendMatchInvitation = async (req, res, next) => {
  try {
    const { targetUserId, sport, date, time, location, message } = req.body;
    const senderId = req.user.id;

    // In a real implementation, you would create an invitation in the database
    const invitation = {
      sender: senderId,
      recipient: targetUserId,
      sport,
      date,
      time,
      location,
      message,
      status: 'pending',
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept/Reject match invitation
 * @route   PUT /api/matchmaking/invitation/:invitationId
 * @access  Private
 */
export const respondToInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { response } = req.body; // 'accept' or 'reject'

    // In a real implementation, you would update the invitation status
    res.status(200).json({
      success: true,
      message: `Invitation ${response}ed successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's match history
 * @route   GET /api/matchmaking/history
 * @access  Private
 */
export const getMatchHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's completed bookings
    const completedBookings = await Booking.find({
      user: userId,
      bookingStatus: 'completed'
    }).populate('turf', 'name location');

    res.status(200).json({
      success: true,
      data: completedBookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to generate available slots
 */
const generateAvailableSlots = (turf, bookings) => {
  const slots = [];
  const startHour = 6;
  const endHour = 22;

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    const isBooked = bookings.some(booking => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      
      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      );
    });

    if (!isBooked) {
      slots.push({
        startTime,
        endTime,
        price: turf.calculatePrice(new Date(), hour)
      });
    }
  }

  return slots;
};