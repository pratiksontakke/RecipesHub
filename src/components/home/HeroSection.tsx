
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Discover, Cook & Share<br />Recipes You Love
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Powered by real home chefs and global cuisine lovers
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link to="/recipes/new">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-5 w-5" />
                Add Your Own Recipe
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-5 w-5" />
                Add Your Own Recipe
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
