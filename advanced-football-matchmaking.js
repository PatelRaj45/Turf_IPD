// Advanced Football Matchmaking Assistant for TurfX
// This implementation integrates with the existing AI matchmaking system
// and can learn from match history to improve recommendations

import axios from 'axios';

// Configuration
const AI_SERVICE_URL = 'http://localhost:8000'; // FastAPI service URL

// Synthetic player data with more detailed attributes
const players = [
  {
    id: 'p1', 
    name: 'Alex', 
    skillLevel: 4, // 1-5 scale
    sport: 'Football',
    position: 'Forward',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 15,
    winRate: 0.65,
    synergy: { 'p3': 0.9, 'p5': 0.7, 'p7': 0.8 } // Player ID to synergy score mapping
  },
  {
    id: 'p2', 
    name: 'Raj', 
    skillLevel: 3,
    sport: 'Football', 
    position: 'Midfielder',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 12,
    winRate: 0.58,
    synergy: { 'p4': 0.8, 'p6': 0.7, 'p10': 0.6 }
  },
  {
    id: 'p3', 
    name: 'Sarah', 
    skillLevel: 5,
    sport: 'Football', 
    position: 'Forward',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 20,
    winRate: 0.70,
    synergy: { 'p1': 0.9, 'p7': 0.8, 'p9': 0.7 }
  },
  {
    id: 'p4', 
    name: 'John', 
    skillLevel: 2,
    sport: 'Football', 
    position: 'Defender',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 8,
    winRate: 0.50,
    synergy: { 'p2': 0.8, 'p8': 0.6, 'p10': 0.5 }
  },
  {
    id: 'p5', 
    name: 'Priya', 
    skillLevel: 3,
    sport: 'Football', 
    position: 'Midfielder',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 10,
    winRate: 0.60,
    synergy: { 'p1': 0.7, 'p7': 0.6, 'p9': 0.8 }
  },
  {
    id: 'p6', 
    name: 'Michael', 
    skillLevel: 4,
    sport: 'Football', 
    position: 'Goalkeeper',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 18,
    winRate: 0.67,
    synergy: { 'p2': 0.7, 'p8': 0.8, 'p10': 0.7 }
  },
  {
    id: 'p7', 
    name: 'Ananya', 
    skillLevel: 3,
    sport: 'Football', 
    position: 'Midfielder',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 14,
    winRate: 0.64,
    synergy: { 'p1': 0.8, 'p3': 0.8, 'p5': 0.6 }
  },
  {
    id: 'p8', 
    name: 'David', 
    skillLevel: 2,
    sport: 'Football', 
    position: 'Defender',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 9,
    winRate: 0.44,
    synergy: { 'p4': 0.6, 'p6': 0.8, 'p10': 0.7 }
  },
  {
    id: 'p9', 
    name: 'Neha', 
    skillLevel: 3,
    sport: 'Football', 
    position: 'Defender',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 11,
    winRate: 0.55,
    synergy: { 'p3': 0.7, 'p5': 0.8, 'p7': 0.6 }
  },
  {
    id: 'p10', 
    name: 'James', 
    skillLevel: 5,
    sport: 'Football', 
    position: 'Forward',
    location: 'Mumbai', 
    availability: 'Weekend Evenings', 
    pastMatches: 22,
    winRate: 0.73,
    synergy: { 'p2': 0.6, 'p4': 0.5, 'p6': 0.7 }
  },
  {
    id: 'p11', 
    name: 'Vikram', 
    skillLevel: 3,
    sport: 'Football', 
    position: 'Midfielder',
    location: 'Mumbai', 
    availability: 'Weekday Evenings', 
    pastMatches: 13,
    winRate: 0.62,
    synergy: {}
  },
  {
    id: 'p12', 
    name: 'Emma', 
    skillLevel: 2,
    sport: 'Football', 
    position: 'Defender',
    location: 'Delhi', 
    availability: 'Weekend Mornings', 
    pastMatches: 7,
    winRate: 0.43,
    synergy: {}
  },
  {
    id: 'p13', 
    name: 'Arjun', 
    skillLevel: 4,
    sport: 'Football', 
    position: 'Forward',
    location: 'Bangalore', 
    availability: 'Flexible', 
    pastMatches: 16,
    winRate: 0.69,
    synergy: {}
  },
  {
    id: 'p14', 
    name: 'Sophia', 
    skillLevel: 3,
    sport: 'Football', 
    position: 'Midfielder',
    location: 'Chennai', 
    availability: 'Weekend Evenings', 
    pastMatches: 10,
    winRate: 0.60,
    synergy: {}
  },
  {
    id: 'p15', 
    name: 'Rahul', 
    skillLevel: 1,
    sport: 'Football', 
    position: 'Goalkeeper',
    location: 'Hyderabad', 
    availability: 'Weekday Evenings', 
    pastMatches: 5,
    winRate: 0.40,
    synergy: {}
  }
];

