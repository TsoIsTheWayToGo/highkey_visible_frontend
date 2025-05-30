import React from 'react';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SPACE_TYPES } from '../../utils/constants';

const SpaceFilters = ({ filters, onFilterChange }) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Spaces</h3>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Price Range (per day)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min $"
            value={filters.min_price}
            onChange={(e) => handleInputChange('min_price', e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Max $"
            value={filters.max_price}
            onChange={(e) => handleInputChange('max_price', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Space Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Space Type
        </label>
        <select
          value={filters.space_type}
          onChange={(e) => handleInputChange('space_type', e.target.value)}
          className="input-field"
        >
          {SPACE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Campaign Dates
        </label>
        <div className="space-y-3">
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className="input-field"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            className="input-field"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Search Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Search Radius: {filters.radius} miles
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={filters.radius}
          onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 mi</span>
          <span>50 mi</span>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({
          min_price: '',
          max_price: '',
          space_type: '',
          start_date: '',
          end_date: '',
          radius: 25
        })}
        className="w-full btn-secondary"
      >
        Clear Filters
      </button>
    </div>
  );
};

SpaceFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default SpaceFilters;