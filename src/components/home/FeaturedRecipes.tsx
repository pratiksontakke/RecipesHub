
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Tables } from '@/integrations/supabase/types';
import { Star } from 'lucide-react';

type Recipe = Tables<'recipes'>;

// Fallback featured recipes for demo purposes
const fallbackRecipes: Recipe[] = [
  {
    id: 'demo-featured-1',
    user_id: 'demo-user-1',
    title: 'Authentic Spanish Paella',
    description: 'A traditional Spanish rice dish with saffron, seafood, and vegetables that brings the taste of Valencia to your table.',
    servings: 6,
    cook_time: 45,
    prep_time: 30,
    difficulty: 'medium',
    tags: ['spanish', 'seafood', 'rice', 'saffron'],
    featured_image_url: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-featured-2',
    user_id: 'demo-user-2',
    title: 'Thai Green Curry',
    description: 'Creamy and aromatic Thai green curry with coconut milk, fresh herbs, and your choice of protein.',
    servings: 4,
    cook_time: 25,
    prep_time: 15,
    difficulty: 'easy',
    tags: ['thai', 'curry', 'coconut', 'spicy', 'asian'],
    featured_image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-featured-3',
    user_id: 'demo-user-3',
    title: 'Classic Chocolate Chip Cookies',
    description: 'Soft, chewy chocolate chip cookies that are perfect for any occasion. A family favorite recipe.',
    servings: 24,
    cook_time: 12,
    prep_time: 20,
    difficulty: 'easy',
    tags: ['dessert', 'cookies', 'chocolate', 'baking'],
    featured_image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-featured-4',
    user_id: 'demo-user-4',
    title: 'Mediterranean Quinoa Bowl',
    description: 'Healthy and colorful quinoa bowl with fresh vegetables, feta cheese, and lemon herb dressing.',
    servings: 2,
    cook_time: 0,
    prep_time: 25,
    difficulty: 'easy',
    tags: ['healthy', 'vegetarian', 'mediterranean', 'quinoa', 'salad'],
    featured_image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-featured-5',
    user_id: 'demo-user-5',
    title: 'Indian Butter Chicken',
    description: 'Rich and creamy Indian curry with tender chicken in a tomato-based sauce with aromatic spices.',
    servings: 4,
    cook_time: 40,
    prep_time: 20,
    difficulty: 'medium',
    tags: ['indian', 'curry', 'chicken', 'spicy', 'creamy'],
    featured_image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'demo-featured-6',
    user_id: 'demo-user-6',
    title: 'French Croissants',
    description: 'Buttery, flaky French croissants made from scratch with laminated dough technique.',
    servings: 8,
    cook_time: 25,
    prep_time: 180,
    difficulty: 'hard',
    tags: ['french', 'breakfast', 'pastry', 'bread', 'buttery'],
    featured_image_url: 'https://images.unsplash.com/photo-1555507036-ab794f4ade6a?w=500',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const FeaturedRecipes = () => {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['featured-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error || !data || data.length === 0) {
        console.log('No real recipes yet, using fallback data');
        return fallbackRecipes;
      }
      return data as Recipe[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Star className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Featured This Week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Star className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-3xl font-bold text-gray-900">Featured This Week</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes?.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
};
