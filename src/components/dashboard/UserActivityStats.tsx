
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Clock, Star } from 'lucide-react';

export const UserActivityStats = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      // Get user's recipes
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, created_at, cook_time, prep_time')
        .eq('user_id', user?.id);

      if (recipesError) throw recipesError;

      // Calculate total cooking time
      const totalCookingTime = recipes?.reduce((total, recipe) => {
        return total + (recipe.cook_time || 0) + (recipe.prep_time || 0);
      }, 0) || 0;

      return {
        totalRecipes: recipes?.length || 0,
        totalCookingTime,
        joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
      };
    },
    enabled: !!user,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <ChefHat className="h-5 w-5 text-orange-600" />
          <div>
            <div className="font-medium">{stats?.totalRecipes || 0} Recipes</div>
            <div className="text-sm text-gray-600">Total created</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-orange-600" />
          <div>
            <div className="font-medium">{stats?.totalCookingTime || 0} min</div>
            <div className="text-sm text-gray-600">Cooking time shared</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-orange-600" />
          <div>
            <div className="font-medium">Member since</div>
            <div className="text-sm text-gray-600">{stats?.joinDate}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
