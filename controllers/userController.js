import User from '../models/User.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id of ${req.params.id}`
      });
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id of ${req.params.id}`
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user preferences
 * @route   PUT /api/users/preferences
 * @access  Private
 */
export const updateUserPreferences = async (req, res, next) => {
  try {
    const { favoriteSports, preferredLocations, skillLevel, availability } = req.body;

    const updateData = {};
    if (favoriteSports) updateData.favoriteSports = favoriteSports;
    if (preferredLocations) updateData.preferredLocations = preferredLocations;
    if (skillLevel) updateData.skillLevel = skillLevel;
    if (availability) updateData.availability = availability;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private
 */
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookings')
      .populate('teams');

    // Calculate statistics
    const totalBookings = user.bookings?.length || 0;
    const totalTeams = user.teams?.length || 0;
    const completedBookings = user.bookings?.filter(b => b.bookingStatus === 'completed').length || 0;
    const upcomingBookings = user.bookings?.filter(b => b.bookingStatus === 'confirmed').length || 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalTeams,
        completedBookings,
        upcomingBookings,
        winRate: user.winRate || 0,
        skillLevel: user.skillLevel || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { q, sport, skillLevel, location } = req.query;
    
    let query = User.find().select('-password');

    // Text search
    if (q) {
      query = query.or([
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]);
    }

    // Sport filter
    if (sport) {
      query = query.where('favoriteSports').in([sport]);
    }

    // Skill level filter
    if (skillLevel) {
      query = query.where('skillLevel').gte(parseInt(skillLevel));
    }

    // Location filter
    if (location) {
      query = query.where('address.city').regex(new RegExp(location, 'i'));
    }

    const users = await query.limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user recommendations
 * @route   GET /api/users/recommendations
 * @access  Private
 */
export const getUserRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find users with similar preferences
    const recommendations = await User.find({
      _id: { $ne: req.user.id },
      favoriteSports: { $in: user.favoriteSports || [] },
      skillLevel: { $gte: user.skillLevel - 1, $lte: user.skillLevel + 1 }
    })
    .select('-password')
    .limit(10);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};