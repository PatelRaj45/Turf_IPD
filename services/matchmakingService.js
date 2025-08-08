import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get AI service URL from environment variables or use default
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Service for interacting with the FastAPI AI matchmaking service
 */
const matchmakingService = {
  /**
   * Get list of supported sports from AI service
   * @returns {Promise<Array>} List of supported sports
   */
  getSports: async () => {
    try {
      console.log(`Fetching sports from AI service at ${AI_SERVICE_URL}/sports`);
      const response = await axios.get(`${AI_SERVICE_URL}/sports`, {
        timeout: 5000 // 5 second timeout
      });
      console.log('Sports data received:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching sports from AI service:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. Is the FastAPI service running?');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out. The FastAPI service might be overloaded or unreachable.');
      }
      throw new Error(`Failed to fetch sports from AI service: ${error.message}`)
    }
  },

  /**
   * Get match recommendations for a player
   * @param {Object} playerData - Player data for matchmaking
   * @param {string} playerData.playerId - Unique ID of the player
   * @param {string} playerData.sport - Sport name (e.g., 'Cricket')
   * @param {number} playerData.skillLevel - Player skill level (1-5)
   * @param {string} playerData.location - Player location
   * @param {string} playerData.availability - Player availability
   * @returns {Promise<Object>} Match recommendations
   */
  getMatchRecommendations: async (playerData) => {
    try {
      console.log(`Sending matchmaking request to ${AI_SERVICE_URL}/matchmake with data:`, playerData);
      const response = await axios.post(`${AI_SERVICE_URL}/matchmake`, playerData, {
        timeout: 8000 // 8 second timeout for potentially longer AI processing
      });
      console.log('Matchmaking response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting match recommendations:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. Is the FastAPI service running?');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out. The AI service might be processing a complex request or is unreachable.');
      }
      throw new Error(`Failed to get match recommendations from AI service: ${error.message}`)
    }
  },

  /**
   * Update AI model with match results
   * @param {Object} matchData - Match result data
   * @param {string} matchData.playerId - Unique ID of the player
   * @param {string} matchData.matchId - Unique ID of the match
   * @param {number} matchData.reward - Reward value (-1 to 1)
   * @param {string} matchData.sport - Sport name
   * @param {Array<string>} matchData.teammates - List of teammate IDs
   * @param {Array<string>} matchData.opponents - List of opponent IDs
   * @returns {Promise<Object>} Update confirmation
   */
  updateModel: async (matchData) => {
    try {
      console.log(`Sending model update request to ${AI_SERVICE_URL}/update with data:`, matchData);
      const response = await axios.post(`${AI_SERVICE_URL}/update`, matchData, {
        timeout: 5000 // 5 second timeout
      });
      console.log('Model update response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating AI model:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused. Is the FastAPI service running?');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out. The AI service might be processing a complex update or is unreachable.');
      }
      throw new Error(`Failed to update AI model with match results: ${error.message}`)
    }
  }
};

export default matchmakingService;