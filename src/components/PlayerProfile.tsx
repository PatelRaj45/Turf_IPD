
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Clock, MapPin, ChevronRight } from 'lucide-react';

interface PlayerProfileProps {
  id: string;
  name: string;
  image?: string;
  sports: string[];
  skillLevel: number;
  totalGames: number;
  winRate: number;
  location: string;
  availability: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  id,
  name,
  image,
  sports,
  skillLevel,
  totalGames,
  winRate,
  location,
  availability
}) => {
  // Generate initials for avatar fallback
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  // Generate skill level stars
  const renderSkillLevel = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          className={i <= skillLevel ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-300"} 
        />
      );
    }
    return stars;
  };
  
  return (
    <Card className="h-full recommendation-card">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            {image ? (
              <AvatarImage src={image} alt={name} />
            ) : null}
            <AvatarFallback className="bg-sport-green-dark text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center mt-1">
              {renderSkillLevel()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-1 mb-3">
          {sports.map((sport, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`${
                sport === 'Basketball' ? 'border-sport-court text-sport-court' : 
                sport === 'Soccer' ? 'border-sport-turf text-sport-turf' : 
                sport === 'Tennis' ? 'border-sport-orange text-sport-orange' : 
                'border-sport-blue text-sport-blue'
              }`}
            >
              {sport}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Clock className="w-4 h-4 mr-1" />
          <span>{availability}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-bold">{totalGames}</div>
            <div className="text-xs text-gray-600">Games</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-bold">{winRate}%</div>
            <div className="text-xs text-gray-600">Win Rate</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white flex justify-between">
          <span>View Profile</span>
          <ChevronRight size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlayerProfile;
