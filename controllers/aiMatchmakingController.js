import matchmakingService from '../services/matchmakingService.js';


/**
 * @desc    Get supported sports from AI service
 * @route   GET /api/matchmaking/sports
 * @access  Public
 */
export const getSports = async (req, res) => {
  console.log('getSports function called');
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  try {
    console.log('Attempting to fetch sports from matchmakingService');
    const response = await matchmakingService.getSports();
    console.log('Response from AI service:', response.data);
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error in getSports controller:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch sports from AI service',
      message: error.message
    });
  }
};

/**
 * @desc    Get AI-powered match recommendations
 * @route   POST /api/matchmaking/recommendations
 * @access  Private
 */
export const getAIRecommendations = async (req, res, next) => {
  try {
    const { sport, skillLevel, location, availability } = req.body;
    const playerId = req.user.id;
    
    // Validate required fields
    if (!sport || !skillLevel || !location || !availability) {
      return res.status(400).json({
        success: false,
        error: 'Please provide sport, skillLevel, location, and availability'
      });
    }
    
    // Prepare data for AI service
    const playerData = {
      playerId,
      sport,
      skillLevel: parseInt(skillLevel),
      location,
      availability
    };
    
    // Get recommendations from AI service
    const recommendations = await matchmakingService.getMatchRecommendations(playerData);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI recommendations',
      message: error.message
    });
  }
};

/**
 * @desc    Update AI model with match results
 * @route   POST /api/matchmaking/update
 * @access  Private
 */
export const updateAIModel = async (req, res, next) => {
  try {
    const { matchId, reward, sport, teammates, opponents } = req.body;
    const playerId = req.user.id;
    
    // Validate required fields
    if (!matchId || reward === undefined || !sport || !teammates || !opponents) {
      return res.status(400).json({
        success: false,
        error: 'Please provide matchId, reward, sport, teammates, and opponents'
      });
    }
    
    // Prepare data for AI service
    const matchData = {
      playerId,
      matchId,
      reward: parseFloat(reward),
      sport,
      teammates,
      opponents
    };
    
    // Update AI model
    const result = await matchmakingService.updateModel(matchData);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI model update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI model',
      message: error.message
    });
  }
};