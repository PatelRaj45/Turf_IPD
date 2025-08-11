
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, User, Calendar, Search, Trophy, Users, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Trophy size={32} className="text-sport-green-dark" />
          <span className="font-bold text-xl text-sport-green-dark">Sports Arena</span>
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
          <Link to="/matchmaking" className="text-gray-700 hover:text-sport-green-dark transition duration-200 flex items-center">
            <Users size={16} className="mr-1" />
            Matchmaking
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
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex group items-center space-x-1 border-sport-green-dark text-sport-green-dark hover:bg-sport-green-dark">
                  <Avatar className="h-8 w-8 mr-1 group-hover:text-sport-green-dark">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="group-hover:text-white hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/bookings/me')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Bookings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}
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
              to="/matchmaking" 
              className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users size={16} className="mr-1" />
              Matchmaking
            </Link>
            <Link 
              to="/players" 
              className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Players
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} className="mr-1" />
                  My Profile
                </Link>
                <button 
                  className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2 flex items-center w-full text-left"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-gray-700 hover:text-sport-green-dark transition duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
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
