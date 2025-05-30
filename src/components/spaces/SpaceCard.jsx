import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatSpaceType } from '../../utils/formatters';

const SpaceCard = ({ space, onClick, isSelected }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(space);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full">
        <img
          src={space.primary_image || 'https://via.placeholder.com/400x300'}
          alt={space.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
            {formatSpaceType(space.space_type)}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {space.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {space.description}
        </p>
        
        {/* Location & Views */}
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate text-sm">{space.city}, {space.state}</span>
          </div>
          
          {space.estimated_daily_views > 0 && (
            <div className="flex items-center text-gray-500">
              <EyeIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm">{space.estimated_daily_views.toLocaleString()} views/day</span>
            </div>
          )}
        </div>
        
        {/* Price & Owner */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">
              {formatCurrency(space.daily_rate)}
              <span className="text-sm font-normal text-gray-500">/day</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <img
              src={space.owner?.avatar_url || `https://ui-avatars.com/api/?name=${space.owner?.first_name}&background=3b82f6&color=fff`}
              alt={space.owner?.first_name}
              className="h-8 w-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600 truncate max-w-[80px]">
              {space.owner?.first_name}
            </span>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link
          to={`/spaces/${space.id}`}
          className="block w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

SpaceCard.propTypes = {
  space: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

export default SpaceCard;