
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DraftsSection = () => {
  const { user } = useAuth();

  const { data: drafts, isLoading } = useQuery({
    queryKey: ['my-drafts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_public', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
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

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts</h3>
        <p className="text-gray-600 mb-6">Your recipe drafts will appear here when you save them.</p>
        <Link to="/recipes/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Recipe
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recipe Drafts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drafts.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden border-dashed relative">
            <div className="aspect-video bg-gray-100 relative">
              {recipe.featured_image_url ? (
                <img
                  src={recipe.featured_image_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover opacity-75"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-gray-400 text-xl">📝</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary">Draft</Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">
                {recipe.title || 'Untitled Recipe'}
              </CardTitle>
              {recipe.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(recipe.updated_at).toLocaleDateString()}</span>
                </div>
                {recipe.servings && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link to={`/recipes/${recipe.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                </Link>
                <Link to={`/recipes/${recipe.id}/edit`} className="flex-1">
                  <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                    <Edit className="mr-1 h-3 w-3" />
                    Continue Editing
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
