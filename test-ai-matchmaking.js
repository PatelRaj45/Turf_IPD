import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:8000';
const NODE_API_URL = 'http://localhost:5000/api';

async function testAIMatchmaking() {
  try {
    console.log('Testing AI Matchmaking Integration...');
    
    // Test 1: Check if FastAPI service is running
    console.log('\n1. Testing FastAPI service...');
    try {
      const sportsResponse = await axios.get(`${AI_SERVICE_URL}/sports`);
      console.log('✅ FastAPI service is running');
      console.log('Available sports:', sportsResponse.data);
    } catch (error) {
      console.error('❌ FastAPI service is not running or not accessible');
      console.error('Error:', error.message);
      return;
    }
    
    // Test 2: Check if Node.js API can access FastAPI service
    console.log('\n2. Testing Node.js API integration with FastAPI...');
    try {
      const nodeSportsResponse = await axios.get(`${NODE_API_URL}/matchmaking/sports`);
      console.log('✅ Node.js API can access FastAPI service');
      console.log('Sports from Node.js API:', nodeSportsResponse.data);
    } catch (error) {
      console.error('❌ Node.js API cannot access FastAPI service');
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
    // Test 3: Test AI matchmaking recommendations
    console.log('\n3. Testing AI matchmaking recommendations...');
    try {
      const playerData = {
        sport: 'Cricket',
        skillLevel: 3,
        location: 'Mumbai',
        availability: 'Evening'
      };
      
      const recommendationsResponse = await axios.post(
        `${NODE_API_URL}/matchmaking/recommendations`,
        playerData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed
            // 'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ AI matchmaking recommendations received');
      console.log('Recommendations:', JSON.stringify(recommendationsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Failed to get AI matchmaking recommendations');
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
    // Test 4: Direct test of FastAPI matchmaking
    console.log('\n4. Testing FastAPI matchmaking directly...');
    try {
      const directMatchmakingResponse = await axios.post(
        `${AI_SERVICE_URL}/matchmake`,
        {
          playerId: 'test123',
          sport: 'Cricket',
          skillLevel: 3,
          location: 'Mumbai',
          availability: 'Evening'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Direct FastAPI matchmaking response received');
      console.log('Response:', JSON.stringify(directMatchmakingResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Failed to get direct FastAPI matchmaking response');
      console.error('Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  } catch (error) {
    console.error('Unexpected error during testing:', error.message);
  }
}

testAIMatchmaking();