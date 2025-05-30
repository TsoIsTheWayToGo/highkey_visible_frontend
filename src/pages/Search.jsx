import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { FunnelIcon } from '@heroicons/react/24/outline';
import SpaceCard from '../components/spaces/SpaceCard';
import SpaceFilters from '../components/spaces/SpaceFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import spacesService from '../services/spaces';

const Search = () => {
  const [filters, setFilters] = useState({
    latitude: null,
    longitude: null,
    radius: 25,
    min_price: '',
    max_price: '',
    space_type: '',
    start_date: '',
    end_date: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFilters(prev => ({ ...prev, latitude, longitude }));
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Dallas area
          setFilters(prev => ({ 
            ...prev, 
            latitude: 32.9618, 
            longitude: -96.7841 
          }));
        }
      );
    } else {
      // Default to Dallas area
      setFilters(prev => ({ 
        ...prev, 
        latitude: 32.9618, 
        longitude: -96.7841 
      }));
    }
  }, []);

  const { data: spacesData, isLoading, error } = useQuery(
    ['spaces', filters],
    () => spacesService.searchSpaces(filters),
    {
      enabled: true,
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Error loading spaces</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Find Advertising Spaces
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Discover high-visibility locations for your next campaign
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mb-6 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-8">
              <SpaceFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {spacesData?.spaces?.length || 0} spaces found
                  </h2>
                  
                  {/* Sort dropdown - placeholder for future */}
                  <div className="hidden sm:block">
                    <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option>Sort by Price: Low to High</option>
                      <option>Sort by Price: High to Low</option>
                      <option>Sort by Views</option>
                    </select>
                  </div>
                </div>
                
                {/* Spaces Grid - Responsive */}
                {spacesData?.spaces?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {spacesData.spaces.map((space) => (
                      <SpaceCard key={space.id} space={space} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-white p-8 text-center shadow-sm sm:p-12">
                    <p className="text-base text-gray-500 sm:text-lg">
                      No spaces found matching your criteria.
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your filters or search in a different area.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;