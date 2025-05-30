import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Highkey Visible</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Turn your visibility into cash. The marketplace connecting space owners 
              with local advertisers for hyperlocal advertising campaigns.
            </p>
            <p className="text-sm text-gray-400">
              © 2024 Highkey Visible. All rights reserved.
            </p>
          </div>

          {/* For Space Owners */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Space Owners</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/spaces/new" className="hover:text-white transition-colors">
                  List Your Space
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* For Advertisers */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Advertisers</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Find Spaces
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Advertising Guide
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="text-gray-400 text-sm">
            Made with ❤️ for local advertising
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;