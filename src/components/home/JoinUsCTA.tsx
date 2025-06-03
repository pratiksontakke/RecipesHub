
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const JoinUsCTA = () => {
  const { user } = useAuth();

  return (
    <section className="bg-orange-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Become a Home Chef Today
        </h2>
        <p className="text-xl text-orange-100 mb-8">
          It's free, easy, and fun!
        </p>
        {user ? (
          <Link to="/recipes/new">
            <Button size="lg" variant="secondary">
              <Plus className="mr-2 h-5 w-5" />
              Start Uploading Recipes
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              <Plus className="mr-2 h-5 w-5" />
              Start Uploading Recipes
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};
