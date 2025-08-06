import numpy as np
from collections import deque
import random
from typing import Tuple, List

class ReplayBuffer:
    """Experience replay buffer for DQN training"""
    
    def __init__(self, capacity: int = 10000):
        """Initialize replay buffer with given capacity
        
        Args:
            capacity: Maximum number of experiences to store
        """
        self.buffer = deque(maxlen=capacity)
    
    def add(self, state: np.ndarray, action: int, reward: float, 
            next_state: np.ndarray, done: bool):
        """Add an experience to the buffer
        
        Args:
            state: Current state vector
            action: Action taken (0 or 1)
            reward: Reward received
            next_state: Next state vector
            done: Whether the episode is done
        """
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Sample a batch of experiences from the buffer
        
        Args:
            batch_size: Number of experiences to sample
            
        Returns:
            Tuple of (states, actions, rewards, next_states, dones)
        """
        # Ensure we have enough experiences
        batch_size = min(batch_size, len(self.buffer))
        
        # Sample random experiences
        experiences = random.sample(self.buffer, batch_size)
        
        # Unzip the experiences
        states, actions, rewards, next_states, dones = zip(*experiences)
        
        # Convert to numpy arrays
        states = np.array(states)
        actions = np.array(actions)
        rewards = np.array(rewards)
        next_states = np.array(next_states)
        dones = np.array(dones, dtype=np.float32)
        
        return states, actions, rewards, next_states, dones
    
    def __len__(self) -> int:
        """Return the current size of the buffer"""
        return len(self.buffer)
    
    def clear(self):
        """Clear all experiences from the buffer"""
        self.buffer.clear()