
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const categories = [
  { name: 'Breakfast', emoji: '🍳', count: '45 recipes' },
  { name: 'Desserts', emoji: '🍰', count: '32 recipes' },
  { name: 'Keto', emoji: '🥑', count: '28 recipes' },
  { name: 'Quick Meals', emoji: '⚡', count: '67 recipes' },
  { name: 'Vegan', emoji: '🌱', count: '41 recipes' },
  { name: 'Italian', emoji: '🍝', count: '38 recipes' },
  { name: 'Asian', emoji: '🍜', count: '29 recipes' },
  { name: 'Healthy', emoji: '🥗', count: '52 recipes' },
];

export const TrendingCategories = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-3xl font-bold text-gray-900">Trending Categories</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-default"
            >
              <div className="text-3xl mb-2">{category.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
