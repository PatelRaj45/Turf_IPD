import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CourtCard from '@/components/CourtCard';
import BookingCalendar from '@/components/BookingCalendar';
import PlayerProfile from '@/components/PlayerProfile';
import MatchRecommendation from '@/components/MatchRecommendation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

// Sample data for courts
const sampleCourts = [
  {
    id: '1',
    name: 'Downtown Basketball Arena',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
    type: 'basketball',
    address: '123 Main St',
    rating: 4.8,
    price: 45,
    availableSlots: 6,
    distance: '1.2 miles'
  },
  {
    id: '2',
    name: 'Central Park Soccer Field',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    type: 'soccer',
    address: '456 Park Ave',
    rating: 4.5,
    price: 60,
    availableSlots: 3,
    distance: '0.8 miles'
  },
  {
    id: '3',
    name: 'Westside Tennis Club',
    image: 'https://images.unsplash.com/photo-1622279457486-28f560949036?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    type: 'tennis',
    address: '789 West Blvd',
    rating: 4.9,
    price: 35,
    availableSlots: 8,
    distance: '2.4 miles'
  },
  {
    id: '4',
    name: 'Eastside Volleyball Courts',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1307&q=80',
    type: 'volleyball',
    address: '101 Beach Dr',
    rating: 4.6,
    price: 30,
    availableSlots: 5,
    distance: '3.1 miles'
  }
];

// Sample data for players
const samplePlayers = [
  {
    id: '1',
    name: 'Alex Johnson',
    sports: ['Basketball', 'Soccer'],
    skillLevel: 4,
    totalGames: 45,
    winRate: 72,
    location: 'San Francisco',
    availability: 'Evenings & Weekends'
  },
  {
    id: '2',
    name: 'Sara Williams',
    sports: ['Tennis', 'Volleyball'],
    skillLevel: 5,
    totalGames: 67,
    winRate: 81,
    location: 'Oakland',
    availability: 'Weekends'
  },
  {
    id: '3',
    name: 'Mike Chen',
    sports: ['Basketball', 'Tennis'],
    skillLevel: 3,
    totalGames: 28,
    winRate: 64,
    location: 'San Jose',
    availability: 'Evenings'
  }
];

// Sample data for match recommendations
const sampleMatches = [
  {
    id: '1',
    sportType: 'Basketball',
    courtName: 'Downtown Basketball Arena',
    location: '123 Main St',
    dateTime: 'Aug 12 6:00 PM',
    players: [
      { id: '1', name: 'Alex Johnson', skillLevel: 4 },
      { id: '2', name: 'Marcus Davis', skillLevel: 4 },
      { id: '3', name: 'Elena Park', skillLevel: 3 },
    ],
    spotsAvailable: 1,
    skillLevel: 'Intermediate',
    matchType: '2v2',
    confidence: 95
  },
  {
    id: '2',
    sportType: 'Soccer',
    courtName: 'Central Park Soccer Field',
    location: '456 Park Ave',
    dateTime: 'Aug 13 4:30 PM',
    players: [
      { id: '4', name: 'Lucas Smith', skillLevel: 5 },
      { id: '5', name: 'Olivia Wang', skillLevel: 4 },
      { id: '6', name: 'Daniel Lee', skillLevel: 5 },
      { id: '7', name: 'Sophie Kim', skillLevel: 4 },
    ],
    spotsAvailable: 2,
    skillLevel: 'Advanced',
    matchType: '3v3',
    confidence: 87
  }
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* Featured Courts */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Courts</h2>
              <Button variant="outline" className="border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleCourts.map(court => (
                <CourtCard key={court.id} {...court} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Booking Calendar */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Book a Court</h2>
            <BookingCalendar />
          </div>
        </section>
        
        {/* Match Recommendations */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">AI Match Recommendations</h2>
              <Button variant="outline" className="border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleMatches.map(match => (
                <MatchRecommendation key={match.id} {...match} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Player Recommendations */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Players Near You</h2>
              <Button variant="outline" className="border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {samplePlayers.map(player => (
                <PlayerProfile key={player.id} {...player} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-sport-green-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join Match Play AI Arena today and start booking courts, finding teammates, and getting matched with players at your level.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-white text-sport-green-dark hover:bg-gray-100">
                Sign Up Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 hover:text-white"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
