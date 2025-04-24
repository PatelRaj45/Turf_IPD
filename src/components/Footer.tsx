import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy size={32} className="text-sport-green" />
              <span className="font-bold text-xl">Sports Arena</span>
            </div>
            <p className="text-gray-400 mb-6">
              Find courts, teammates, and opponents with our AI-powered sports matchmaking platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-sport-green">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-sport-green">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-sport-green">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courts" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Find Courts
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Matches
                </Link>
              </li>
              <li>
                <Link to="/players" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Players
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-sport-green transition duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Sports */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Sports</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courts?sport=basketball" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Basketball
                </Link>
              </li>
              <li>
                <Link to="/courts?sport=soccer" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Soccer
                </Link>
              </li>
              <li>
                <Link to="/courts?sport=tennis" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Tennis
                </Link>
              </li>
              <li>
                <Link to="/courts?sport=volleyball" className="text-gray-400 hover:text-sport-green transition duration-200">
                  Volleyball
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-sport-green" />
                <span className="text-gray-400">+91 (22) 4567-8900</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-sport-green" />
                <span className="text-gray-400">info@sportsarena.in</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-sport-green mt-1" />
                <span className="text-gray-400">
                  123 Sports Lane<br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Sports Arena. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-500 hover:text-sport-green text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-sport-green text-sm">
                Terms of Service
              </Link>
              <Link to="/faq" className="text-gray-500 hover:text-sport-green text-sm">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
