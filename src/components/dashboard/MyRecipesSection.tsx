
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyRecipesSection = () => {
  const { user } = useAuth();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['my-recipes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
        <p className="text-gray-600 mb-6">Start creating your first recipe to share with the world!</p>
        <Link to="/recipes/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Recipe
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">My Published Recipes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden relative">
            <div className="aspect-video bg-gray-200 relative">
              {recipe.featured_image_url ? (
                <img
                  src={recipe.featured_image_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                  <span className="text-orange-600 text-xl">🍳</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-600 hover:bg-green-700">Published</Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">{recipe.title}</CardTitle>
              {recipe.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {(recipe.prep_time || recipe.cook_time) && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
                {recipe.difficulty && (
                  <Badge variant="secondary" className="capitalize text-xs">
                    {recipe.difficulty}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Link to={`/recipes/${recipe.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                </Link>
                <Link to={`/recipes/${recipe.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
