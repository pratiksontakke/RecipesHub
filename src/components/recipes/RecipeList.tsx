
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeCard } from './RecipeCard';
import { Tables } from '@/integrations/supabase/types';

type Recipe = Tables<'recipes'>;

export const RecipeList = () => {
  const { user } = useAuth();

  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Query recipes that the user owns or has public access to
      const { data: ownedAndPublicRecipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;

      // Query recipes that the user collaborates on (including drafts)
      const { data: collaboratedRecipes, error: collabError } = await supabase
        .from('recipe_collaborators')
        .select(`
          recipe_id,
          status,
          recipes!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted'); // Only include accepted collaborations

      if (collabError) throw collabError;

      // Combine and deduplicate recipes
      const allRecipes = [...(ownedAndPublicRecipes || [])];
      
      // Add collaborated recipes that aren't already in the list
      collaboratedRecipes?.forEach(collab => {
        const recipe = collab.recipes as Recipe;
        if (!allRecipes.find(r => r.id === recipe.id)) {
          allRecipes.push(recipe);
        }
      });

      // Sort by created_at descending
      return allRecipes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading recipes. Please try again.</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
        <p className="text-gray-600">Create your first recipe to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};
