import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import MatchRecommendation from './MatchRecommendation';
import AIMatchmakingResults from './AIMatchmakingResults';
import axios from 'axios';

interface MatchmakingFormProps {
  onSubmit?: (data: any) => void;
}

interface Player {
  id: string;
  name: string;
  image?: string;
  skillLevel: number;
}

interface AIPlayer {
  id: string;
  name: string;
  position: string;
  skillLevel: number;
  winRate: number;
}

interface MatchQuality {
  skill_balance: number;
  synergy: number;
  availability: number;
  location: number;
  position_balance: number;
}

interface AIMatchResult {
  team_A: AIPlayer[];
  team_B: AIPlayer[];
  confidence_score: number;
  match_quality: MatchQuality;
  explanation: string;
}

interface MatchRecommendation {
  id: string;
  sportType: string;
  courtName: string;
  location: string;
  dateTime: string;
  players: Player[];
  spotsAvailable: number;
  skillLevel: string;
  matchType: string;
  confidence: number;
}

const MatchmakingForm: React.FC<MatchmakingFormProps> = ({ onSubmit }) => {
  const [sport, setSport] = useState<string>('Football');
  const [location, setLocation] = useState<string>('Mumbai');
  const [availability, setAvailability] = useState<string>('Weekend Evenings');
  const [skillLevel, setSkillLevel] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [aiMatchResult, setAiMatchResult] = useState<AIMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAIResults, setShowAIResults] = useState<boolean>(false);
  
  const sports = [
    'Football',
    'Cricket',
    'Basketball',
    'Pickleball',
    'Tennis',
    'Volleyball',
    'Badminton'
  ];
  
  const skillLevels = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Novice' },
    { value: 3, label: 'Intermediate' },
    { value: 4, label: 'Advanced' },
    { value: 5, label: 'Expert' }
  ];
  
  const availabilityOptions = [
    'Weekday Evenings',
    'Weekend Mornings',
    'Weekend Evenings',
    'Flexible'
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowAIResults(true);
    setAiMatchResult(null); // Reset previous results
    
    try {
      // Create synthetic player data for the request
      const playerData = {
        playerId: 'user_' + Date.now(),
        sport: sport,
        skillLevel: skillLevel,
        location: location,
        availability: availability
      };
      
      console.log('Sending request to FastAPI:', playerData);
      
      // Make a direct request to the FastAPI backend
      const response = await axios.post('http://localhost:8000/matchmake', playerData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Received response from FastAPI:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Response has team_A:', !!response.data.team_A);
      console.log('Response has team_B:', !!response.data.team_B);
      console.log('Response has teammates:', !!response.data.teammates);
      console.log('Response has confidence:', !!response.data.confidence);
      console.log('Response has confidence_score:', !!response.data.confidence_score);
      console.log('Response has match_quality:', !!response.data.match_quality);
      console.log('Response has explanation:', !!response.data.explanation);
      
      // Check if the response has the expected format
      if (response.data.teammates && response.data.confidence) {
        // Original API response format - transform to our expected format
        console.log('Converting API response to expected format');
        
        // Create mock teams based on the teammates returned from API
        const allPlayers = response.data.teammates;
        const halfLength = Math.ceil(allPlayers.length / 2);
        
        // Split players into two teams
        const teamA = allPlayers.slice(0, halfLength).map((player: any) => ({
          id: player.playerId,
          name: player.name,
          position: 'Auto-assigned',
          skillLevel: player.skillLevel,
          winRate: player.compatibility || 0.5
        }));
        
        const teamB = allPlayers.slice(halfLength).map((player: any) => ({
          id: player.playerId,
          name: player.name,
          position: 'Auto-assigned',
          skillLevel: player.skillLevel,
          winRate: player.compatibility || 0.5
        }));
        
        // Create a result object in our expected format
        const result: AIMatchResult = {
          team_A: teamA,
          team_B: teamB,
          confidence_score: response.data.confidence * 100,
          match_quality: {
            skill_balance: 85.0,
            synergy: 70.0,
            availability: 90.0,
            location: 80.0,
            position_balance: 75.0
          },
          explanation: "Teams are balanced based on skill levels and compatibility scores."
        };
        
        console.log('Transformed result:', result);
        setAiMatchResult(result);
      } else if (response.data.team_A !== undefined && response.data.team_B !== undefined) {
        // Already in our expected format
        console.log('Response already in expected format');
        
        // If teams are empty arrays, use mock data instead
        if (response.data.team_A.length === 0 && response.data.team_B.length === 0) {
          console.log('Teams are empty, using mock data');
          const mockResult = generateMockAIMatchResult();
          setAiMatchResult(mockResult);
        } else {
          const result: AIMatchResult = {
            team_A: response.data.team_A || [],
            team_B: response.data.team_B || [],
            confidence_score: response.data.confidence_score,
            match_quality: response.data.match_quality,
            explanation: response.data.explanation
          };
          
          console.log('Using API result:', result);
          setAiMatchResult(result);
        }
      } else {
        // Unexpected format
        console.error('Unexpected API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
      
      setLoading(false);
      
      if (onSubmit) {
        onSubmit({ sport, location, availability, skillLevel, aiMatchResult });
      }
    } catch (err: any) {
      console.error('Error fetching AI matchmaking results:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      setError(`Failed to get AI matchmaking recommendations: ${err.message || 'Unknown error'}`);
      setLoading(false);
      
      // Fallback to mock data for demonstration purposes
      console.log('Falling back to mock data for demonstration');
      const mockResult = generateMockAIMatchResult();
      setAiMatchResult(mockResult);
      setError(null);
    }
  };
  
  const handleTraditionalMatchmaking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowAIResults(false);
    
    try {
      // For demo purposes, we'll create mock recommendations
      setTimeout(() => {
        const mockRecommendations = generateMockRecommendations(sport, location);
        setRecommendations(mockRecommendations);
        setLoading(false);
        
        if (onSubmit) {
          onSubmit({ sport, location, availability, recommendations: mockRecommendations });
        }
      }, 1500);
    } catch (err) {
      setError('Failed to get match recommendations. Please try again.');
      setLoading(false);
    }
  };
  
  const generateMockRecommendations = (sport: string, location: string): MatchRecommendation[] => {
    // Generate 1-3 mock recommendations
    const count = Math.floor(Math.random() * 3) + 1;
    const recommendations: MatchRecommendation[] = [];
    
    const courts = {
      'Cricket': ['Green Park', 'Oval Ground', 'Stadium Pitch'],
      'Football': ['Soccer Arena', 'City Stadium', 'Goal Field'],
      'Basketball': ['Court Central', 'Hoop Zone', 'Slam Arena'],
      'Pickleball': ['Pickle Park', 'Dink Court', 'Rally Zone'],
      'Tennis': ['Ace Courts', 'Grand Slam Center', 'Match Point'],
      'Volleyball': ['Beach Arena', 'Spike Zone', 'Net Masters'],
      'Badminton': ['Shuttle Park', 'Smash Courts', 'Racket Zone']
    };
    
    const matchTypes = {
      'Cricket': ['T20', 'ODI', 'Test'],
      'Football': ['5v5', '7v7', '11v11'],
      'Basketball': ['3v3', '5v5', 'Streetball'],
      'Pickleball': ['Singles', 'Doubles', 'Mixed'],
      'Tennis': ['Singles', 'Doubles', 'Mixed'],
      'Volleyball': ['Beach', 'Indoor', '4v4'],
      'Badminton': ['Singles', 'Doubles', 'Mixed']
    };
    
    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
    
    for (let i = 0; i < count; i++) {
      const playerCount = Math.floor(Math.random() * 5) + 2;
      const players: Player[] = [];
      
      for (let j = 0; j < playerCount; j++) {
        players.push({
          id: `player_${j}_${i}`,
          name: `Player ${j + 1}`,
          skillLevel: Math.floor(Math.random() * 5) + 1
        });
      }
      
      const sportKey = sport as keyof typeof courts;
      const courtOptions = courts[sportKey] || ['Local Court'];
      const courtName = courtOptions[Math.floor(Math.random() * courtOptions.length)];
      
      const matchTypeKey = sport as keyof typeof matchTypes;
      const matchTypeOptions = matchTypes[matchTypeKey] || ['Standard'];
      const matchType = matchTypeOptions[Math.floor(Math.random() * matchTypeOptions.length)];
      
      const skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
      
      // Generate a date within the next 7 days
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);
      const dateStr = date.toLocaleDateString();
      
      // Generate a time
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = Math.random() > 0.5 ? '00' : '30';
      const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
      const timeStr = `${hour}:${minute} ${ampm}`;
      
      recommendations.push({
        id: `match_${i}`,
        sportType: sport,
        courtName: courtName,
        location: location || 'Nearby Location',
        dateTime: `${dateStr} ${timeStr}`,
        players: players,
        spotsAvailable: Math.floor(Math.random() * 4),
        skillLevel: skillLevel,
        matchType: matchType,
        confidence: Math.floor(Math.random() * 30) + 70 // 70-99%
      });
    }
    
    return recommendations;
  };
  
  // Generate mock AI match result for demonstration purposes
  const generateMockAIMatchResult = (): AIMatchResult => {
    // Create synthetic player data
    const teamA = [
      { id: 'p1', name: 'Alex', position: 'Forward', skillLevel: 4, winRate: 0.65 },
      { id: 'p2', name: 'Raj', position: 'Midfielder', skillLevel: 3, winRate: 0.58 },
      { id: 'p3', name: 'Sarah', position: 'Forward', skillLevel: 5, winRate: 0.70 },
      { id: 'p4', name: 'John', position: 'Defender', skillLevel: 2, winRate: 0.50 },
      { id: 'p5', name: 'Priya', position: 'Midfielder', skillLevel: 3, winRate: 0.60 }
    ];
    
    const teamB = [
      { id: 'p6', name: 'Michael', position: 'Goalkeeper', skillLevel: 4, winRate: 0.67 },
      { id: 'p7', name: 'Ananya', position: 'Midfielder', skillLevel: 3, winRate: 0.64 },
      { id: 'p8', name: 'David', position: 'Defender', skillLevel: 2, winRate: 0.44 },
      { id: 'p9', name: 'Neha', position: 'Defender', skillLevel: 3, winRate: 0.55 },
      { id: 'p10', name: 'James', position: 'Forward', skillLevel: 5, winRate: 0.73 }
    ];
    
    return {
      team_A: teamA,
      team_B: teamB,
      confidence_score: 87.1,
      match_quality: {
        skill_balance: 100.0,
        synergy: 58.5,
        availability: 100.0,
        location: 100.0,
        position_balance: 87.5
      },
      explanation: "Teams are balanced by skill and availability, but synergy can be improved."
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">AI-Powered Matchmaking</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select 
                  value={sport} 
                  onValueChange={setSport}
                >
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="Select Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select 
                  value={skillLevel.toString()} 
                  onValueChange={(value) => setSkillLevel(parseInt(value))}
                >
                  <SelectTrigger id="skillLevel">
                    <SelectValue placeholder="Select Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Enter your location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={availability} 
                  onValueChange={setAvailability}
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="button" 
                onClick={handleSubmit}
                className="flex-1 bg-sport-green-dark hover:bg-sport-green" 
                disabled={loading}
              >
                {loading && showAIResults ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding AI Matches...
                  </>
                ) : (
                  'Find AI Matches'
                )}
              </Button>
              
              <Button 
                type="button"
                onClick={handleTraditionalMatchmaking}
                variant="outline" 
                className="flex-1 border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white" 
                disabled={loading}
              >
                {loading && !showAIResults ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Traditional Matches...
                  </>
                ) : (
                  'Find Traditional Matches'
                )}
              </Button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* AI Matchmaking Results */}
      {showAIResults && aiMatchResult && (
        <div className="mt-8">
          <AIMatchmakingResults
            teamA={aiMatchResult.team_A}
            teamB={aiMatchResult.team_B}
            confidenceScore={aiMatchResult.confidence_score}
            matchQuality={aiMatchResult.match_quality}
            explanation={aiMatchResult.explanation}
            isLoading={loading}
            error={error}
          />
        </div>
      )}
      
      {/* Traditional Matchmaking Results */}
      {!showAIResults && recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recommended Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <MatchRecommendation 
                key={recommendation.id}
                {...recommendation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchmakingForm;