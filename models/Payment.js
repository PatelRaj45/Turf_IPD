import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  currency: {
    type: String,
    default: 'INR',
    required: [true, 'Currency is required']
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'cash', 'other'],
    required: [true, 'Payment method is required']
  },
  paymentGatewayId: {
    type: String,
    required: [true, 'Payment gateway ID is required']
  },
  orderId: {
    type: String
  },
  receiptId: {
    type: String
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: Date,
  refundReason: String,
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'full'],
    default: 'none'
  },
  refundId: String,
  taxAmount: {
    type: Number,
    default: 0
  },
  taxDetails: {
    gst: {
      type: Number,
      default: 0
    },
    cgst: {
      type: Number,
      default: 0
    },
    sgst: {
      type: Number,
      default: 0
    }
  },
  paymentResponse: {
    type: Object
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to calculate refund amount
PaymentSchema.methods.calculateRefundAmount = function(cancellationTime) {
  const booking = this.booking;
  
  if (!booking) {
    return 0;
  }
  
  // Get the booking date and time
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  // Calculate hours difference
  const hoursDifference = (bookingDateTime - cancellationTime) / (1000 * 60 * 60);
  
  // Refund policy
  if (hoursDifference >= 48) {
    // Full refund if cancelled 48+ hours in advance
    return this.amount;
  } else if (hoursDifference >= 24) {
    // 75% refund if cancelled 24-48 hours in advance
    return this.amount * 0.75;
  } else if (hoursDifference >= 12) {
    // 50% refund if cancelled 12-24 hours in advance
    return this.amount * 0.5;
  } else if (hoursDifference >= 6) {
    // 25% refund if cancelled 6-12 hours in advance
    return this.amount * 0.25;
  } else {
    // No refund if cancelled less than 6 hours in advance
    return 0;
  }
};

// Static method to generate receipt ID
PaymentSchema.statics.generateReceiptId = function() {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TURFX-${timestamp.substring(timestamp.length - 6)}-${randomNum}`;
};

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;