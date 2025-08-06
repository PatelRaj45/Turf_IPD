from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

# Import our DQN model and replay buffer
from dqn_model import DQNModel
from replay_buffer import ReplayBuffer

# Create FastAPI app
app = FastAPI(
    title="TurfX AI Matchmaking Service",
    description="AI-powered matchmaking service using Double DQN for multi-sport turf booking app",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize our DQN model and replay buffer
dqn_model = DQNModel()
replay_buffer = ReplayBuffer(capacity=10000)

# Define request/response models
class MatchmakingRequest(BaseModel):
    playerId: str
    skillLevel: int  # 1-5
    sport: str
    location: str
    availability: str

class PlayerMatch(BaseModel):
    playerId: str
    name: str
    skillLevel: int
    compatibility: float
    sport: str

class MatchmakingResponse(BaseModel):
    teammates: List[PlayerMatch]
    confidence: float

class UpdateRequest(BaseModel):
    playerId: str
    matchId: str
    reward: float  # Positive for win, negative for loss
    sport: str
    teammates: List[str]  # List of teammate IDs
    opponents: List[str]  # List of opponent IDs

# Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to TurfX AI Matchmaking Service"}

@app.post("/matchmake", response_model=MatchmakingResponse)
async def matchmake(request: MatchmakingRequest):
    try:
        # Convert request to state vector
        state = dqn_model.create_state_vector(
            player_id=request.playerId,
            skill_level=request.skillLevel,
            sport=request.sport,
            location=request.location,
            availability=request.availability
        )
        
        # Get compatible teammates based on Q-values
        teammates, confidence = dqn_model.get_compatible_teammates(state)
        
        return MatchmakingResponse(
            teammates=teammates,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update")
async def update(request: UpdateRequest):
    try:
        # Get current state
        current_state = dqn_model.get_player_state(request.playerId, request.sport)
        
        # Get next state (after match)
        next_state = dqn_model.update_player_state(
            player_id=request.playerId,
            sport=request.sport,
            reward=request.reward,
            teammates=request.teammates,
            opponents=request.opponents
        )
        
        # Add experience to replay buffer
        action = 1  # 1 for join match, 0 for reject match
        replay_buffer.add(current_state, action, request.reward, next_state, False)
        
        # Train the model
        dqn_model.train(replay_buffer)
        
        # Save the model weights periodically
        dqn_model.save_weights()
        
        return {"message": "Model updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sports")
async def get_supported_sports():
    return {
        "sports": [
            "Cricket",
            "Football",
            "Basketball",
            "Pickleball",
            "Tennis",
            "Volleyball",
            "Badminton"
        ]
    }

if __name__ == "__main__":
    # Create models directory if it doesn't exist
    os.makedirs("models", exist_ok=True)
    
    # Load model weights if they exist
    dqn_model.load_weights_if_exists()
    
    # Run the FastAPI app
    uvicorn.run(app, host="0.0.0.0", port=8000)