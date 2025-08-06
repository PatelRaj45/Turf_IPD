import User from '../models/User.js';
import Turf from '../models/Turf.js';
import Booking from '../models/Booking.js';
import Team from '../models/Team.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's bookings
    const userBookings = await Booking.find({ user: userId });
    const totalBookings = userBookings.length;
    const upcomingBookings = userBookings.filter(b => b.bookingStatus === 'confirmed').length;
    const completedBookings = userBookings.filter(b => b.bookingStatus === 'completed').length;

    // Get user's teams
    const userTeams = await Team.find({ members: userId });
    const totalTeams = userTeams.length;

    // Get user's payments
    const userPayments = await Payment.find({ user: userId });
    const totalSpent = userPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get favorite turfs
    const user = await User.findById(userId);
    const favoriteTurfs = await Turf.find({ _id: { $in: user.favoriteLocations || [] } });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        upcomingBookings,
        completedBookings,
        totalTeams,
        totalSpent,
        favoriteTurfs: favoriteTurfs.length,
        userStats: {
          skillLevel: user.skillLevel || 1,
          winRate: user.winRate || 0,
          totalGames: user.totalGames || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's recent activity
 * @route   GET /api/dashboard/activity
 * @access  Private
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get recent bookings
    const recentBookings = await Booking.find({ user: userId })
      .populate('turf', 'name location')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent payments
    const recentPayments = await Payment.find({ user: userId })
      .populate('booking', 'turf')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent team activities
    const userTeams = await Team.find({ members: userId })
      .sort({ updatedAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        recentBookings,
        recentPayments,
        recentTeams: userTeams
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recommended turfs
 * @route   GET /api/dashboard/recommendations
 * @access  Private
 */
export const getRecommendedTurfs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get turfs based on user's favorite sports
    let query = Turf.find();
    
    if (user.favoriteSports && user.favoriteSports.length > 0) {
      query = query.where('sports').in(user.favoriteSports);
    }

    const recommendedTurfs = await query
      .sort({ rating: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: recommendedTurfs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get nearby turfs
 * @route   GET /api/dashboard/nearby
 * @access  Private
 */
export const getNearbyTurfs = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    let query = Turf.find();

    // If coordinates provided, find turfs within radius
    if (latitude && longitude) {
      query = query.where('location').near({
        center: [parseFloat(longitude), parseFloat(latitude)],
        maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        spherical: true
      });
    }

    const nearbyTurfs = await query
      .sort({ rating: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      data: nearbyTurfs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quick actions
 * @route   GET /api/dashboard/quick-actions
 * @access  Private
 */
export const getQuickActions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's upcoming bookings
    const upcomingBookings = await Booking.find({
      user: userId,
      bookingStatus: 'confirmed'
    }).populate('turf', 'name location');

    // Get available time slots for today
    const today = new Date();
    const availableSlots = await getAvailableSlotsForToday();

    // Get user's teams
    const userTeams = await Team.find({ members: userId });

    res.status(200).json({
      success: true,
      data: {
        upcomingBookings,
        availableSlots,
        userTeams,
        quickActions: [
          {
            id: 'book-court',
            title: 'Book a Court',
            description: 'Find and book available courts',
            icon: 'calendar',
            action: 'navigate',
            target: '/booking'
          },
          {
            id: 'find-players',
            title: 'Find Players',
            description: 'Connect with other players',
            icon: 'users',
            action: 'navigate',
            target: '/matchmaking'
          },
          {
            id: 'join-team',
            title: 'Join Team',
            description: 'Join or create a team',
            icon: 'shield',
            action: 'navigate',
            target: '/teams'
          },
          {
            id: 'view-bookings',
            title: 'My Bookings',
            description: 'View your upcoming bookings',
            icon: 'list',
            action: 'navigate',
            target: '/profile'
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available slots for today
 * @route   GET /api/dashboard/available-slots
 * @access  Private
 */
export const getAvailableSlotsForToday = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all turfs
    const turfs = await Turf.find();

    const availableSlots = [];

    for (const turf of turfs) {
      // Get bookings for today
      const todayBookings = await Booking.find({
        turf: turf._id,
        bookingDate: today,
        bookingStatus: { $in: ['confirmed', 'pending'] }
      });

      // Generate available time slots
      const slots = generateTimeSlots(turf, todayBookings);
      
      if (slots.length > 0) {
        availableSlots.push({
          turf: {
            _id: turf._id,
            name: turf.name,
            location: turf.location,
            price: turf.price
          },
          availableSlots: slots
        });
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
};

/**
 * Helper function to generate time slots
 */
const generateTimeSlots = (turf, bookings) => {
  const slots = [];
  const startHour = 6; // 6 AM
  const endHour = 22; // 10 PM
  const slotDuration = 60; // 1 hour

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    // Check if this slot is available
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