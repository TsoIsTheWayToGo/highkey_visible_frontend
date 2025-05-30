import React from 'react';
import { useParams } from 'react-router-dom';

const SpaceDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Space Details
          </h1>
          <p className="text-gray-600">
            Loading space {id}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetail;