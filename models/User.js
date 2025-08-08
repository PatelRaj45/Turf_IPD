import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^(\+?\d{1,3}[- ]?)?\d{5,15}$/, 'Please add a valid phone number']
  },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser; // Password not required for Google users
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  favoriteLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf'
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for bookings
UserSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  // Use a default secret if environment variable is not available
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_only_do_not_use_in_production';
  const expire = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign(
    { id: this._id },
    secret,
    { expiresIn: expire }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;