// Calculate team balance score (how well the skills are distributed)
function calculateTeamBalance(teamA, teamB) {
  const teamASkill = teamA.reduce((sum, player) => sum + player.skillLevel, 0) / teamA.length;
  const teamBSkill = teamB.reduce((sum, player) => sum + player.skillLevel, 0) / teamB.length;
  
  // Perfect balance would be 0 difference
  const skillDifference = Math.abs(teamASkill - teamBSkill);
  
  // Convert to a score between 0 and 1 (0 being worst balance, 1 being perfect balance)
  return 1 - (skillDifference / 5); // 5 is the maximum possible difference
}

// Calculate team synergy score based on player relationships
function calculateTeamSynergy(team) {
  let totalSynergy = 0;
  let pairCount = 0;
  
  // Calculate synergy between all pairs of players in the team
  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const player1 = team[i];
      const player2 = team[j];
      
      // Check if players have synergy data with each other
      if (player1.synergy[player2.id]) {
        totalSynergy += player1.synergy[player2.id];
        pairCount++;
      } else if (player2.synergy[player1.id]) {
        totalSynergy += player2.synergy[player1.id];
        pairCount++;
      } else {
        // Default synergy if no data exists
        totalSynergy += 0.5;
        pairCount++;
      }
    }
  }
  
  return pairCount > 0 ? totalSynergy / pairCount : 0.5;
}

// Calculate availability match score
function calculateAvailabilityScore(team, targetTime = 'Weekend Evenings') {
  const availableCount = team.filter(player => 
    player.availability === targetTime || player.availability === 'Flexible'
  ).length;
  
  return availableCount / team.length;
}

// Calculate location compatibility score
function calculateLocationScore(team, targetLocation = 'Mumbai') {
  const sameLocationCount = team.filter(player => player.location === targetLocation).length;
  return sameLocationCount / team.length;
}

// Calculate position balance score (ensure teams have players in all positions)
function calculatePositionBalance(team) {
  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const positionCounts = {};
  
  positions.forEach(pos => positionCounts[pos] = 0);
  team.forEach(player => positionCounts[player.position]++);
  
  // Ideal distribution for 5v5: 1 GK, 1-2 DEF, 1-2 MID, 1-2 FWD
  const hasGoalkeeper = positionCounts['Goalkeeper'] > 0;
  const hasDefender = positionCounts['Defender'] > 0;
  const hasMidfielder = positionCounts['Midfielder'] > 0;
  const hasForward = positionCounts['Forward'] > 0;
  
  // Score based on position coverage
  let score = 0;
  if (hasGoalkeeper) score += 0.25;
  if (hasDefender) score += 0.25;
  if (hasMidfielder) score += 0.25;
  if (hasForward) score += 0.25;
  
  return score;
}

