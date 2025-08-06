# TurfX AI Matchmaking Integration Guide

## Overview

This document provides a comprehensive guide on how the TurfX AI Matchmaking service is integrated with the main Node.js backend application. The AI matchmaking service uses a Double DQN (Deep Q-Network) algorithm to provide intelligent player matching based on skill levels, preferences, and match history.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  React Frontend │     │  FastAPI        │
│                 │     │  AI Service     │
│  - Components   │     │  - DQN Model    │
│  - Pages        │     │  - Replay Buffer│
│                 │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         ▼                       │
┌─────────────────┐             │
│                 │             │
│  Node.js        │◄────────────┘
│  Backend        │
│                 │
└─────────────────┘
```

## Components

### 1. FastAPI AI Service (`ai_matchmaking/`)

- **main.py**: Entry point for the FastAPI application, defines API endpoints
- **dqn_model.py**: Implements the Double DQN algorithm for matchmaking
- **replay_buffer.py**: Manages experience replay for model training
- **requirements.txt**: Python dependencies

### 2. Node.js Backend Integration

- **controllers/matchmakingController.js**: Handles communication with the AI service
- **routes/matchmaking.js**: Defines API endpoints for matchmaking
- **app.js**: Integrates matchmaking routes into the main application

### 3. Frontend Integration

- **components/MatchmakingForm.tsx**: Form for users to request match recommendations
- **pages/Matchmaking.tsx**: Page that displays the matchmaking interface

## API Endpoints

### Node.js Backend Endpoints

- **GET /api/matchmaking/sports**: Get list of supported sports
- **POST /api/matchmaking/recommendations**: Get match recommendations for a player
- **POST /api/matchmaking/update**: Update the AI model with match results

### FastAPI Service Endpoints

- **GET /sports**: Get list of supported sports
- **POST /matchmake**: Get match recommendations based on player data
- **POST /update**: Update the model with match results

## Data Flow

1. **User Requests Match**:
   - User submits preferences via `MatchmakingForm.tsx`
   - Request sent to Node.js backend `/api/matchmaking/recommendations`
   - Backend forwards request to FastAPI service `/matchmake`
   - AI service returns recommendations
   - Backend formats and returns data to frontend

2. **Match Result Update**:
   - After a match, results are sent to `/api/matchmaking/update`
   - Backend forwards data to FastAPI service `/update`
   - AI model updates its weights based on match outcome
   - Experience stored in replay buffer for future training

## Configuration

The connection between the Node.js backend and FastAPI service is configured via environment variables:

```
# .env file
AI_SERVICE_URL=http://localhost:8000
```

## Starting the Services

Both services can be started simultaneously using the `start-services.js` script:

```bash
npm start
```

This will:
1. Check and install Python dependencies
2. Create necessary directories
3. Start the FastAPI service on port 8000
4. Start the Node.js backend on port 5000

## Testing the Integration

A test script is provided to verify the integration between the services:

```bash
node test-matchmaking-integration.js
```

This script tests:
1. Node.js backend connection
2. FastAPI service connection
3. Matchmaking endpoint functionality
4. Match result update functionality

## Extending the System

### Adding New Sports

To add support for a new sport:

1. Update the `SPORT_ENCODING` in `dqn_model.py`
2. Adjust the state vector size if needed
3. Retrain the model with sample data for the new sport

### Improving the AI Model

The Double DQN model can be improved by:

1. Tuning hyperparameters in `dqn_model.py`
2. Adding more features to the state representation
3. Collecting more match data for training
4. Implementing more sophisticated reward functions

## Troubleshooting

### Common Issues

1. **Services not connecting**:
   - Verify that both services are running
   - Check that the `AI_SERVICE_URL` is correctly set in `.env`
   - Ensure no firewall is blocking the connection

2. **Model not learning**:
   - Check that match results are being properly sent to the `/update` endpoint
   - Verify that the replay buffer is storing experiences
   - Adjust learning rate or other hyperparameters

3. **Poor recommendations**:
   - The model may need more training data
   - Consider adjusting the state representation
   - Review the reward function logic