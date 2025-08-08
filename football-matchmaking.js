// Football Matchmaking Assistant for TurfX
// This script generates balanced 5v5 football teams using synthetic player data

// Synthetic player data with skill levels, availability, and synergy scores
const players = [
  { id: 'p1', name: 'Alex', skill: 'advanced', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.8 },
  { id: 'p2', name: 'Raj', skill: 'intermediate', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.7 },
  { id: 'p3', name: 'Sarah', skill: 'advanced', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.9 },
  { id: 'p4', name: 'John', skill: 'beginner', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.5 },
  { id: 'p5', name: 'Priya', skill: 'intermediate', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.6 },
  { id: 'p6', name: 'Michael', skill: 'advanced', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.8 },
  { id: 'p7', name: 'Ananya', skill: 'intermediate', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.7 },
  { id: 'p8', name: 'David', skill: 'beginner', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.4 },
  { id: 'p9', name: 'Neha', skill: 'intermediate', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.6 },
  { id: 'p10', name: 'James', skill: 'advanced', location: 'Mumbai', availability: 'Weekend Evenings', synergy: 0.9 },
  { id: 'p11', name: 'Vikram', skill: 'intermediate', location: 'Mumbai', availability: 'Weekday Evenings', synergy: 0.7 },
  { id: 'p12', name: 'Emma', skill: 'beginner', location: 'Delhi', availability: 'Weekend Mornings', synergy: 0.5 },
  { id: 'p13', name: 'Arjun', skill: 'advanced', location: 'Bangalore', availability: 'Flexible', synergy: 0.8 },
  { id: 'p14', name: 'Sophia', skill: 'intermediate', location: 'Chennai', availability: 'Weekend Evenings', synergy: 0.6 },
  { id: 'p15', name: 'Rahul', skill: 'beginner', location: 'Hyderabad', availability: 'Weekday Evenings', synergy: 0.4 }
];

// Convert skill levels to numerical values for calculations
function getSkillValue(skill) {
  switch(skill) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    default: return 0;
  }
}

// Calculate availability match score (1 if perfect match, 0.5 if flexible on either side)
function getAvailabilityScore(player1, player2) {
  if (player1.availability === player2.availability) return 1;
  if (player1.availability === 'Flexible' || player2.availability === 'Flexible') return 0.5;
  return 0;
}

// Calculate location match score (1 if same location, 0 otherwise)
function getLocationScore(player1, player2) {
  return player1.location === player2.location ? 1 : 0;
}

// Calculate team balance score (how well the skills are distributed)
function calculateTeamBalance(teamA, teamB) {
  const teamASkill = teamA.reduce((sum, player) => sum + getSkillValue(player.skill), 0) / teamA.length;
  const teamBSkill = teamB.reduce((sum, player) => sum + getSkillValue(player.skill), 0) / teamB.length;
  
  // Perfect balance would be 0 difference
  const skillDifference = Math.abs(teamASkill - teamBSkill);
  
  // Convert to a score between 0 and 1 (0 being worst balance, 1 being perfect balance)
  return 1 - (skillDifference / 3); // 3 is the maximum possible difference
}

// Calculate team synergy score based on individual player synergy values
function calculateTeamSynergy(team) {
  return team.reduce((sum, player) => sum + player.synergy, 0) / team.length;
}

// Calculate overall match quality score
function calculateMatchQuality(teamA, teamB) {
  const balanceScore = calculateTeamBalance(teamA, teamB);
  const teamASynergy = calculateTeamSynergy(teamA);
  const teamBSynergy = calculateTeamSynergy(teamB);
  const synergyScore = (teamASynergy + teamBSynergy) / 2;
  
  // Calculate availability and location compatibility across all players
  let availabilityScore = 0;
  let locationScore = 0;
  const allPlayers = [...teamA, ...teamB];
  
  for (let i = 0; i < allPlayers.length; i++) {
    for (let j = i + 1; j < allPlayers.length; j++) {
      availabilityScore += getAvailabilityScore(allPlayers[i], allPlayers[j]);
      locationScore += getLocationScore(allPlayers[i], allPlayers[j]);
    }
  }
  
  // Normalize scores
  const totalPairs = (allPlayers.length * (allPlayers.length - 1)) / 2;
  availabilityScore /= totalPairs;
  locationScore /= totalPairs;
  
  // Weight the factors to calculate overall match quality
  return {
    overall: 0.4 * balanceScore + 0.3 * synergyScore + 0.2 * availabilityScore + 0.1 * locationScore,
    balance: balanceScore,
    synergy: synergyScore,
    availability: availabilityScore,
    location: locationScore
  };
}

// Generate optimal 5v5 teams from available players
function generateOptimalTeams() {
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
  const sortedPlayers = [...availablePlayers].sort((a, b) => 
    getSkillValue(b.skill) - getSkillValue(a.skill)
  );
  
  // Take the top 10 players
  const selectedPlayers = sortedPlayers.slice(0, 10);
  
  // Create initial teams using alternating selection (like playground pick)
  const teamA = [];
  const teamB = [];
  
  selectedPlayers.forEach((player, index) => {
    if (index % 2 === 0) {
      teamA.push(player);
    } else {
      teamB.push(player);
    }
  });
  
  // Calculate match quality
  const matchQuality = calculateMatchQuality(teamA, teamB);
  
  return {
    success: true,
    teamA,
    teamB,
    confidence: matchQuality.overall,
    matchQuality
  };
}

// Format the output for display
function formatMatchmakingOutput(result) {
  if (!result.success) {
    return result.message;
  }
  
  const formatTeam = (team) => {
    return team.map(player => 
      `${player.name} (${player.skill}, synergy: ${player.synergy.toFixed(1)})`
    ).join('\n    ');
  };
  
  const formatQuality = (quality) => {
    return `- Skill Balance: ${(quality.balance * 100).toFixed(1)}%\n` +
           `- Team Synergy: ${(quality.synergy * 100).toFixed(1)}%\n` +
           `- Availability Match: ${(quality.availability * 100).toFixed(1)}%\n` +
           `- Location Compatibility: ${(quality.location * 100).toFixed(1)}%`;
  };
  
  return `
=== TurfX AI Matchmaking Recommendation ===

Team A:
    ${formatTeam(result.teamA)}

Team B:
    ${formatTeam(result.teamB)}

Match Confidence Score: ${(result.confidence * 100).toFixed(1)}%

Match Quality Explanation:
${formatQuality(result.matchQuality)}

This match recommendation is based on player skill levels, team balance, 
individual synergy scores, availability, and location compatibility.
`;
}

// Generate and display the matchmaking recommendation
const matchResult = generateOptimalTeams();
console.log(formatMatchmakingOutput(matchResult));

// In a real implementation, this would be integrated with the DQN model
// to learn from actual match outcomes and improve recommendations over time.

// Export functions for ES modules
export {
  generateOptimalTeams,
  formatMatchmakingOutput,
  calculateMatchQuality,
  calculateTeamBalance,
  calculateTeamSynergy
};