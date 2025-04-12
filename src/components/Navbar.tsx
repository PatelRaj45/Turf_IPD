
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Calendar, Search, Trophy } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Trophy size={32} className="text-sport-green-dark" />
          <span className="font-bold text-xl text-sport-green-dark">Match Play AI Arena</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-gray-700 hover:text-sport-green-dark transition duration-200">
            Home
          </Link>
          <Link to="/courts" className="text-gray-700 hover:text-sport-green-dark transition duration-200">
            Find Courts
          </Link>
          <Link to="/matches" className="text-gray-700 hover:text-sport-green-dark transition duration-200">
            Matches
          </Link>
          <Link to="/players" className="text-gray-700 hover:text-sport-green-dark transition duration-200">
            Players
          </Link>
          <Button variant="ghost" className="flex items-center space-x-1">
            <Search size={18} />
            <span>Search</span>
          </Button>
          <Button className="bg-sport-green-dark hover:bg-sport-green text-white">
            Book Now
          </Button>
          <Button variant="outline" className="flex items-center space-x-1 border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white">
            <User size={18} />
            <span>Profile</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-sport-green-dark focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 fixed top-16 left-0 right-0 z-50 animate-slide-up">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/courts" 
              className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Courts
            </Link>
            <Link 
              to="/matches" 
              className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Matches
            </Link>
            <Link 
              to="/players" 
              className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Players
            </Link>
            <Button variant="ghost" className="flex items-center justify-start space-x-2 py-2">
              <Search size={18} />
              <span>Search</span>
            </Button>
            <Button className="bg-sport-green-dark hover:bg-sport-green text-white w-full">
              Book Now
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-1 border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark hover:text-white w-full">
              <User size={18} />
              <span>Profile</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
