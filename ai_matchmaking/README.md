# TurfX AI Matchmaking Service

This is the AI matchmaking service for TurfX, a multi-sport turf booking application. The service uses Double DQN (Deep Q-Network) to match players based on skill level, sport, location, availability, and past match history.

## Features

- FastAPI-based REST API
- Double DQN for intelligent matchmaking
- Support for multiple sports (Cricket, Football, Basketball, Pickleball, Tennis, Volleyball, Badminton)
- Experience replay for stable training
- Teammate compatibility scoring

## Project Structure

```
ai_matchmaking/
├── main.py           # FastAPI application
├── dqn_model.py      # Double DQN implementation
├── replay_buffer.py  # Experience replay buffer
├── requirements.txt  # Python dependencies
└── models/           # Directory for saved model weights
```

## Installation

1. Install Python 3.8+ if not already installed

2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Service

1. Start the FastAPI server:
   ```
   python main.py
   ```
   
   Or using uvicorn directly:
   ```
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. The API will be available at http://localhost:8000

## API Endpoints

### GET /
- Description: Root endpoint to check if the service is running
- Response: Welcome message

### POST /matchmake
- Description: Find compatible teammates for a player
- Request Body:
  ```json
  {
    "playerId": "string",
    "skillLevel": 1-5,
    "sport": "string",
    "location": "string",
    "availability": "string"
  }
  ```
- Response:
  ```json
  {
    "teammates": [
      {
        "playerId": "string",
        "name": "string",
        "skillLevel": 1-5,
        "compatibility": 0.0-1.0,
        "sport": "string"
      }
    ],
    "confidence": 0.0-100.0
  }
  ```

### POST /update
- Description: Update the model with match results
- Request Body:
  ```json
  {
    "playerId": "string",
    "matchId": "string",
    "reward": float,
    "sport": "string",
    "teammates": ["string"],
    "opponents": ["string"]
  }
  ```
- Response:
  ```json
  {
    "message": "Model updated successfully"
  }
  ```

### GET /sports
- Description: Get list of supported sports
- Response:
  ```json
  {
    "sports": ["Cricket", "Football", "Basketball", "Pickleball", "Tennis", "Volleyball", "Badminton"]
  }
  ```

## Integration with Node.js Backend

To integrate this service with the main Node.js backend:

1. Start this FastAPI service separately
2. In the Node.js backend, use axios or another HTTP client to make requests to this service
3. Example integration code:

```javascript
// In a Node.js controller
import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:8000';

export const getMatchRecommendations = async (req, res) => {
  try {
    const { userId, sport, location, availability } = req.body;
    
    // Get user's skill level from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Call the AI matchmaking service
    const response = await axios.post(`${AI_SERVICE_URL}/matchmake`, {
      playerId: userId,
      skillLevel: user.skillLevel || 3, // Default to intermediate if not set
      sport,
      location,
      availability
    });
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error getting match recommendations:', error);
    return res.status(500).json({ message: 'Error getting match recommendations' });
  }
};
```

## Model Training

The model trains automatically as match results are reported through the `/update` endpoint. The more matches played, the better the recommendations will become.

## State Vector

The state vector used by the DQN model includes:

- Skill level (normalized to 0.2-1.0)
- Sport (one-hot encoded)
- Location (one-hot encoded)
- Availability (one-hot encoded)
- Teammate synergy score
- Match history compatibility
- Additional features

## Future Improvements

- Add more sophisticated features to the state vector
- Implement a more advanced neural network architecture
- Add support for team vs team matchmaking
- Integrate with a real database instead of mock data
- Add more metrics for match quality