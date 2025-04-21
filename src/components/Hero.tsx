
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, CalendarDays, Users } from 'lucide-react';

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-sport-green-dark to-sport-green relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1526232761682-d26e03ac148e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Find Your Perfect <span className="text-sport-orange">Match</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Book courts, find teammates, and get matched with players at your skill level all powered by our AI matchmaking system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-white text-sport-green-dark hover:bg-gray-100 flex items-center space-x-2">
              <Search size={20} />
              <span>Find Courts</span>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 flex items-center space-x-2">
              <Users size={20} />
              <span>Find Players</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-t-3xl py-6 px-4 md:px-8 mt-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <div className="flex items-center space-x-2 text-sport-green-dark">
              <CalendarDays size={24} />
              <span className="font-medium">Easy Booking</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-sport-green-dark">
              <Users size={24} />
              <span className="font-medium">AI Player Matching</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2 text-sport-green-dark">
              <Search size={24} />
              <span className="font-medium">Find Local Courts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
