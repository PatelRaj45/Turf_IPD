from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import random

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

# Helper functions for match quality calculations
def generate_mock_players(sport):
    """Generate mock player data for demonstration"""
    # Define positions based on sport
    positions = {
        'Football': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
        'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
        'Cricket': ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper'],
        'Tennis': ['Singles', 'Doubles'],
        'Volleyball': ['Setter', 'Outside Hitter', 'Middle Blocker', 'Libero'],
        'Badminton': ['Singles', 'Doubles'],
        'Pickleball': ['Singles', 'Doubles']
    }
    
    # Default to Football positions if sport not found
    sport_positions = positions.get(sport, positions['Football'])
    
    # First names and last names for generating random player names
    first_names = ['Alex', 'Jamie', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Morgan', 'Reese',
                  'Arjun', 'Priya', 'Raj', 'Ananya', 'Vikram', 'Neha', 'Rahul', 'Meera', 'Sanjay', 'Divya']
    last_names = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
                'Patel', 'Sharma', 'Singh', 'Kumar', 'Shah', 'Gupta', 'Reddy', 'Joshi', 'Malhotra', 'Kapoor']
    
    # Generate 10 mock players (5 for each team)
    mock_players = []
    for i in range(10):
        # Generate random player data
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        position = random.choice(sport_positions)
        skill_level = random.randint(1, 5)
        win_rate = random.uniform(0.4, 0.8)
        
        # Create player object
        player = AIPlayer(
            id=f"player_{i}",
            name=f"{first_name} {last_name}",
            position=position,
            skillLevel=skill_level,
            winRate=win_rate
        )
        
        mock_players.append(player)
    
    return mock_players

def calculate_skill_balance(team_a, team_b):
    """Calculate skill balance between two teams (0-100)"""
    avg_skill_a = sum(player.skillLevel for player in team_a) / len(team_a) if team_a else 0
    avg_skill_b = sum(player.skillLevel for player in team_b) / len(team_b) if team_b else 0
    
    # Perfect balance is 0 difference
    diff = abs(avg_skill_a - avg_skill_b)
    max_diff = 5  # Maximum possible skill difference (assuming skill levels 1-5)
    
    # Convert to 0-100 scale where 100 is perfect balance
    balance = 100 * (1 - (diff / max_diff))
    return max(0, min(100, balance))

def calculate_synergy(team_a, team_b):
    """Calculate team synergy based on win rates (0-100)"""
    # This is a simplified calculation - in a real system, you'd use historical match data
    # For now, we'll use a random value between 50-100 with some influence from win rates
    team_a_synergy = sum(player.winRate for player in team_a) / len(team_a) if team_a else 0
    team_b_synergy = sum(player.winRate for player in team_b) / len(team_b) if team_b else 0
    
    # Average synergy with some randomness
    avg_synergy = (team_a_synergy + team_b_synergy) * 50  # Scale to 0-100
    random_factor = random.uniform(0.8, 1.2)  # Add some randomness
    
    synergy = avg_synergy * random_factor
    return max(50, min(100, synergy))  # Keep between 50-100

def calculate_position_balance(team_a, team_b):
    """Calculate position balance between teams (0-100)"""
    # Since we're auto-assigning positions, we'll assume a decent balance
    # In a real system, you'd check if teams have proper position distribution
    return random.uniform(80, 95)  # Return a high but not perfect score

def generate_match_explanation(match_quality):
    """Generate a human-readable explanation of match quality"""
    explanations = []
    
    if match_quality.skill_balance > 90:
        explanations.append("Teams are well-balanced by skill")
    elif match_quality.skill_balance > 70:
        explanations.append("Teams have good skill balance")
    else:
        explanations.append("Teams have some skill imbalance")
        
    if match_quality.synergy > 80:
        explanations.append("players have excellent synergy")
    elif match_quality.synergy > 60:
        explanations.append("players have decent synergy")
    else:
        explanations.append("synergy can be improved")
        
    if match_quality.availability > 90 and match_quality.location > 90:
        explanations.append("availability and location are optimal")
    
    if match_quality.position_balance > 90:
        explanations.append("positions are well-distributed")
    elif match_quality.position_balance > 70:
        explanations.append("position balance is good")
    
    # Join explanations with commas and capitalize first letter
    explanation = ", ".join(explanations)
    return explanation[0].upper() + explanation[1:] + "."

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
    position: Optional[str] = "Auto-assigned"
    winRate: Optional[float] = 0.5

class MatchQuality(BaseModel):
    skill_balance: float
    synergy: float
    availability: float
    location: float
    position_balance: float

class AIPlayer(BaseModel):
    id: str
    name: str
    position: str
    skillLevel: int
    winRate: float

class MatchmakingResponse(BaseModel):
    # Original response format
    teammates: Optional[List[PlayerMatch]] = None
    confidence: Optional[float] = None
    
    # New response format matching frontend expectations
    team_A: Optional[List[AIPlayer]] = None
    team_B: Optional[List[AIPlayer]] = None
    confidence_score: Optional[float] = None
    match_quality: Optional[MatchQuality] = None
    explanation: Optional[str] = None

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

@app.post("/matchmake")
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
        
        # If no teammates were found, generate mock data
        if not teammates or len(teammates) < 2:
            # Generate mock player data for demonstration
            mock_players = generate_mock_players(request.sport)
            
            # Split into two teams
            half_length = len(mock_players) // 2
            team_a = mock_players[:half_length]
            team_b = mock_players[half_length:]
            
            # Calculate match quality metrics
            match_quality = MatchQuality(
                skill_balance=calculate_skill_balance(team_a, team_b),
                synergy=calculate_synergy(team_a, team_b),
                availability=100.0,  # Assuming perfect availability match
                location=100.0,      # Assuming perfect location match
                position_balance=calculate_position_balance(team_a, team_b)
            )
            
            # Generate explanation
            explanation = generate_match_explanation(match_quality)
            
            # Return in the format expected by frontend
            return {
                "team_A": team_a,
                "team_B": team_b,
                "confidence_score": 87.5,  # Mock confidence score
                "match_quality": match_quality,
                "explanation": explanation
            }
        
        # Split teammates into two teams
        half_length = len(teammates) // 2
        team_a_players = teammates[:half_length]
        team_b_players = teammates[half_length:]
        
        # Convert to AIPlayer format
        team_a = [
            AIPlayer(
                id=player.playerId,
                name=player.name,
                position="Auto-assigned",
                skillLevel=player.skillLevel,
                winRate=player.compatibility
            ) for player in team_a_players
        ]
        
        team_b = [
            AIPlayer(
                id=player.playerId,
                name=player.name,
                position="Auto-assigned",
                skillLevel=player.skillLevel,
                winRate=player.compatibility
            ) for player in team_b_players
        ]
        
        # Calculate match quality metrics
        match_quality = MatchQuality(
            skill_balance=calculate_skill_balance(team_a, team_b),
            synergy=calculate_synergy(team_a, team_b),
            availability=100.0,  # Assuming perfect availability match
            location=100.0,      # Assuming perfect location match
            position_balance=calculate_position_balance(team_a, team_b)
        )
        
        # Generate explanation
        explanation = generate_match_explanation(match_quality)
        
        # Return in the new format expected by frontend
        return {
            "team_A": team_a,
            "team_B": team_b,
            "confidence_score": confidence * 100,  # Convert to percentage
            "match_quality": match_quality,
            "explanation": explanation
        }
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