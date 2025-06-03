
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Recipe = Tables<'recipes'>;

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="p-0">
          {recipe.featured_image_url ? (
            <img
              src={recipe.featured_image_url}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-amber-100 rounded-t-lg flex items-center justify-center">
              <ChefHat className="h-16 w-16 text-orange-600" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
          
          {recipe.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.difficulty && (
              <Badge variant="secondary" className="text-xs">
                {recipe.difficulty}
              </Badge>
            )}
            {recipe.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags && recipe.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 2} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
