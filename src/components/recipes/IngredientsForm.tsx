
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: number | string;
  unit: string;
  notes?: string;
}

interface IngredientsFormProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

const COMMON_UNITS = [
  'cups', 'tbsp', 'tsp', 'oz', 'lb', 'kg', 'g', 'ml', 'l', 'qt', 'pt', 'gal',
  'piece', 'pieces', 'clove', 'cloves', 'bunch', 'package', 'can', 'bottle'
];

export const IngredientsForm = ({ ingredients, onChange }: IngredientsFormProps) => {
  const addIngredient = () => {
    onChange([...ingredients, { name: '', quantity: '', unit: '', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {ingredients.map((ingredient, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <Input
              type="number"
              step="0.25"
              min="0"
              value={ingredient.quantity}
              onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || e.target.value)}
              placeholder="1"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Unit
            </label>
            <Select 
              value={ingredient.unit} 
              onValueChange={(value) => updateIngredient(index, 'unit', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ingredient
            </label>
            <Input
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              placeholder="e.g., fresh basil"
            />
          </div>
          
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Input
              value={ingredient.notes || ''}
              onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
              placeholder="chopped, diced..."
            />
          </div>
          
          <div className="col-span-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeIngredient(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addIngredient}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Ingredient
      </Button>
    </div>
  );
};
