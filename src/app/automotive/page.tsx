// app/automotive/page.js
'use client';

import { useState, useEffect } from 'react';
import { vehiclesService } from '@/lib/services/vehicles';
import VehicleCard from '@/components/automotive/VehicleCard';
import { CAR_MAKES, BODY_TYPES } from '@/lib/utils/constants';
import { Car, Calendar, Gauge } from 'lucide-react';

export default function AutomotivePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularMakes, setPopularMakes] = useState([]);
  
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    year_min: '',
    year_max: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    body_type: '',
    transmission: '',
    fuel_type: '',
    sort: 'newest'
  });

  useEffect(() => {
    loadVehicles();
    loadPopularMakes();
  }, [filters]);

  async function loadVehicles() {
    setLoading(true);
    const { data } = await vehiclesService.getAll(filters);
    setVehicles(data || []);
    setLoading(false);
  }

  async function loadPopularMakes() {
    const makes = await vehiclesService.getPopularMakes();
    setPopularMakes(makes);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Vehicle</h1>
          <p className="text-xl mb-8">Browse thousands of cars, bikes, and commercial vehicles</p>

          {/* Quick Search */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Select Make</option>
                {CAR_MAKES.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>

              <select
                value={filters.year_min}
                onChange={(e) => setFilters({ ...filters, year_min: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Min Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Condition</option>
                <option value="new">New</option>
                <option value="foreign_used">Foreign Used</option>
                <option value="nigerian_used">Nigerian Used</option>
              </select>

              <select
                value={filters.body_type}
                onChange={(e) => setFilters({ ...filters, body_type: e.target.value })}
                className="px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Body Type</option>
                {BODY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <button
                onClick={loadVehicles}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Search Vehicles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Makes */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popular Makes</h2>
          <div className="flex flex-wrap gap-3">
            {popularMakes.map(make => (
              <button
                key={make}
                onClick={() => setFilters({ ...filters, make })}
                className={`px-6 py-3 rounded-lg border-2 font-semibold transition ${
                  filters.make === make
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-600'
                }`}
              >
                {make}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-6">Filter Results</h2>

              {/* Model */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Model</label>
                <input
                  type="text"
                  placeholder="e.g., Corolla, Accord..."
                  value={filters.model}
                  onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Year Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.year_min}
                    onChange={(e) => setFilters({ ...filters, year_min: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="">Min</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={filters.year_max}
                    onChange={(e) => setFilters({ ...filters, year_max: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="">Max</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Transmission */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Transmission</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="">All</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Fuel Type</label>
                <select
                  value={filters.fuel_type}
                  onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="">All</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({
                  make: '',
                  model: '',
                  year_min: '',
                  year_max: '',
                  minPrice: '',
                  maxPrice: '',
                  condition: '',
                  body_type: '',
                  transmission: '',
                  fuel_type: '',
                  sort: 'newest'
                })}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Vehicles Grid */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {vehicles.length} vehicles found
              </p>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="year_new">Year: Newest</option>
                <option value="year_old">Year: Oldest</option>
                <option value="mileage_low">Mileage: Low to High</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Car size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-4">No vehicles found</p>
                <button
                  onClick={() => setFilters({
                    make: '',
                    model: '',
                    year_min: '',
                    year_max: '',
                    minPrice: '',
                    maxPrice: '',
                    condition: '',
                    body_type: '',
                    transmission: '',
                    fuel_type: '',
                    sort: 'newest'
                  })}
                  className="text-red-600 hover:underline"
                >
                  Clear filters and browse all vehicles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}