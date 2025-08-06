import tensorflow as tf
import numpy as np
import os
import json
from typing import List, Tuple, Dict, Any
from datetime import datetime

# Define constants
STATE_SIZE = 20  # Size of state vector
ACTION_SIZE = 2  # Join match or reject match
BATCH_SIZE = 64  # Batch size for training
GAMMA = 0.95     # Discount factor
LEARNING_RATE = 0.001
TAU = 0.01       # Target network update rate

# Sport encoding mapping
SPORT_ENCODING = {
    "Cricket": 0,
    "Football": 1,
    "Basketball": 2,
    "Pickleball": 3,
    "Tennis": 4,
    "Volleyball": 5,
    "Badminton": 6
}

class DQNModel:
    def __init__(self):
        # Create main and target networks
        self.main_network = self._build_network()
        self.target_network = self._build_network()
        
        # Initialize target network with main network weights
        self.target_network.set_weights(self.main_network.get_weights())
        
        # Player state cache
        self.player_states = {}
        
        # Mock player database for demo purposes
        # In production, this would be replaced with a real database
        self.mock_players = self._initialize_mock_players()
        
    def _build_network(self):
        """Build the DQN neural network"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(STATE_SIZE,)),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(ACTION_SIZE, activation='linear')
        ])
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
            loss='mse'
        )
        
        return model
    
    def _initialize_mock_players(self) -> Dict[str, Dict[str, Any]]:
        """Initialize mock player data for testing"""
        players = {}
        
        # Generate 50 mock players with random attributes
        for i in range(1, 51):
            player_id = f"player_{i}"
            
            # Assign random sports preferences (1-3 sports per player)
            num_sports = np.random.randint(1, 4)
            all_sports = list(SPORT_ENCODING.keys())
            sports = np.random.choice(all_sports, num_sports, replace=False).tolist()
            
            # Create player profile
            players[player_id] = {
                "id": player_id,
                "name": f"Player {i}",
                "sports": {sport: np.random.randint(1, 6) for sport in sports},  # Skill level 1-5 for each sport
                "location": np.random.choice(["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"]),
                "availability": np.random.choice(["Weekday Evenings", "Weekend Mornings", "Weekend Evenings", "Flexible"]),
                "total_games": np.random.randint(0, 50),
                "win_rate": np.random.randint(0, 100),
                "synergy": {}  # Will store teammate synergy scores
            }
        
        return players
    
    def create_state_vector(self, player_id: str, skill_level: int, sport: str, 
                           location: str, availability: str) -> np.ndarray:
        """Convert player attributes to a state vector"""
        # Initialize state vector with zeros
        state = np.zeros(STATE_SIZE)
        
        # Normalize skill level (1-5) to (0.2-1.0)
        state[0] = skill_level / 5.0
        
        # One-hot encode sport (positions 1-7)
        if sport in SPORT_ENCODING:
            sport_idx = SPORT_ENCODING[sport] + 1
            state[sport_idx] = 1.0
        
        # Encode location (positions 8-12)
        # This is simplified; in production, use geolocation coordinates
        locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"]
        if location in locations:
            loc_idx = locations.index(location) + 8
            state[loc_idx] = 1.0
        
        # Encode availability (positions 13-16)
        availability_options = ["Weekday Evenings", "Weekend Mornings", "Weekend Evenings", "Flexible"]
        if availability in availability_options:
            avail_idx = availability_options.index(availability) + 13
            state[avail_idx] = 1.0
        
        # Positions 17-19 reserved for teammate synergy, match history, etc.
        # For now, initialize with random values
        state[17] = np.random.random()  # Teammate synergy score
        state[18] = np.random.random()  # Match history compatibility
        state[19] = np.random.random()  # Additional feature
        
        # Cache the state for this player
        if player_id not in self.player_states:
            self.player_states[player_id] = {}
        
        self.player_states[player_id][sport] = state
        
        return state
    
    def get_player_state(self, player_id: str, sport: str) -> np.ndarray:
        """Get the cached state for a player and sport"""
        if player_id in self.player_states and sport in self.player_states[player_id]:
            return self.player_states[player_id][sport]
        
        # If not found, create a default state
        # In production, this would fetch from database
        if player_id in self.mock_players and sport in self.mock_players[player_id]["sports"]:
            player = self.mock_players[player_id]
            return self.create_state_vector(
                player_id=player_id,
                skill_level=player["sports"][sport],
                sport=sport,
                location=player["location"],
                availability=player["availability"]
            )
        
        # Return zeros if player or sport not found
        return np.zeros(STATE_SIZE)
    
    def update_player_state(self, player_id: str, sport: str, reward: float, 
                           teammates: List[str], opponents: List[str]) -> np.ndarray:
        """Update player state based on match results"""
        # Get current state
        current_state = self.get_player_state(player_id, sport)
        
        # Create a copy to modify
        new_state = current_state.copy()
        
        # Update teammate synergy based on match result
        for teammate_id in teammates:
            if teammate_id in self.mock_players:
                # Update synergy score
                if teammate_id not in self.mock_players[player_id]["synergy"]:
                    self.mock_players[player_id]["synergy"][teammate_id] = 0.5  # Initial value
                
                # Adjust synergy based on reward
                synergy_delta = 0.1 if reward > 0 else -0.05
                new_synergy = self.mock_players[player_id]["synergy"][teammate_id] + synergy_delta
                self.mock_players[player_id]["synergy"][teammate_id] = max(0.0, min(1.0, new_synergy))
        
        # Update state vector with new synergy score (average of all teammates)
        if teammates and any(t in self.mock_players[player_id]["synergy"] for t in teammates):
            synergy_scores = [self.mock_players[player_id]["synergy"].get(t, 0.5) for t in teammates]
            new_state[17] = sum(synergy_scores) / len(synergy_scores)
        
        # Update match history feature
        history_delta = 0.05 if reward > 0 else -0.03
        new_state[18] = max(0.0, min(1.0, new_state[18] + history_delta))
        
        # Cache the updated state
        self.player_states[player_id][sport] = new_state
        
        return new_state
    
    def get_compatible_teammates(self, state: np.ndarray) -> Tuple[List[Dict[str, Any]], float]:
        """Find compatible teammates based on Q-values"""
        compatible_teammates = []
        
        # Extract sport from state vector
        sport_idx = np.argmax(state[1:8]) if np.max(state[1:8]) > 0 else 0
        sport = list(SPORT_ENCODING.keys())[sport_idx]
        
        # Get player skill level from state
        player_skill = state[0] * 5  # Convert back to 1-5 scale
        
        # Find players who play this sport
        for player_id, player_data in self.mock_players.items():
            if sport in player_data["sports"]:
                # Get this player's state
                teammate_state = self.get_player_state(player_id, sport)
                
                # Calculate compatibility score using Q-values
                # Higher Q-value for action 1 (join) indicates better compatibility
                q_values = self.main_network.predict(np.array([state]), verbose=0)[0]
                teammate_q_values = self.main_network.predict(np.array([teammate_state]), verbose=0)[0]
                
                # Compatibility is based on Q-values and skill level similarity
                skill_diff = abs(player_skill - player_data["sports"][sport])
                skill_compatibility = 1.0 - (skill_diff / 5.0)  # 1.0 for same skill, 0.0 for max difference
                
                q_compatibility = (q_values[1] + teammate_q_values[1]) / 2.0
                
                # Combine the two factors
                compatibility = 0.7 * q_compatibility + 0.3 * skill_compatibility
                
                # Add to compatible teammates if above threshold
                if compatibility > 0.4:  # Threshold can be adjusted
                    compatible_teammates.append({
                        "playerId": player_id,
                        "name": player_data["name"],
                        "skillLevel": player_data["sports"][sport],
                        "compatibility": float(compatibility),
                        "sport": sport
                    })
        
        # Sort by compatibility score
        compatible_teammates.sort(key=lambda x: x["compatibility"], reverse=True)
        
        # Limit to top 10 teammates
        compatible_teammates = compatible_teammates[:10]
        
        # Calculate overall confidence score
        confidence = 0.0
        if compatible_teammates:
            confidence = sum(p["compatibility"] for p in compatible_teammates) / len(compatible_teammates)
            confidence = min(confidence * 100, 99.0)  # Convert to percentage, cap at 99%
        
        return compatible_teammates, confidence
    
    def train(self, replay_buffer):
        """Train the DQN model using experience replay"""
        if len(replay_buffer) < BATCH_SIZE:
            return
        
        # Sample a batch of experiences
        states, actions, rewards, next_states, dones = replay_buffer.sample(BATCH_SIZE)
        
        # Double DQN update
        # 1. Get actions from main network
        next_actions = np.argmax(self.main_network.predict(next_states, verbose=0), axis=1)
        
        # 2. Get Q-values from target network
        next_q_values = self.target_network.predict(next_states, verbose=0)
        
        # 3. Calculate target Q-values
        target_q = rewards + (1 - dones) * GAMMA * next_q_values[np.arange(BATCH_SIZE), next_actions]
        
        # 4. Get current Q-values and update with targets
        current_q = self.main_network.predict(states, verbose=0)
        for i in range(BATCH_SIZE):
            current_q[i, actions[i]] = target_q[i]
        
        # 5. Train the main network
        self.main_network.fit(states, current_q, epochs=1, verbose=0)
        
        # 6. Soft update target network
        self._update_target_network()
    
    def _update_target_network(self):
        """Soft update target network weights"""
        main_weights = self.main_network.get_weights()
        target_weights = self.target_network.get_weights()
        
        for i in range(len(target_weights)):
            target_weights[i] = TAU * main_weights[i] + (1 - TAU) * target_weights[i]
        
        self.target_network.set_weights(target_weights)
    
    def save_weights(self, filepath: str = None):
        """Save model weights to file"""
        if filepath is None:
            os.makedirs("models", exist_ok=True)
            filepath = f"models/dqn_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}.h5"
        
        self.main_network.save_weights(filepath)
        
        # Also save a reference to the latest model
        self.main_network.save_weights("models/latest_model.h5")
        
        print(f"Model weights saved to {filepath}")
    
    def load_weights_if_exists(self, filepath: str = "models/latest_model.h5"):
        """Load model weights if file exists"""
        if os.path.exists(filepath):
            try:
                self.main_network.load_weights(filepath)
                self.target_network.load_weights(filepath)
                print(f"Model weights loaded from {filepath}")
                return True
            except Exception as e:
                print(f"Error loading model weights: {e}")
        
        print("No existing model weights found, using initialized weights")
        return False