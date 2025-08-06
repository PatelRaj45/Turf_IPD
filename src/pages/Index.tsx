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
    name: 'Andheri Sports Complex',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
    type: 'basketball',
    sports: ['Basketball', 'Cricket', 'Badminton'],
    address: 'Andheri West',
    rating: 4.8,
    price: 800,
    availableSlots: 6,
    distance: '1.2 km'
  },
  {
    id: '2',
    name: 'Juhu Football Ground',
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    type: 'football',
    sports: ['Football', 'Cricket'],
    address: 'JVPD Scheme, Juhu',
    rating: 4.5,
    price: 1200,
    availableSlots: 3,
    distance: '3.5 km'
  },
  {
    id: '3',
    name: 'Khar Tennis Academy',
    image: 'https://images.squarespace-cdn.com/content/v1/5a97763275f9eeee0b6f77f0/e8a60002-d55b-4ce1-b242-d7cf83b72b97/Tennis+Grass+Court.jpg',
    type: 'tennis',
    sports: ['Tennis', 'Pickleball'],
    address: 'Khar West',
    rating: 4.9,
    price: 1500,
    availableSlots: 8,
    distance: '4.2 km'
  },
  {
    id: '4',
    name: 'Girgaon Beach Volleyball',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1307&q=80',
    type: 'volleyball',
    sports: ['Volleyball', 'Badminton'],
    address: 'Girgaon Chowpatty',
    rating: 4.6,
    price: 600,
    availableSlots: 5,
    distance: '2.8 km'
  },
  {
    id: '5',
    name: 'Dadar Cricket Ground',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1167&q=80',
    type: 'cricket',
    sports: ['Cricket'],
    address: 'Dadar East',
    rating: 4.7,
    price: 1000,
    availableSlots: 4,
    distance: '5.1 km'
  }
];

// Sample data for players
const samplePlayers = [
  {
    id: '1',
    name: 'Arjun Sharma',
    sports: ['Basketball', 'Cricket'],
    skillLevel: 4,
    totalGames: 45,
    winRate: 72,
    location: 'Andheri West',
    availability: 'Evenings & Weekends'
  },
  {
    id: '2',
    name: 'Priya Patel',
    sports: ['Tennis', 'Badminton'],
    skillLevel: 5,
    totalGames: 67,
    winRate: 81,
    location: 'Powai',
    availability: 'Weekends'
  },
  {
    id: '3',
    name: 'Raj Malhotra',
    sports: ['Basketball', 'Football'],
    skillLevel: 3,
    totalGames: 28,
    winRate: 64,
    location: 'Bandra East',
    availability: 'Evenings'
  }
];

// Sample data for match recommendations
const sampleMatches = [
  {
    id: '1',
    sportType: 'Basketball',
    courtName: 'Bandra Basketball Court',
    location: 'Carter Road, Bandra West',
    dateTime: 'Aug 12 6:00 PM',
    players: [
      { id: '1', name: 'Arjun Sharma', skillLevel: 4 },
      { id: '2', name: 'Rohan Mehta', skillLevel: 4 },
      { id: '3', name: 'Neha Singh', skillLevel: 3 },
    ],
    spotsAvailable: 1,
    skillLevel: 'Intermediate',
    matchType: '2v2',
    confidence: 95
  },
  {
    id: '2',
    sportType: 'Football',
    courtName: 'Juhu Soccer Ground',
    location: 'JVPD Scheme, Juhu',
    dateTime: 'Aug 13 4:30 PM',
    players: [
      { id: '4', name: 'Kunal Verma', skillLevel: 5 },
      { id: '5', name: 'Anjali Desai', skillLevel: 4 },
      { id: '6', name: 'Deepak Kumar', skillLevel: 5 },
      { id: '7', name: 'Sanya Shah', skillLevel: 4 },
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