// Calculate overall match quality score with more factors
function calculateMatchQuality(teamA, teamB) {
  const balanceScore = calculateTeamBalance(teamA, teamB);
  const teamASynergy = calculateTeamSynergy(teamA);
  const teamBSynergy = calculateTeamSynergy(teamB);
  const synergyScore = (teamASynergy + teamBSynergy) / 2;
  
  const availabilityScoreA = calculateAvailabilityScore(teamA);
  const availabilityScoreB = calculateAvailabilityScore(teamB);
  const availabilityScore = (availabilityScoreA + availabilityScoreB) / 2;
  
  const locationScoreA = calculateLocationScore(teamA);
  const locationScoreB = calculateLocationScore(teamB);
  const locationScore = (locationScoreA + locationScoreB) / 2;
  
  const positionBalanceA = calculatePositionBalance(teamA);
  const positionBalanceB = calculatePositionBalance(teamB);
  const positionScore = (positionBalanceA + positionBalanceB) / 2;
  
  // Weight the factors to calculate overall match quality
  return {
    overall: 0.3 * balanceScore + 0.25 * synergyScore + 0.15 * availabilityScore + 
             0.1 * locationScore + 0.2 * positionScore,
    balance: balanceScore,
    synergy: synergyScore,
    availability: availabilityScore,
    location: locationScore,
    positions: positionScore
  };
}

