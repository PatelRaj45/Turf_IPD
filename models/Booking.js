import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for booking']
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: [true, 'Turf is required for booking']
  },
  sport: {
    type: String,
    required: [true, 'Sport is required for booking'],
    enum: ['Cricket', 'Football', 'Basketball', 'Pickleball', 'Tennis', 'Volleyball', 'Badminton']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use format HH:MM (24-hour)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use format HH:MM (24-hour)']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'cash', 'other'],
    default: 'razorpay'
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancellationReason: {
    type: String
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  additionalServices: [{
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  specialRequests: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
    },
    endDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index to prevent double booking for the same sport
BookingSchema.index(
  { turf: 1, bookingDate: 1, startTime: 1, sport: 1, bookingStatus: 1 },
  { unique: true, partialFilterExpression: { bookingStatus: { $in: ['confirmed', 'pending'] } } }
);

// Calculate total price including additional services
BookingSchema.pre('save', function(next) {
  if (this.additionalServices && this.additionalServices.length > 0) {
    const additionalCost = this.additionalServices.reduce(
      (total, service) => total + (service.price * service.quantity), 0
    );
    this.price += additionalCost;
  }
  next();
});

// Static method to check if a slot is available for a specific sport
BookingSchema.statics.isSlotAvailable = async function(turfId, date, startTime, endTime, sport) {
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);
  
  // First, check if the turf supports the requested sport
  const turf = await mongoose.model('Turf').findById(turfId);
  if (!turf || !turf.sports.includes(sport)) {
    return false; // Sport not supported by this turf
  }
  
  // Then check for overlapping bookings for the same sport
  const overlappingBookings = await this.find({
    turf: turfId,
    bookingDate: bookingDate,
    sport: sport, // Only check conflicts for the same sport
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
  
  return overlappingBookings.length === 0;
};

// Method to calculate refund amount based on cancellation time
BookingSchema.methods.calculateRefundAmount = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  const [hours, minutes] = this.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  // Calculate hours difference
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  
  // Refund policy
  if (hoursDifference >= 48) {
    // Full refund if cancelled 48+ hours in advance
    return this.price;
  } else if (hoursDifference >= 24) {
    // 75% refund if cancelled 24-48 hours in advance
    return this.price * 0.75;
  } else if (hoursDifference >= 12) {
    // 50% refund if cancelled 12-24 hours in advance
    return this.price * 0.5;
  } else if (hoursDifference >= 6) {
    // 25% refund if cancelled 6-12 hours in advance
    return this.price * 0.25;
  } else {
    // No refund if cancelled less than 6 hours in advance
    return 0;
  }
};

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;