import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Facebook, Twitter, Instagram, Github } from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <button onClick={scrollToTop} className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-xl font-bold">RecipeHub</span>
            </button>
            <p className="text-gray-400">
              The ultimate platform for food lovers to share recipes, scale ingredients, and cook together.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 cursor-default">About Us</span></li>
              <li><span className="text-gray-400 cursor-default">How It Works</span></li>
              <li><span className="text-gray-400 cursor-default">Careers</span></li>
              <li><span className="text-gray-400 cursor-default">Blog</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 cursor-default">Contact</span></li>
              <li><span className="text-gray-400 cursor-default">Help Center</span></li>
              <li><span className="text-gray-400 cursor-default">Feedback</span></li>
              <li><span className="text-gray-400 cursor-default">Bug Report</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 mb-6">
              <li><span className="text-gray-400 cursor-default">Terms & Privacy</span></li>
              <li><span className="text-gray-400 cursor-default">Privacy Policy</span></li>
              <li><span className="text-gray-400 cursor-default">Cookie Policy</span></li>
            </ul>
            
            <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <span className="text-gray-400 cursor-default">
                <Facebook className="h-5 w-5" />
              </span>
              <span className="text-gray-400 cursor-default">
                <Twitter className="h-5 w-5" />
              </span>
              <span className="text-gray-400 cursor-default">
                <Instagram className="h-5 w-5" />
              </span>
              <span className="text-gray-400 cursor-default">
                <Github className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 RecipeHub. All rights reserved. Made with ❤️ for food lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
