import Team from '../models/Team.js';
import User from '../models/User.js';

/**
 * @desc    Get all teams
 * @route   GET /api/teams
 * @access  Public
 */
export const getTeams = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Team.find(JSON.parse(queryStr));

    // Filter private teams for non-authenticated users
    if (!req.user) {
      query = query.find({ isPrivate: false });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Team.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with captain and vice-captain details
    query = query.populate({
      path: 'captain',
      select: 'name'
    }).populate({
      path: 'viceCaptain',
      select: 'name'
    }).populate({
      path: 'homeGround',
      select: 'name location'
    });

    // Executing query
    const teams = await query;

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
      count: teams.length,
      pagination,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single team
 * @route   GET /api/teams/:id
 * @access  Public/Private (depends on team privacy)
 */
export const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'captain',
        select: 'name email'
      })
      .populate({
        path: 'viceCaptain',
        select: 'name email'
      })
      .populate({
        path: 'homeGround',
        select: 'name location photos'
      })
      .populate({
        path: 'members.user',
        select: 'name email'
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Check if team is private and user is not authenticated
    if (team.isPrivate && !req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this team'
      });
    }

    // Check if team is private and user is not a member or admin
    if (
      team.isPrivate &&
      !team.isMember(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new team
 * @route   POST /api/teams
 * @access  Private
 */
export const createTeam = async (req, res, next) => {
  try {
    // Set captain to current user
    req.body.captain = req.user.id;

    // Create team
    const team = await Team.create(req.body);

    // Add captain to members array
    team.members.push({
      user: req.user.id,
      role: req.body.captainRole || 'all-rounder',
      joinedAt: Date.now(),
      status: 'active'
    });

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id }
    });

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update team
 * @route   PUT /api/teams/:id
 * @access  Private (Team Captain/Admin)
 */
export const updateTeam = async (req, res, next) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Make sure user is team captain or admin
    if (
      team.captain.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this team'
      });
    }

    // Don't allow changing captain through this route
    if (req.body.captain) {
      delete req.body.captain;
    }

    // Update team
    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete team
 * @route   DELETE /api/teams/:id
 * @access  Private (Team Captain/Admin)
 */
export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Make sure user is team captain or admin
    if (
      team.captain.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this team'
      });
    }

    // Remove team from all members' teams array
    for (const member of team.members) {
      await User.findByIdAndUpdate(member.user, {
        $pull: { teams: team._id }
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add team member
 * @route   POST /api/teams/:id/members
 * @access  Private (Team Captain/Admin)
 */
export const addTeamMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Make sure user is team captain or admin
    if (
      team.captain.toString() !== req.user.id &&
      (team.viceCaptain && team.viceCaptain.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to add members to this team'
      });
    }

    // Check if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id of ${req.body.userId}`
      });
    }

    // Check if user is already a member
    if (team.isMember(req.body.userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this team'
      });
    }

    // Add member to team
    team.members.push({
      user: req.body.userId,
      role: req.body.role || 'other',
      joinedAt: Date.now(),
      status: 'active'
    });

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { teams: team._id }
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove team member
 * @route   DELETE /api/teams/:id/members/:userId
 * @access  Private (Team Captain/Admin)
 */
export const removeTeamMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Make sure user is team captain, the member themselves, or admin
    if (
      team.captain.toString() !== req.user.id &&
      req.params.userId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to remove members from this team'
      });
    }

    // Cannot remove captain
    if (team.captain.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove team captain'
      });
    }

    // Check if user is a member
    if (!team.isMember(req.params.userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is not a member of this team'
      });
    }

    // Remove member from team
    const memberIndex = team.members.findIndex(
      member => member.user.toString() === req.params.userId
    );

    team.members.splice(memberIndex, 1);

    // If removed user was vice-captain, clear that role
    if (team.viceCaptain && team.viceCaptain.toString() === req.params.userId) {
      team.viceCaptain = undefined;
    }

    await team.save();

    // Remove team from user's teams array
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { teams: team._id }
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set vice captain
 * @route   PUT /api/teams/:id/vice-captain
 * @access  Private (Team Captain/Admin)
 */
export const setViceCaptain = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Make sure user is team captain or admin
    if (
      team.captain.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to set vice captain'
      });
    }

    // Check if user is a member
    if (!team.isMember(req.body.userId)) {
      return res.status(400).json({
        success: false,
        error: 'User must be a team member to be vice captain'
      });
    }

    // Set vice captain
    team.viceCaptain = req.body.userId;
    await team.save();

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Transfer captaincy
 * @route   PUT /api/teams/:id/transfer-captaincy
 * @access  Private (Team Captain/Admin)
 */
export const transferCaptaincy = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: `Team not found with id of ${req.params.id}`
      });
    }

    // Make sure user is team captain or admin
    if (
      team.captain.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to transfer captaincy'
      });
    }

    // Check if new captain is a member
    if (!team.isMember(req.body.userId)) {
      return res.status(400).json({
        success: false,
        error: 'New captain must be a team member'
      });
    }

    // Transfer captaincy
    const oldCaptain = team.captain;
    team.captain = req.body.userId;

    // If new captain was vice captain, clear that role
    if (team.viceCaptain && team.viceCaptain.toString() === req.body.userId) {
      team.viceCaptain = oldCaptain; // Optionally make old captain the vice captain
    }

    await team.save();

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user teams
 * @route   GET /api/teams/user
 * @access  Private
 */
export const getUserTeams = async (req, res, next) => {
  try {
    // Find teams where user is a member
    const teams = await Team.find({
      'members.user': req.user.id,
      'members.status': 'active'
    }).populate({
      path: 'captain',
      select: 'name'
    }).populate({
      path: 'homeGround',
      select: 'name location'
    });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};