
import React from 'react';
import { Tables } from '@/integrations/supabase/types';

type Ingredient = Tables<'ingredients'>;

interface IngredientsListProps {
  ingredients: Ingredient[];
  scalingFactor: number;
}

export const IngredientsList = ({ ingredients, scalingFactor }: IngredientsListProps) => {
  const formatQuantity = (quantity: number, scalingFactor: number) => {
    const scaled = quantity * scalingFactor;
    // Round to reasonable precision
    if (scaled < 1) {
      return scaled.toFixed(2).replace(/\.?0+$/, '');
    } else if (scaled < 10) {
      return scaled.toFixed(1).replace(/\.?0+$/, '');
    } else {
      return Math.round(scaled).toString();
    }
  };

  if (ingredients.length === 0) {
    return (
      <p className="text-gray-500 italic">No ingredients added yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {ingredients.map((ingredient) => (
        <li key={ingredient.id} className="flex justify-between items-start">
          <div className="flex-1">
            <span className="font-medium">
              {formatQuantity(ingredient.quantity, scalingFactor)} {ingredient.unit}
            </span>
            <span className="ml-2">{ingredient.name}</span>
            {ingredient.notes && (
              <p className="text-sm text-gray-500 mt-1">{ingredient.notes}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
