import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section - Fixed for mobile */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block">Turn Your Space</span>
                <span className="block text-blue-200 mt-2">Into Cash</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-blue-100 sm:text-lg md:text-xl lg:mt-8">
                The marketplace for hyperlocal advertising. Connect space owners with advertisers for profitable campaigns.
              </p>
              
              {/* CTA Buttons - Better mobile layout */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6 lg:mt-10">
                <Link
                  to="/spaces/new"
                  className="w-full sm:w-auto bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  List Your Space
                </Link>
                <Link
                  to="/search"
                  className="w-full sm:w-auto bg-blue-500 bg-opacity-80 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-colors duration-200 text-center"
                >
                  Find Spaces
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Better mobile spacing */}
      <div className="py-12 bg-gray-50 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              How Highkey Visible Works
            </h2>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              Three simple steps to monetize your visibility
            </p>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white sm:h-16 sm:w-16">
                  <MapPinIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 sm:text-xl">
                  List Your Space
                </h3>
                <p className="mt-3 text-sm text-gray-600 sm:text-base leading-relaxed">
                  Upload photos of your visible property - yard, wall, fence, or balcony.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white sm:h-16 sm:w-16">
                  <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 sm:text-xl">
                  Get Bookings
                </h3>
                <p className="mt-3 text-sm text-gray-600 sm:text-base leading-relaxed">
                  Advertisers discover your space and send booking requests.
                </p>
              </div>

              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white sm:h-16 sm:w-16">
                  <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 sm:text-xl">
                  Earn Money
                </h3>
                <p className="mt-3 text-sm text-gray-600 sm:text-base leading-relaxed">
                  Approve campaigns and get paid automatically when ads go live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile optimized */}
      <div className="bg-blue-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Join the Movement
            </h2>
            <p className="mt-3 text-base text-blue-200 sm:mt-4 sm:text-xl">
              Thousands of space owners are already earning passive income
            </p>
          </div>
          
          {/* Stats grid - Better mobile layout */}
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:mt-12">
            <div className="text-center">
              <dt className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">500+</dt>
              <dd className="mt-2 text-sm font-medium text-blue-200 sm:text-base lg:text-lg">
                Active Spaces
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">2K+</dt>
              <dd className="mt-2 text-sm font-medium text-blue-200 sm:text-base lg:text-lg">
                Successful Campaigns
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">$200</dt>
              <dd className="mt-2 text-sm font-medium text-blue-200 sm:text-base lg:text-lg">
                Average Earnings
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Mobile responsive */}
      <div className="bg-blue-700">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block mt-2">Your visibility is worth something.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-200 sm:text-lg lg:mt-6">
            Join thousands of space owners already earning passive income from their property.
          </p>
          <Link
            to="/spaces/new"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-colors duration-200 sm:mt-8 sm:w-auto sm:px-8 lg:text-lg"
          >
            List Your Space Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;