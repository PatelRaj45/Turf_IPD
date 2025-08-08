// Test script for Advanced Football Matchmaking Assistant

import {
  generateOptimalTeams,
  formatMatchmakingOutput,
  updateAIModel,
  calculateMatchQuality
} from './advanced-football-matchmaking.js';

// Main test function
async function runTests() {
  console.log('=== Testing TurfX Advanced Football Matchmaking System ===\n');

  // Test 1: Local algorithm matchmaking
  console.log('1. Testing local matchmaking algorithm:');
  try {
    const localResult = await generateOptimalTeams(false); // Don't use AI service
    
    if (localResult.success) {
      console.log(`✅ Successfully generated teams with confidence score: ${(localResult.confidence * 100).toFixed(1)}%`);
      console.log(`✅ Team A has ${localResult.teamA.length} players`);
      console.log(`✅ Team B has ${localResult.teamB.length} players`);
      
      // Print team details
      console.log('\nTeam A:');
      localResult.teamA.forEach(player => {
        console.log(`  - ${player.name} (${player.position}, Skill: ${player.skillLevel}/5)`);
      });
      
      console.log('\nTeam B:');
      localResult.teamB.forEach(player => {
        console.log(`  - ${player.name} (${player.position}, Skill: ${player.skillLevel}/5)`);
      });
      
      // Print match quality metrics
      console.log('\nMatch Quality Metrics:');
      console.log(`- Skill Balance: ${(localResult.matchQuality.balance * 100).toFixed(1)}%`);
      console.log(`- Team Synergy: ${(localResult.matchQuality.synergy * 100).toFixed(1)}%`);
      console.log(`- Availability Match: ${(localResult.matchQuality.availability * 100).toFixed(1)}%`);
      console.log(`- Location Compatibility: ${(localResult.matchQuality.location * 100).toFixed(1)}%`);
      console.log(`- Position Balance: ${(localResult.matchQuality.positions * 100).toFixed(1)}%`);
    } else {
      console.log(`❌ Failed to generate teams: ${localResult.message}`);
    }
  } catch (error) {
    console.error(`❌ Error in local matchmaking test: ${error.message}`);
  }
  
  // Test 2: Try AI service matchmaking (may fail if service is not running)
  console.log('\n2. Testing AI service matchmaking:');
  try {
    const aiResult = await generateOptimalTeams(true); // Try to use AI service
    
    if (aiResult.success) {
      console.log(`✅ Successfully generated teams with AI service`);
      if (aiResult.aiConfidence !== undefined) {
        console.log(`✅ AI confidence: ${(aiResult.aiConfidence * 100).toFixed(1)}%`);
      } else {
        console.log(`ℹ️ Fell back to local algorithm (AI service may not be available)`);
      }
      
      // Print the full formatted output
      console.log('\nFull matchmaking recommendation:');
      console.log(formatMatchmakingOutput(aiResult));
    } else {
      console.log(`ℹ️ AI service test: ${aiResult.message}`);
    }
  } catch (error) {
    console.error(`❌ Error in AI service test: ${error.message}`);
  }
  
  // Test 3: Simulate match outcome and model update
  console.log('\n3. Testing model update with match results:');
  try {
    // First get teams
    const matchResult = await generateOptimalTeams(false);
    
    if (matchResult.success) {
      // Simulate a match outcome
      const teamAScore = 3;
      const teamBScore = 1;
      console.log(`Simulated match result: Team A ${teamAScore} - ${teamBScore} Team B`);
      
      // Update the model
      const matchId = `test_match_${Date.now()}`;
      const updateResult = await updateAIModel(
        matchId,
        matchResult.teamA,
        matchResult.teamB,
        teamAScore,
        teamBScore
      );
      
      if (updateResult.success) {
        console.log(`✅ ${updateResult.message}`);
        
        // Generate new recommendations after update
        console.log('\nGenerating new recommendations after model update:');
        const updatedResult = await generateOptimalTeams(false);
        
        if (updatedResult.success) {
          console.log(`✅ Successfully generated updated teams`);
          console.log(`✅ New confidence score: ${(updatedResult.confidence * 100).toFixed(1)}%`);
          
          // Check if synergy scores changed
          const oldSynergy = matchResult.matchQuality.synergy;
          const newSynergy = updatedResult.matchQuality.synergy;
          console.log(`Synergy score change: ${oldSynergy.toFixed(3)} → ${newSynergy.toFixed(3)}`);
        } else {
          console.log(`❌ Failed to generate updated teams: ${updatedResult.message}`);
        }
      } else {
        console.log(`❌ Failed to update model: ${updateResult.message}`);
      }
    } else {
      console.log(`❌ Cannot test model update: ${matchResult.message}`);
    }
  } catch (error) {
    console.error(`❌ Error in model update test: ${error.message}`);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution error:', error);
});