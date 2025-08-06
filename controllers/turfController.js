import Turf from '../models/Turf.js';

/**
 * @desc    Get all turfs
 * @route   GET /api/turfs
 * @access  Public
 */
export const getTurfs = async (req, res, next) => {
  try {
    let query = Turf.find();

    // Filter by sport if provided
    if (req.query.sport) {
      query = query.where('sports').in([req.query.sport]);
    }

    // Filter by location if provided
    if (req.query.location) {
      query = query.where('location').regex(new RegExp(req.query.location, 'i'));
    }

    // Filter by price range if provided
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter = {};
      if (req.query.minPrice) priceFilter.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.$lte = parseInt(req.query.maxPrice);
      query = query.where('price', priceFilter);
    }

    // Sort by rating, price, or name
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      query = query.sort({ [req.query.sortBy]: sortOrder });
    } else {
      query = query.sort({ rating: -1 }); // Default sort by rating
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Turf.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const turfs = await query;

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
      count: turfs.length,
      pagination,
      data: turfs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single turf
 * @route   GET /api/turfs/:id
 * @access  Public
 */
export const getTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        error: `Turf not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new turf
 * @route   POST /api/turfs
 * @access  Private/Admin
 */
export const createTurf = async (req, res, next) => {
  try {
    const turf = await Turf.create(req.body);

    res.status(201).json({
      success: true,
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update turf
 * @route   PUT /api/turfs/:id
 * @access  Private/Admin
 */
export const updateTurf = async (req, res, next) => {
  try {
    let turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        error: `Turf not found with id of ${req.params.id}`
      });
    }

    turf = await Turf.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: turf
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete turf
 * @route   DELETE /api/turfs/:id
 * @access  Private/Admin
 */
export const deleteTurf = async (req, res, next) => {
  try {
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        error: `Turf not found with id of ${req.params.id}`
      });
    }

    await turf.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get turf availability
 * @route   GET /api/turfs/:id/availability
 * @access  Public
 */
export const getTurfAvailability = async (req, res, next) => {
  try {
    const { date, sport } = req.query;
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        error: `Turf not found with id of ${req.params.id}`
      });
    }

    // Check if sport is supported
    if (sport && !turf.sports.includes(sport)) {
      return res.status(400).json({
        success: false,
        error: `Sport ${sport} is not supported by this turf`
      });
    }

    // Get available time slots for the given date
    const availableSlots = turf.getAvailableSlots(date, sport);

    res.status(200).json({
      success: true,
      data: {
        turf: turf._id,
        date,
        sport,
        availableSlots
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search turfs
 * @route   GET /api/turfs/search
 * @access  Public
 */
export const searchTurfs = async (req, res, next) => {
  try {
    const { q, location, sport, priceRange } = req.query;
    
    let query = Turf.find();

    // Text search
    if (q) {
      query = query.or([
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ]);
    }

    // Location filter
    if (location) {
      query = query.where('location').regex(new RegExp(location, 'i'));
    }

    // Sport filter
    if (sport) {
      query = query.where('sports').in([sport]);
    }

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      const priceFilter = {};
      if (min) priceFilter.$gte = min;
      if (max) priceFilter.$lte = max;
      if (Object.keys(priceFilter).length > 0) {
        query = query.where('price', priceFilter);
      }
    }

    const turfs = await query.sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured turfs
 * @route   GET /api/turfs/featured
 * @access  Public
 */
export const getFeaturedTurfs = async (req, res, next) => {
  try {
    const turfs = await Turf.find({ featured: true })
      .sort({ rating: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get turfs by location
 * @route   GET /api/turfs/location/:location
 * @access  Public
 */
export const getTurfsByLocation = async (req, res, next) => {
  try {
    const turfs = await Turf.find({
      location: { $regex: req.params.location, $options: 'i' }
    }).sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    next(error);
  }
};