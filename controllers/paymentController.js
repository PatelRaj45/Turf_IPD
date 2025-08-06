import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { verifyRazorpaySignature } from '../utils/cryptoUtils.js';

// Initialize Razorpay with fallback for development environment
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} catch (error) {
  console.warn('Warning: Razorpay initialization failed. Using mock implementation for development.');
  // Mock implementation for development
  razorpay = {
    orders: {
      create: async () => ({
        id: 'order_mock_' + Math.random().toString(36).substring(2, 15),
        amount: 0,
        currency: 'INR'
      })
    },
    payments: {
      fetch: async () => ({
        order_id: 'order_mock_id',
        amount: 0,
        status: 'captured'
      })
    }
  };
}

/**
 * @desc    Create payment order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking not found with id of ${bookingId}`
      });
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to make payment for this booking'
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'This booking is already paid'
      });
    }

    // Generate receipt ID
    const receiptId = Payment.generateReceiptId();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: booking.price * 100, // Amount in paise
      currency: 'INR',
      receipt: receiptId,
      payment_capture: 1 // Auto capture payment
    });

    // Update booking with order ID
    booking.paymentId = order.id;
    await booking.save();

    // Create payment record
    await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: booking.price,
      currency: 'INR',
      paymentMethod: 'razorpay',
      paymentGatewayId: order.id,
      orderId: order.id,
      receiptId,
      status: 'created'
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: booking.price,
        currency: 'INR',
        receipt: receiptId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment by order ID
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Find booking
    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Verify signature using the utility function
    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, process.env.RAZORPAY_KEY_SECRET)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Update payment status
    payment.status = 'captured';
    payment.paymentResponse = req.body;
    await payment.save();

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        booking,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'booking',
        select: 'bookingDate startTime endTime price bookingStatus'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: `Payment not found with id of ${req.params.id}`
      });
    }

    // Check if payment belongs to user or user is admin
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user payments
 * @route   GET /api/payments/me
 * @access  Private
 */
export const getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate({
        path: 'booking',
        select: 'bookingDate startTime endTime price bookingStatus',
        populate: {
          path: 'turf',
          select: 'name location'
        }
      })
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process refund
 * @route   POST /api/payments/:id/refund
 * @access  Private/Admin
 */
export const processRefund = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: `Payment not found with id of ${req.params.id}`
      });
    }

    // Check if payment is already refunded
    if (payment.refundStatus !== 'none') {
      return res.status(400).json({
        success: false,
        error: 'This payment is already refunded'
      });
    }

    // Check if payment is captured
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        error: 'Only captured payments can be refunded'
      });
    }

    // Get refund amount
    const refundAmount = req.body.amount || payment.amount;
    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount cannot exceed payment amount'
      });
    }

    // Process refund with Razorpay
    const refund = await razorpay.payments.refund(payment.paymentGatewayId, {
      amount: refundAmount * 100, // Amount in paise
      notes: {
        reason: req.body.reason || 'Admin initiated refund'
      }
    });

    // Update payment with refund details
    payment.refundAmount = refundAmount;
    payment.refundDate = Date.now();
    payment.refundReason = req.body.reason || 'Admin initiated refund';
    payment.refundStatus = refundAmount === payment.amount ? 'full' : 'partial';
    payment.refundId = refund.id;
    await payment.save();

    // Update booking status if full refund
    if (refundAmount === payment.amount) {
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'refunded';
        booking.bookingStatus = 'cancelled';
        booking.cancellationReason = 'Payment refunded: ' + (req.body.reason || 'Admin initiated');
        await booking.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
        refund
      }
    });
  } catch (error) {
    next(error);
  }
};