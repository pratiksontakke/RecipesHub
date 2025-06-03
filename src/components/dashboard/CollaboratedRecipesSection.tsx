
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Edit, Eye, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CollaboratedRecipesSection = () => {
  const { user } = useAuth();

  const { data: collaboratedRecipes, isLoading } = useQuery({
    queryKey: ['collaborated-recipes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('recipe_collaborators')
        .select(`
          id,
          role,
          status,
          recipes!inner(
            id,
            title,
            description,
            featured_image_url,
            servings,
            prep_time,
            cook_time,
            difficulty,
            is_public,
            created_at,
            updated_at,
            profiles!fk_recipes_profiles(full_name, email)
          )
        `)
        .eq('user_id', user.id)
        .order('status', { ascending: false }); // Show accepted first

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!collaboratedRecipes || collaboratedRecipes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborated recipes</h3>
        <p className="text-gray-600">Recipes you collaborate on will appear here.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Collaborated Recipes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collaboratedRecipes.map((collab) => {
          const recipe = collab.recipes;
          const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
          
          return (
            <Card key={collab.id} className="overflow-hidden relative">
              <div className="aspect-video bg-gray-200 relative">
                {recipe.featured_image_url ? (
                  <img
                    src={recipe.featured_image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <span className="text-blue-600 text-xl">👥</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge variant={getStatusColor(collab.status)}>
                    {collab.status}
                  </Badge>
                  <Badge className={getRoleColor(collab.role)}>
                    {collab.role}
                  </Badge>
                </div>
                {!recipe.is_public && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                  {recipe.title}
                  <Crown className="h-4 w-4 text-orange-500" />
                </CardTitle>
                {recipe.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                )}
                
                {/* Original creator info */}
                {recipe.profiles && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    by {recipe.profiles.full_name || recipe.profiles.email}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {totalTime > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{totalTime} min</span>
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
                  {(collab.role === 'editor' && collab.status === 'accepted') && (
                    <Link to={`/recipes/${recipe.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
