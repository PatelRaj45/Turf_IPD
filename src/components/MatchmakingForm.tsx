import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import MatchRecommendation from './MatchRecommendation';

interface MatchmakingFormProps {
  onSubmit?: (data: any) => void;
}

interface Player {
  id: string;
  name: string;
  image?: string;
  skillLevel: number;
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
  const [sport, setSport] = useState<string>('Cricket');
  const [location, setLocation] = useState<string>('');
  const [availability, setAvailability] = useState<string>('Weekday Evenings');
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const sports = [
    'Cricket',
    'Football',
    'Basketball',
    'Pickleball',
    'Tennis',
    'Volleyball',
    'Badminton'
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
    
    try {
      // In a real app, this would be an API call to your backend
      // const response = await fetch('/api/matchmaking/recommendations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ sport, location, availability })
      // });
      // const data = await response.json();
      
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
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Find Your Perfect Match</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <Button type="submit" className="w-full bg-sport-green-dark hover:bg-sport-green" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                'Find Matches'
              )}
            </Button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
      
      {recommendations.length > 0 && (
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