import Booking from '../models/Booking.js';
import Turf from '../models/Turf.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
export const getBookings = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, show only their bookings
    if (req.user.role !== 'admin') {
      query = Booking.find({ user: req.user.id });
    } else {
      query = Booking.find();
    }

    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Booking.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Populate with turf and user details
    query = query.populate({
      path: 'turf',
      select: 'name location photos'
    }).populate({
      path: 'user',
      select: 'name email phone'
    });

    // Execute query
    const bookings = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'turf',
        select: 'name location photos'
      })
      .populate({
        path: 'user',
        select: 'name email phone'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking not found with id of ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check if turf exists
    const turf = await Turf.findById(req.body.turf);
    if (!turf) {
      return res.status(404).json({
        success: false,
        error: `Turf not found with id of ${req.body.turf}`
      });
    }

    // Check if the requested sport is supported by this turf
    if (!req.body.sport) {
      return res.status(400).json({
        success: false,
        error: 'Sport is required for booking'
      });
    }

    if (!turf.sports.includes(req.body.sport)) {
      return res.status(400).json({
        success: false,
        error: `The selected turf does not support ${req.body.sport}`
      });
    }

    // Check if slot is available for the requested sport
    const isAvailable = await Booking.isSlotAvailable(
      req.body.turf,
      req.body.bookingDate,
      req.body.startTime,
      req.body.endTime,
      req.body.sport
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        error: `This slot is already booked for ${req.body.sport} or the sport is not available at this turf`
      });
    }

    // Calculate booking duration in minutes
    const [startHour, startMinute] = req.body.startTime.split(':').map(Number);
    const [endHour, endMinute] = req.body.endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

    // Calculate price
    const bookingDate = new Date(req.body.bookingDate);
    const price = turf.calculatePrice(bookingDate, startHour);
    const totalPrice = (price * durationMinutes) / 60; // Price per minute * duration

    // Create booking with calculated duration and price
    const booking = await Booking.create({
      ...req.body,
      duration: durationMinutes,
      price: Math.round(totalPrice)
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
export const updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking not found with id of ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this booking'
      });
    }

    // Check if booking is already confirmed and paid
    if (
      booking.bookingStatus === 'confirmed' &&
      booking.paymentStatus === 'paid' &&
      (req.body.startTime || req.body.endTime || req.body.bookingDate)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify time or date of a confirmed and paid booking'
      });
    }

    // If changing time or date, check availability
    if (req.body.startTime || req.body.endTime || req.body.bookingDate) {
      const startTime = req.body.startTime || booking.startTime;
      const endTime = req.body.endTime || booking.endTime;
      const bookingDate = req.body.bookingDate || booking.bookingDate;

      // Check if slot is available (excluding current booking)
      const bookingsAtSameTime = await Booking.find({
        _id: { $ne: req.params.id },
        turf: booking.turf,
        bookingDate,
        bookingStatus: { $in: ['confirmed', 'pending'] },
        $or: [
          // Case 1: New booking starts during an existing booking
          { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
          // Case 2: New booking ends during an existing booking
          { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
          // Case 3: New booking completely contains an existing booking
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
      });

      if (bookingsAtSameTime.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'This slot is already booked'
        });
      }

      // Recalculate duration and price if time changed
      if (req.body.startTime || req.body.endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        // Get turf for price calculation
        const turf = await Turf.findById(booking.turf);
        const price = turf.calculatePrice(new Date(bookingDate), startHour);
        const totalPrice = (price * durationMinutes) / 60;

        req.body.duration = durationMinutes;
        req.body.price = Math.round(totalPrice);
      }
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking not found with id of ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this booking'
      });
    }

    // Check if booking is already confirmed and paid
    if (
      booking.bookingStatus === 'confirmed' &&
      booking.paymentStatus === 'paid'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a confirmed and paid booking. Please cancel it instead.'
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking not found with id of ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (
      booking.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking is already cancelled
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'This booking is already cancelled'
      });
    }

    // Check if booking is already completed
    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a completed booking'
      });
    }

    // Calculate refund amount if paid
    let refundAmount = 0;
    if (booking.paymentStatus === 'paid') {
      refundAmount = booking.calculateRefundAmount();
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    await booking.save();

    // Process refund if applicable
    if (refundAmount > 0) {
      // In a real app, you would call your payment gateway's refund API here
      // For now, we'll just create a refund record
      const payment = await Payment.findOne({ booking: booking._id });
      if (payment) {
        payment.refundAmount = refundAmount;
        payment.refundDate = Date.now();
        payment.refundReason = booking.cancellationReason;
        payment.refundStatus = refundAmount === booking.price ? 'full' : 'partial';
        await payment.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        booking,
        refundAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user bookings
 * @route   GET /api/bookings/me
 * @access  Private
 */
export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'turf',
        select: 'name location photos'
      })
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};