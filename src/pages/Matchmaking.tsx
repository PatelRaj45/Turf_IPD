import React from 'react';
import MatchmakingForm from '@/components/MatchmakingForm';

const Matchmaking: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Matchmaking</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our advanced AI system analyzes player skills, preferences, and history to find your perfect teammates and opponents.
          Get matched with players who complement your style and help you improve your game.
        </p>
      </div>
      
      <MatchmakingForm />
      
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sport-green-dark font-bold text-xl mb-2">1. Share Your Preferences</div>
            <p className="text-gray-600">
              Tell us your sport, location, and availability. Our AI considers your skill level and past match history.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sport-green-dark font-bold text-xl mb-2">2. AI Matchmaking</div>
            <p className="text-gray-600">
              Our Double DQN algorithm analyzes thousands of potential matches to find your ideal teammates and opponents.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sport-green-dark font-bold text-xl mb-2">3. Play & Improve</div>
            <p className="text-gray-600">
              Join your recommended matches, play with compatible teammates, and watch your skills improve over time.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-16 bg-sport-green-light p-8 rounded-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Why AI Matchmaking?</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-sport-green-dark font-bold mr-2">✓</span>
            <span>Better skill matching leads to more competitive and enjoyable games</span>
          </li>
          <li className="flex items-start">
            <span className="text-sport-green-dark font-bold mr-2">✓</span>
            <span>Find teammates who complement your playing style</span>
          </li>
          <li className="flex items-start">
            <span className="text-sport-green-dark font-bold mr-2">✓</span>
            <span>Discover new players in your area with similar interests</span>
          </li>
          <li className="flex items-start">
            <span className="text-sport-green-dark font-bold mr-2">✓</span>
            <span>AI learns from your match results to provide increasingly better recommendations</span>
          </li>
          <li className="flex items-start">
            <span className="text-sport-green-dark font-bold mr-2">✓</span>
            <span>Support for all 7 sports with sport-specific matching criteria</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Matchmaking;