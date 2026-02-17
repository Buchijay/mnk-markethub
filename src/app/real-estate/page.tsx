// app/real-estate/page.js
'use client';

import { useState, useEffect } from 'react';
import { propertiesService } from '@/lib/services/properties';
import PropertyCard from '@/components/real-estate/PropertyCard';
import { NIGERIAN_STATES, PROPERTY_TYPES } from '@/lib/utils/constants';
import { MapPin, Home, DollarSign } from 'lucide-react';

export default function RealEstatePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    listing_type: '',
    state: '',
    city: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    sort: 'newest'
  });

  useEffect(() => {
    loadProperties();
  }, [filters]);

  async function loadProperties() {
    setLoading(true);
    const { data } = await propertiesService.getAll(filters);
    setProperties(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Find Your Dream Property</h1>
          <p className="text-xl mb-8">Explore thousands of properties for rent and sale across Nigeria</p>
          
          {/* Quick Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.listing_type}
                onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-green-500"
              >
                <option value="">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
                <option value="short_let">Short Let</option>
              </select>

              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-green-500"
              >
                <option value="">Select State</option>
                {NIGERIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-green-500"
              >
                <option value="">Bedrooms</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4 Beds</option>
                <option value="5">5+ Beds</option>
              </select>

              <button
                onClick={loadProperties}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Search Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Home className="text-green-600" size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold">{properties.length}</p>
              <p className="text-gray-600">Properties Available</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <MapPin className="text-blue-600" size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold">36</p>
              <p className="text-gray-600">States Covered</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-4 rounded-full">
              <DollarSign className="text-yellow-600" size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold">₦500k+</p>
              <p className="text-gray-600">Starting Prices</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Advanced Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-6">Refine Search</h2>

              {/* Property Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price Range (₦)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* City */}
              {filters.state && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    placeholder="Enter city..."
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              )}

              <button
                onClick={() => setFilters({
                  listing_type: '',
                  state: '',
                  city: '',
                  category: '',
                  minPrice: '',
                  maxPrice: '',
                  bedrooms: '',
                  sort: 'newest'
                })}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <p className="text-gray-600">
                Showing {properties.length} properties
                {filters.state && ` in ${filters.state}`}
                {filters.listing_type && ` for ${filters.listing_type}`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-4">No properties found matching your criteria</p>
                <button
                  onClick={() => setFilters({
                    listing_type: '',
                    state: '',
                    city: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    bedrooms: '',
                    sort: 'newest'
                  })}
                  className="text-green-600 hover:underline"
                >
                  Clear filters and browse all properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}