// Generate optimal 5v5 teams from available players
async function generateOptimalTeams(useAIService = false) {
  // If using AI service, try to get recommendations from there
  if (useAIService) {
    try {
      const aiRecommendation = await getAIRecommendation();
      if (aiRecommendation.success) {
        return aiRecommendation;
      }
      // If AI service fails, fall back to local algorithm
      console.log('Falling back to local algorithm...');
    } catch (error) {
      console.error('Error connecting to AI service:', error.message);
      console.log('Falling back to local algorithm...');
    }
  }
  
  // Filter players by availability for the match time (for demo, we'll use Weekend Evenings)
  const availablePlayers = players.filter(p => 
    p.availability === 'Weekend Evenings' || p.availability === 'Flexible'
  );
  
  // Ensure we have at least 10 players
  if (availablePlayers.length < 10) {
    return {
      success: false,
      message: `Not enough available players. Need 10, but only ${availablePlayers.length} are available.`
    };
  }
  
  // Sort players by skill to help with initial distribution
  const sortedPlayers = [...availablePlayers].sort((a, b) => b.skillLevel - a.skillLevel);
  
  // Take the top 10 players
  const selectedPlayers = sortedPlayers.slice(0, 10);
  
  // Try multiple team combinations to find the best match
  let bestTeamA = [];
  let bestTeamB = [];
  let bestQuality = { overall: 0 };
  
  // Simple approach: try a few different distributions
  // In a real implementation, this would use a more sophisticated algorithm
  
  // 1. Alternating selection (like playground pick)
  const teamA1 = [];
  const teamB1 = [];
  selectedPlayers.forEach((player, index) => {
    if (index % 2 === 0) teamA1.push(player);
    else teamB1.push(player);
  });
  const quality1 = calculateMatchQuality(teamA1, teamB1);
  
  // 2. Skill-balanced teams (distribute high/low skill players)
  const teamA2 = [selectedPlayers[0], selectedPlayers[3], selectedPlayers[4], selectedPlayers[7], selectedPlayers[9]];
  const teamB2 = [selectedPlayers[1], selectedPlayers[2], selectedPlayers[5], selectedPlayers[6], selectedPlayers[8]];
  const quality2 = calculateMatchQuality(teamA2, teamB2);
  
  // 3. Position-based distribution
  const goalkeepers = selectedPlayers.filter(p => p.position === 'Goalkeeper');
  const defenders = selectedPlayers.filter(p => p.position === 'Defender');
  const midfielders = selectedPlayers.filter(p => p.position === 'Midfielder');
  const forwards = selectedPlayers.filter(p => p.position === 'Forward');
  
  // Try to create balanced teams by position
  const teamA3 = [];
  const teamB3 = [];
  
  // Distribute goalkeepers
  if (goalkeepers.length >= 2) {
    teamA3.push(goalkeepers[0]);
    teamB3.push(goalkeepers[1]);
  } else if (goalkeepers.length === 1) {
    teamA3.push(goalkeepers[0]);
  }
  
  // Distribute defenders
  for (let i = 0; i < defenders.length && (teamA3.length < 5 || teamB3.length < 5); i++) {
    if (teamA3.length <= teamB3.length && teamA3.length < 5) {
      teamA3.push(defenders[i]);
    } else if (teamB3.length < 5) {
      teamB3.push(defenders[i]);
    }
  }
  
  // Distribute midfielders
  for (let i = 0; i < midfielders.length && (teamA3.length < 5 || teamB3.length < 5); i++) {
    if (teamA3.length <= teamB3.length && teamA3.length < 5) {
      teamA3.push(midfielders[i]);
    } else if (teamB3.length < 5) {
      teamB3.push(midfielders[i]);
    }
  }
  
  // Distribute forwards
  for (let i = 0; i < forwards.length && (teamA3.length < 5 || teamB3.length < 5); i++) {
    if (teamA3.length <= teamB3.length && teamA3.length < 5) {
      teamA3.push(forwards[i]);
    } else if (teamB3.length < 5) {
      teamB3.push(forwards[i]);
    }
  }
  
  // Fill remaining spots with any available players
  const remainingPlayers = selectedPlayers.filter(p => 
    !teamA3.includes(p) && !teamB3.includes(p)
  );
  
  for (let i = 0; i < remainingPlayers.length && (teamA3.length < 5 || teamB3.length < 5); i++) {
    if (teamA3.length <= teamB3.length && teamA3.length < 5) {
      teamA3.push(remainingPlayers[i]);
    } else if (teamB3.length < 5) {
      teamB3.push(remainingPlayers[i]);
    }
  }
  
  const quality3 = calculateMatchQuality(teamA3, teamB3);
  
  // Choose the best team configuration
  if (quality1.overall >= quality2.overall && quality1.overall >= quality3.overall) {
    bestTeamA = teamA1;
    bestTeamB = teamB1;
    bestQuality = quality1;
  } else if (quality2.overall >= quality1.overall && quality2.overall >= quality3.overall) {
    bestTeamA = teamA2;
    bestTeamB = teamB2;
    bestQuality = quality2;
  } else {
    bestTeamA = teamA3;
    bestTeamB = teamB3;
    bestQuality = quality3;
  }
  
  return {
    success: true,
    teamA: bestTeamA,
    teamB: bestTeamB,
    confidence: bestQuality.overall,
    matchQuality: bestQuality
  };
}

// Get recommendations from AI service
async function getAIRecommendation() {
  try {
    // Get available sports from AI service
    const sportsResponse = await axios.get(`${AI_SERVICE_URL}/sports`);
    console.log('Available sports:', sportsResponse.data.sports);
    
    // Filter players who play football
    const footballPlayers = players.filter(p => p.sport === 'Football');
    
    // Get recommendations for each player
    const recommendations = [];
    
    for (const player of footballPlayers.slice(0, 5)) { // Limit to 5 players for demo
      const requestData = {
        playerId: player.id,
        skillLevel: player.skillLevel,
        sport: 'Football',
        location: player.location,
        availability: player.availability
      };
      
      const response = await axios.post(`${AI_SERVICE_URL}/matchmake`, requestData);
      recommendations.push({
        player,
        teammates: response.data.teammates,
        confidence: response.data.confidence
      });
    }
    
    // Process recommendations to form teams
    // This is a simplified approach; a real implementation would be more sophisticated
    if (recommendations.length > 0) {
      const teamA = [recommendations[0].player];
      const teamB = [];
      
      // Add recommended teammates to Team A
      const recommendedTeammates = recommendations[0].teammates;
      for (const teammate of recommendedTeammates) {
        const player = footballPlayers.find(p => p.id === teammate.playerId);
        if (player && teamA.length < 5) {
          teamA.push(player);
        }
      }
      
      // Fill remaining spots in Team A
      for (const player of footballPlayers) {
        if (!teamA.includes(player) && teamA.length < 5) {
          teamA.push(player);
        }
      }
      
      // Assign remaining players to Team B
      for (const player of footballPlayers) {
        if (!teamA.includes(player) && teamB.length < 5) {
          teamB.push(player);
        }
      }
      
      // Calculate match quality
      const matchQuality = calculateMatchQuality(teamA, teamB);
      
      return {
        success: true,
        teamA,
        teamB,
        confidence: matchQuality.overall,
        matchQuality,
        aiConfidence: recommendations[0].confidence / 100 // Convert from percentage
      };
    }
    
    throw new Error('No valid recommendations received from AI service');
    
  } catch (error) {
    console.error('AI recommendation error:', error.message);
    return {
      success: false,
      message: `Failed to get AI recommendations: ${error.message}`
    };
  }
}

// Update AI model with match results
async function updateAIModel(matchId, teamA, teamB, teamAScore, teamBScore) {
  try {
    // Determine match outcome
    const teamAWon = teamAScore > teamBScore;
    
    // Update model for each player in Team A
    for (const player of teamA) {
      const updateData = {
        playerId: player.id,
        matchId,
        reward: teamAWon ? 1.0 : -0.5, // Positive reward for win, negative for loss
        sport: 'Football',
        teammates: teamA.filter(p => p.id !== player.id).map(p => p.id),
        opponents: teamB.map(p => p.id)
      };
      
      await axios.post(`${AI_SERVICE_URL}/update`, updateData);
    }
    
    // Update model for each player in Team B
    for (const player of teamB) {
      const updateData = {
        playerId: player.id,
        matchId,
        reward: teamAWon ? -0.5 : 1.0, // Positive reward for win, negative for loss
        sport: 'Football',
        teammates: teamB.filter(p => p.id !== player.id).map(p => p.id),
        opponents: teamA.map(p => p.id)
      };
      
      await axios.post(`${AI_SERVICE_URL}/update`, updateData);
    }
    
    // Update local synergy scores based on match results
    updateLocalSynergyScores(teamA, teamB, teamAWon);
    
    return {
      success: true,
      message: 'AI model updated successfully with match results'
    };
  } catch (error) {
    console.error('Error updating AI model:', error.message);
    return {
      success: false,
      message: `Failed to update AI model: ${error.message}`
    };
  }
}

// Update local synergy scores based on match results
function updateLocalSynergyScores(teamA, teamB, teamAWon) {
  // Update synergy scores for Team A
  for (let i = 0; i < teamA.length; i++) {
    for (let j = i + 1; j < teamA.length; j++) {
      const player1 = teamA[i];
      const player2 = teamA[j];
      
      // Initialize synergy if it doesn't exist
      if (!player1.synergy[player2.id]) player1.synergy[player2.id] = 0.5;
      if (!player2.synergy[player1.id]) player2.synergy[player1.id] = 0.5;
      
      // Update synergy based on match result
      const synergyDelta = teamAWon ? 0.05 : -0.03;
      player1.synergy[player2.id] = Math.max(0, Math.min(1, player1.synergy[player2.id] + synergyDelta));
      player2.synergy[player1.id] = Math.max(0, Math.min(1, player2.synergy[player1.id] + synergyDelta));
    }
  }
  
  // Update synergy scores for Team B
  for (let i = 0; i < teamB.length; i++) {
    for (let j = i + 1; j < teamB.length; j++) {
      const player1 = teamB[i];
      const player2 = teamB[j];
      
      // Initialize synergy if it doesn't exist
      if (!player1.synergy[player2.id]) player1.synergy[player2.id] = 0.5;
      if (!player2.synergy[player1.id]) player2.synergy[player1.id] = 0.5;
      
      // Update synergy based on match result
      const synergyDelta = teamAWon ? -0.03 : 0.05;
      player1.synergy[player2.id] = Math.max(0, Math.min(1, player1.synergy[player2.id] + synergyDelta));
      player2.synergy[player1.id] = Math.max(0, Math.min(1, player2.synergy[player1.id] + synergyDelta));
    }
  }
}

