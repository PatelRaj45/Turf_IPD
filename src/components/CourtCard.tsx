
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Users, Clock } from 'lucide-react';

interface CourtCardProps {
  id: string;
  name: string;
  image: string;
  type: string; // Primary type (for backward compatibility)
  sports: string[]; // All supported sports
  address: string;
  rating: number;
  price: number;
  availableSlots: number;
  distance: string;
}

const CourtCard: React.FC<CourtCardProps> = ({
  id,
  name,
  image,
  type,
  sports = [], // Default to empty array if not provided
  address,
  rating,
  price,
  availableSlots,
  distance
}) => {
  // Sport emoji mapping
  const sportEmojis: Record<string, string> = {
    'Cricket': '🏏',
    'Football': '⚽',
    'Basketball': '🏀',
    'Pickleball': '🏓',
    'Tennis': '🎾',
    'Volleyball': '🏐',
    'Badminton': '🏸'
  };
  
  // If sports array is empty, use the type as fallback
  const displaySports = sports.length > 0 ? sports : [type];
  return (
    <Card className="court-card overflow-hidden">
      <div className="relative h-48">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-2 left-2 ${
            type === 'basketball' ? 'bg-sport-court' : 
            type === 'soccer' || type === 'football' ? 'bg-sport-turf' : 
            type === 'tennis' ? 'bg-sport-orange' : 
            type === 'cricket' ? 'bg-sport-green-dark' :
            type === 'volleyball' ? 'bg-yellow-500' :
            type === 'badminton' ? 'bg-purple-500' :
            type === 'pickleball' ? 'bg-pink-500' : 'bg-sport-blue'
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400 mr-1" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{address} • {distance}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {displaySports.map((sport) => (
            <Badge 
              key={sport} 
              variant="outline" 
              className="text-xs py-0 h-5 bg-gray-50"
            >
              {sportEmojis[sport] || ''} {sport}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{availableSlots} slots today</span>
          </div>
          <div className="font-semibold">
            ₹{price}/hour
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button className="w-full bg-sport-green-dark hover:bg-sport-green">
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourtCard;
