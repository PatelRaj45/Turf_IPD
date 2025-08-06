/**
 * Utility functions for dynamic pricing calculations
 */

/**
 * Calculate dynamic price based on various factors
 * @param {number} basePrice - The base price of the turf
 * @param {Object} factors - Factors affecting the price
 * @param {Date} factors.date - Booking date
 * @param {string} factors.startTime - Start time of booking (HH:MM format)
 * @param {number} factors.duration - Duration in hours
 * @param {number} factors.demandFactor - Current demand factor (0-1)
 * @param {boolean} factors.isWeekend - Whether the booking is on a weekend
 * @param {boolean} factors.isHoliday - Whether the booking is on a holiday
 * @param {boolean} factors.isPeakHour - Whether the booking is during peak hours
 * @param {number} factors.seasonalMultiplier - Seasonal multiplier (0.8-1.5)
 * @returns {number} - The calculated dynamic price
 */
exports.calculateDynamicPrice = (basePrice, factors) => {
  let dynamicPrice = basePrice;
  
  // Weekend pricing (20% increase)
  if (factors.isWeekend) {
    dynamicPrice *= 1.2;
  }
  
  // Holiday pricing (30% increase)
  if (factors.isHoliday) {
    dynamicPrice *= 1.3;
  }
  
  // Peak hour pricing (15% increase)
  if (factors.isPeakHour) {
    dynamicPrice *= 1.15;
  }
  
  // Demand-based pricing (0-25% increase)
  if (factors.demandFactor) {
    dynamicPrice *= (1 + (factors.demandFactor * 0.25));
  }
  
  // Seasonal pricing
  if (factors.seasonalMultiplier) {
    dynamicPrice *= factors.seasonalMultiplier;
  }
  
  // Round to nearest 10
  return Math.round(dynamicPrice / 10) * 10;
};

/**
 * Check if a given date is a weekend
 * @param {Date} date - The date to check
 * @returns {boolean} - True if weekend, false otherwise
 */
exports.isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

/**
 * Check if a given time is during peak hours
 * @param {string} time - Time in HH:MM format
 * @returns {boolean} - True if peak hour, false otherwise
 */
exports.isPeakHour = (time) => {
  const hour = parseInt(time.split(':')[0], 10);
  // Define peak hours (e.g., 6-9 AM and 5-9 PM)
  return (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21);
};

/**
 * Calculate demand factor based on existing bookings
 * @param {number} totalSlots - Total available slots for the time period
 * @param {number} bookedSlots - Number of already booked slots
 * @returns {number} - Demand factor between 0 and 1
 */
exports.calculateDemandFactor = (totalSlots, bookedSlots) => {
  if (totalSlots === 0) return 0;
  const occupancyRate = bookedSlots / totalSlots;
  
  // Exponential demand curve - higher occupancy leads to exponentially higher prices
  return Math.min(Math.pow(occupancyRate, 1.5), 1);
};

/**
 * Get seasonal multiplier based on month
 * @param {Date} date - The date to check
 * @returns {number} - Seasonal multiplier
 */
exports.getSeasonalMultiplier = (date) => {
  const month = date.getMonth(); // 0-11 (Jan-Dec)
  
  // Cricket season in India (October to March: higher prices)
  if (month >= 9 || month <= 2) {
    return 1.3; // Peak season
  }
  // Monsoon season (June to September: lower prices)
  else if (month >= 5 && month <= 8) {
    return 0.8; // Off season
  }
  // Regular season
  else {
    return 1.0;
  }
};

/**
 * Calculate cancellation refund amount
 * @param {number} bookingAmount - Original booking amount
 * @param {Date} bookingDate - The date of the booking
 * @param {Date} cancellationDate - The date of cancellation
 * @returns {number} - Refund amount
 */
exports.calculateRefundAmount = (bookingAmount, bookingDate, cancellationDate) => {
  // Calculate hours difference between booking and cancellation
  const hoursDifference = (bookingDate - cancellationDate) / (1000 * 60 * 60);
  
  // Refund policy:
  // > 72 hours: 90% refund
  // 48-72 hours: 75% refund
  // 24-48 hours: 50% refund
  // 12-24 hours: 25% refund
  // < 12 hours: 0% refund (no refund)
  
  if (hoursDifference > 72) {
    return bookingAmount * 0.9;
  } else if (hoursDifference > 48) {
    return bookingAmount * 0.75;
  } else if (hoursDifference > 24) {
    return bookingAmount * 0.5;
  } else if (hoursDifference > 12) {
    return bookingAmount * 0.25;
  } else {
    return 0; // No refund
  }
};