// Test script for Football Matchmaking Assistant

import {
  generateOptimalTeams,
  formatMatchmakingOutput,
  calculateMatchQuality,
  calculateTeamBalance,
  calculateTeamSynergy
} from './football-matchmaking.js';

console.log('=== Testing TurfX Football Matchmaking Assistant ===\n');

// Test the matchmaking algorithm
console.log('1. Testing optimal team generation:');
const matchResult = generateOptimalTeams();

if (matchResult.success) {
  console.log(`✅ Successfully generated teams with confidence score: ${(matchResult.confidence * 100).toFixed(1)}%`);
  
  // Verify team sizes
  console.log(`✅ Team A has ${matchResult.teamA.length} players`);
  console.log(`✅ Team B has ${matchResult.teamB.length} players`);
  
  // Verify team balance
  const balance = calculateTeamBalance(matchResult.teamA, matchResult.teamB);
  console.log(`✅ Team balance score: ${(balance * 100).toFixed(1)}%`);
  
  // Print the full formatted output
  console.log('\n2. Full matchmaking recommendation:');
  console.log(formatMatchmakingOutput(matchResult));
} else {
  console.log(`❌ Failed to generate teams: ${matchResult.message}`);
}

// Test with custom player data
console.log('\n3. Testing with custom player data:');

const customPlayers = [
  { id: 'c1', name: 'Custom1', skill: 'advanced', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.9 },
  { id: 'c2', name: 'Custom2', skill: 'advanced', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.8 },
  { id: 'c3', name: 'Custom3', skill: 'intermediate', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.7 },
  { id: 'c4', name: 'Custom4', skill: 'intermediate', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.7 },
  { id: 'c5', name: 'Custom5', skill: 'beginner', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.5 },
  { id: 'c6', name: 'Custom6', skill: 'beginner', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.4 },
  { id: 'c7', name: 'Custom7', skill: 'advanced', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.9 },
  { id: 'c8', name: 'Custom8', skill: 'intermediate', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.6 },
  { id: 'c9', name: 'Custom9', skill: 'intermediate', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.6 },
  { id: 'c10', name: 'Custom10', skill: 'beginner', location: 'Delhi', availability: 'Weekend Evenings', synergy: 0.5 },
];

// Create two teams manually for testing
const teamA = customPlayers.slice(0, 5);
const teamB = customPlayers.slice(5, 10);

// Calculate and display match quality
const quality = calculateMatchQuality(teamA, teamB);
console.log(`Match quality for custom teams: ${(quality.overall * 100).toFixed(1)}%`);
console.log(`- Skill Balance: ${(quality.balance * 100).toFixed(1)}%`);
console.log(`- Team Synergy: ${(quality.synergy * 100).toFixed(1)}%`);
console.log(`- Availability Match: ${(quality.availability * 100).toFixed(1)}%`);
console.log(`- Location Compatibility: ${(quality.location * 100).toFixed(1)}%`);

console.log('\n=== Test Complete ===');