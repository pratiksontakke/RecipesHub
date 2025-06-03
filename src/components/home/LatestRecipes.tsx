
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Tables } from '@/integrations/supabase/types';
import { Clock } from 'lucide-react';

type Recipe = Tables<'recipes'>;

// Fallback latest recipes for demo purposes
const fallbackRecipes: Recipe[] = [
  {
    id: 'demo-latest-1',
    user_id: 'demo-user-1',
    title: 'Avocado Toast Supreme',
    description: 'Elevated avocado toast with poached egg, cherry tomatoes, and everything bagel seasoning.',
    servings: 2,
    cook_time: 5,
    prep_time: 10,
    difficulty: 'easy',
    tags: ['breakfast', 'healthy', 'avocado', 'toast', 'quick'],
    featured_image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500',
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'demo-latest-2',
    user_id: 'demo-user-2',
    title: 'Italian Risotto',
    description: 'Creamy Italian risotto with mushrooms and parmesan cheese, cooked to perfection.',
    servings: 4,
    cook_time: 30,
    prep_time: 15,
    difficulty: 'medium',
    tags: ['italian', 'rice', 'mushroom', 'creamy', 'vegetarian'],
    featured_image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500',
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'demo-latest-3',
    user_id: 'demo-user-3',
    title: 'Korean Kimchi Fried Rice',
    description: 'Spicy and flavorful Korean fried rice with fermented kimchi and vegetables.',
    servings: 3,
    cook_time: 15,
    prep_time: 10,
    difficulty: 'easy',
    tags: ['korean', 'spicy', 'kimchi', 'rice', 'asian'],
    featured_image_url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500',
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'demo-latest-4',
    user_id: 'demo-user-4',
    title: 'Classic Caesar Salad',
    description: 'Fresh romaine lettuce with homemade Caesar dressing, croutons, and parmesan cheese.',
    servings: 4,
    cook_time: 0,
    prep_time: 15,
    difficulty: 'easy',
    tags: ['salad', 'healthy', 'caesar', 'quick', 'vegetarian'],
    featured_image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'demo-latest-5',
    user_id: 'demo-user-5',
    title: 'Homemade Pizza Margherita',
    description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil on homemade dough.',
    servings: 4,
    cook_time: 12,
    prep_time: 120,
    difficulty: 'medium',
    tags: ['italian', 'pizza', 'homemade', 'cheese', 'basil'],
    featured_image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'demo-latest-6',
    user_id: 'demo-user-6',
    title: 'Chicken Teriyaki Bowl',
    description: 'Japanese-inspired teriyaki chicken served over rice with steamed vegetables.',
    servings: 2,
    cook_time: 20,
    prep_time: 15,
    difficulty: 'easy',
    tags: ['japanese', 'chicken', 'teriyaki', 'rice', 'healthy'],
    featured_image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
    is_public: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

export const LatestRecipes = () => {
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['latest-recipes'],
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Clock className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Just Added</h2>
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <Clock className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-3xl font-bold text-gray-900">Just Added</h2>
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
