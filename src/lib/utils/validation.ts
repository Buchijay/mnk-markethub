// lib/utils/validation.js
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().positive('Price must be positive'),
  category_id: z.string().uuid('Invalid category'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  images: z.array(z.string().url()).min(1, 'At least one image required'),
});

export const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  listing_type: z.enum(['rent', 'sale', 'short_let']),
  price: z.number().positive('Price must be positive'),
  location: z.object({
    state: z.string(),
    city: z.string(),
    area: z.string(),
    address: z.string(),
  }),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).min(3, 'At least 3 images required'),
});

export const vehicleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  make: z.string().min(2, 'Make is required'),
  model: z.string().min(2, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive('Price must be positive'),
  mileage: z.number().int().min(0).optional(),
  condition: z.enum(['new', 'foreign_used', 'nigerian_used']),
  images: z.array(z.string().url()).min(4, 'At least 4 images required'),
});