// Format the output for display
function formatMatchmakingOutput(result) {
  if (!result.success) {
    return result.message;
  }
  
  const formatTeam = (team) => {
    return team.map(player => 
      `${player.name} (${player.position}, Skill: ${player.skillLevel}/5, Win Rate: ${(player.winRate * 100).toFixed(0)}%)`
    ).join('\n    ');
  };
  
  const formatQuality = (quality) => {
    return `- Skill Balance: ${(quality.balance * 100).toFixed(1)}%\n` +
           `- Team Synergy: ${(quality.synergy * 100).toFixed(1)}%\n` +
           `- Availability Match: ${(quality.availability * 100).toFixed(1)}%\n` +
           `- Location Compatibility: ${(quality.location * 100).toFixed(1)}%\n` +
           `- Position Balance: ${(quality.positions * 100).toFixed(1)}%`;
  };
  
  let aiInfo = '';
  if (result.aiConfidence !== undefined) {
    aiInfo = `\nAI Confidence: ${(result.aiConfidence * 100).toFixed(1)}%\n` +
             `(Recommendations partially based on AI matchmaking service)`;
  }
  
  return `
=== TurfX AI Matchmaking Recommendation ===

Team A:
    ${formatTeam(result.teamA)}

Team B:
    ${formatTeam(result.teamB)}

Match Confidence Score: ${(result.confidence * 100).toFixed(1)}%${aiInfo}

Match Quality Explanation:
${formatQuality(result.matchQuality)}

This match recommendation is based on player skill levels, positions, team balance,
synergy scores from past matches, availability, and location compatibility.

As more matches are played, the system will learn from outcomes to improve future recommendations.
`;
}

// Main function to demonstrate the matchmaking system
async function demonstrateMatchmaking() {
  console.log('=== TurfX AI Football Matchmaking System ===\n');
  
  // Try to get recommendations using the AI service first
  console.log('Attempting to use AI service for recommendations...');
  const matchResult = await generateOptimalTeams(true);
  
  console.log(formatMatchmakingOutput(matchResult));
  
  // Simulate a match and update the model
  if (matchResult.success) {
    console.log('\n=== Simulating Match Outcome ===');
    
    // Generate random scores
    const teamAScore = Math.floor(Math.random() * 5);
    const teamBScore = Math.floor(Math.random() * 5);
    
    console.log(`Final Score: Team A ${teamAScore} - ${teamBScore} Team B`);
    
    // Update the AI model with match results
    const matchId = `match_${Date.now()}`;
    console.log('\nUpdating AI model with match results...');
    
    const updateResult = await updateAIModel(
      matchId, 
      matchResult.teamA, 
      matchResult.teamB, 
      teamAScore, 
      teamBScore
    );
    
    console.log(updateResult.message);
    
    // Generate new recommendations after model update
    console.log('\n=== Updated Recommendations After Learning ===');
    const updatedResult = await generateOptimalTeams(true);
    console.log(formatMatchmakingOutput(updatedResult));
  }
}

// Export functions for use in other modules
export {
  generateOptimalTeams,
  formatMatchmakingOutput,
  updateAIModel,
  calculateMatchQuality,
  demonstrateMatchmaking
};

// If this script is run directly, demonstrate the matchmaking system
if (import.meta.url === new URL(import.meta.url).href) {
  demonstrateMatchmaking().catch(error => {
    console.error('Error in matchmaking demonstration:', error.message);
  });
}