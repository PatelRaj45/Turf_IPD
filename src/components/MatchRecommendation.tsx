
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar, MapPin, Trophy, AlertCircle } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  image?: string;
  skillLevel: number;
}

interface MatchRecommendationProps {
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

const MatchRecommendation: React.FC<MatchRecommendationProps> = ({
  id,
  sportType,
  courtName,
  location,
  dateTime,
  players,
  spotsAvailable,
  skillLevel,
  matchType,
  confidence
}) => {
  // Generate avatar info for players
  const renderPlayerAvatars = () => {
    return players.map((player, index) => {
      const initials = player.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      
      return (
        <Avatar key={player.id} className="border-2 border-white">
          {player.image ? (
            <AvatarImage src={player.image} alt={player.name} />
          ) : null}
          <AvatarFallback className="bg-sport-green text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      );
    });
  };
  
  // Render empty spots
  const renderEmptySpots = () => {
    if (spotsAvailable <= 0) return null;
    
    const emptySpots = [];
    for (let i = 0; i < spotsAvailable; i++) {
      emptySpots.push(
        <div 
          key={`empty-${i}`} 
          className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
        >
          <span className="text-xs text-gray-400">+1</span>
        </div>
      );
    }
    return emptySpots;
  };
  
  // Calculate confidence color
  const getConfidenceColor = () => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-blue-600";
    return "text-orange-500";
  };
  
  return (
    <Card className="recommendation-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge 
              className={`mb-2 ${
                sportType === 'Basketball' ? 'bg-sport-court' : 
                sportType === 'Soccer' ? 'bg-sport-turf' : 
                sportType === 'Tennis' ? 'bg-sport-orange' : 'bg-sport-blue'
              }`}
            >
              {sportType}
            </Badge>
            <CardTitle className="text-lg">{courtName}</CardTitle>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{location}</span>
            </div>
          </div>
          <div 
            className={`flex items-center ${getConfidenceColor()}`}
            title="AI Match Confidence"
          >
            <Trophy className="w-4 h-4 mr-1" />
            <span className="font-semibold">{confidence}%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{dateTime.split(' ')[0]}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{dateTime.split(' ')[1]}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <div className="flex justify-between mb-2">
            <div className="text-sm font-medium">Players</div>
            <Badge variant="outline" className="text-xs">
              {matchType}
            </Badge>
          </div>
          
          <div className="flex flex-wrap -space-x-2">
            {renderPlayerAvatars()}
            {renderEmptySpots()}
          </div>
          
          {spotsAvailable > 0 && (
            <div className="mt-2 flex items-center text-sm text-sport-blue">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>{spotsAvailable} spots available</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline" className="bg-gray-50">
            {skillLevel} Level
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button className="w-full bg-sport-green-dark hover:bg-sport-green">
          Join Match
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatchRecommendation;
