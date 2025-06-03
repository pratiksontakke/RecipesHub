
import React from 'react';
import { Share2, Globe, MessageSquare, Shield } from 'lucide-react';

const features = [
  {
    icon: Share2,
    title: 'Share Recipes Easily',
    description: 'Upload and share your favorite recipes with our intuitive recipe builder'
  },
  {
    icon: Globe,
    title: 'Discover International Cuisine',
    description: 'Explore dishes from around the world shared by home chefs globally'
  },
  {
    icon: MessageSquare,
    title: 'Community-Driven Ratings',
    description: 'Get honest reviews and ratings from fellow cooking enthusiasts'
  },
  {
    icon: Shield,
    title: 'Secure & Free Access',
    description: 'Enjoy all features completely free with secure account protection'
  }
];

export const ValueProposition = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose RecipeHub?
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of home chefs sharing their culinary passion
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
