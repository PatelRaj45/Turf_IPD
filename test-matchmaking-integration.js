// test-matchmaking-integration.js
// This script tests the integration between the Node.js backend and FastAPI AI service

import axios from 'axios';

// Configuration
const NODE_BACKEND_URL = 'http://localhost:5000';
const FASTAPI_URL = 'http://localhost:8000';

// Test functions
async function testNodeBackendConnection() {
  try {
    console.log('\n1. Testing Node.js backend connection...');
    const response = await axios.get(`${NODE_BACKEND_URL}/api/health`);
    console.log('✅ Node.js backend is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Node.js backend connection failed:', error.message);
    return false;
  }
}

async function testFastAPIConnection() {
  try {
    console.log('\n2. Testing FastAPI service connection...');
    const response = await axios.get(`${FASTAPI_URL}/sports`);
    console.log('✅ FastAPI service is running. Supported sports:', response.data);
    return true;
  } catch (error) {
    console.error('❌ FastAPI service connection failed:', error.message);
    return false;
  }
}

async function testMatchmakingEndpoint() {
  try {
    console.log('\n3. Testing matchmaking endpoint...');
    const mockPlayerData = {
      playerId: 'test-player-123',
      skillLevel: 3,
      sport: 'Cricket',
      location: 'Mumbai',
      availability: 'Weekend'
    };
    
    const response = await axios.post(`${NODE_BACKEND_URL}/api/matchmaking/recommendations`, mockPlayerData);
    console.log('✅ Matchmaking endpoint working. Received recommendations:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Matchmaking endpoint test failed:', error.message);
    return false;
  }
}

async function testUpdateEndpoint() {
  try {
    console.log('\n4. Testing update endpoint...');
    const mockMatchResult = {
      playerId: 'test-player-123',
      matchId: 'test-match-456',
      sport: 'Cricket',
      result: 'win',
      teammates: ['teammate-1', 'teammate-2'],
      opponents: ['opponent-1', 'opponent-2']
    };
    
    const response = await axios.post(`${NODE_BACKEND_URL}/api/matchmaking/update`, mockMatchResult);
    console.log('✅ Update endpoint working. Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Update endpoint test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 STARTING INTEGRATION TESTS');
  console.log('============================');
  
  const nodeBackendRunning = await testNodeBackendConnection();
  const fastAPIRunning = await testFastAPIConnection();
  
  if (nodeBackendRunning && fastAPIRunning) {
    await testMatchmakingEndpoint();
    await testUpdateEndpoint();
  } else {
    console.log('\n❌ Skipping API tests because one or more services are not running');
  }
  
  console.log('\n============================');
  console.log('🏁 INTEGRATION TESTS COMPLETED');
}

// Execute tests
runTests();