
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { IngredientsForm } from './IngredientsForm';
import { StepsForm } from './StepsForm';
import { MediaUpload } from './MediaUpload';
import { Save, Upload, X } from 'lucide-react';

interface RecipeFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    recipe: any;
    ingredients: any[];
    steps: any[];
  };
}

export const RecipeForm = ({ mode, initialData }: RecipeFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(initialData?.recipe?.title || '');
  const [description, setDescription] = useState(initialData?.recipe?.description || '');
  const [servings, setServings] = useState(initialData?.recipe?.servings || 4);
  const [prepTime, setPrepTime] = useState(initialData?.recipe?.prep_time || '');
  const [cookTime, setCookTime] = useState(initialData?.recipe?.cook_time || '');
  const [difficulty, setDifficulty] = useState(initialData?.recipe?.difficulty || '');
  const [tags, setTags] = useState<string[]>(initialData?.recipe?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [featuredImage, setFeaturedImage] = useState(initialData?.recipe?.featured_image_url || '');
  const [isPublic, setIsPublic] = useState(initialData?.recipe?.is_public ?? true);
  const [ingredients, setIngredients] = useState(initialData?.ingredients || []);
  const [steps, setSteps] = useState(initialData?.steps || []);
  const [isDraft, setIsDraft] = useState(false);

  const createRecipe = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating recipe with user_id:', user?.id);
      console.log('Recipe data:', data);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: recipe, error } = await supabase
        .from('recipes')
        .insert([{
          user_id: user.id,
          title: data.title,
          description: data.description,
          servings: data.servings,
          prep_time: data.prepTime,
          cook_time: data.cookTime,
          difficulty: data.difficulty,
          tags: data.tags,
          featured_image_url: data.featuredImage,
          is_public: data.isPublic && !data.isDraft,
        }])
        .select()
        .single();

      if (error) {
        console.error('Recipe creation error:', error);
        throw error;
      }
      
      console.log('Recipe created successfully:', recipe);
      return recipe;
    },
    onSuccess: async (recipe) => {
      try {
        await saveIngredientsAndSteps(recipe.id);
        toast({
          title: "Recipe created",
          description: "Your recipe has been successfully created.",
        });
        navigate(`/recipes/${recipe.id}`);
      } catch (error) {
        console.error('Error saving ingredients/steps:', error);
        toast({
          title: "Warning",
          description: "Recipe created but there was an issue saving ingredients/steps.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Recipe creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: recipe, error } = await supabase
        .from('recipes')
        .update({
          title: data.title,
          description: data.description,
          servings: data.servings,
          prep_time: data.prepTime,
          cook_time: data.cookTime,
          difficulty: data.difficulty,
          tags: data.tags,
          featured_image_url: data.featuredImage,
          is_public: data.isPublic && !data.isDraft,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialData?.recipe?.id)
        .eq('user_id', user.id) // Ensure user owns the recipe
        .select()
        .single();

      if (error) {
        console.error('Recipe update error:', error);
        throw error;
      }
      return recipe;
    },
    onSuccess: async (recipe) => {
      try {
        await updateIngredientsAndSteps(recipe.id);
        toast({
          title: "Recipe updated",
          description: "Your recipe has been successfully updated.",
        });
        queryClient.invalidateQueries({ queryKey: ['recipe', recipe.id] });
        navigate(`/recipes/${recipe.id}`);
      } catch (error) {
        console.error('Error updating ingredients/steps:', error);
        toast({
          title: "Warning",
          description: "Recipe updated but there was an issue saving ingredients/steps.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Recipe update failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveIngredientsAndSteps = async (recipeId: string) => {
    // Filter and validate ingredients before saving
    const validIngredients = ingredients.filter(ingredient => 
      ingredient.name.trim() && 
      ingredient.unit.trim() && 
      (ingredient.quantity !== '' && ingredient.quantity !== null && ingredient.quantity !== undefined)
    ).map((ingredient, index) => ({
      recipe_id: recipeId,
      name: ingredient.name.trim(),
      quantity: parseFloat(ingredient.quantity.toString()) || 0,
      unit: ingredient.unit.trim(),
      notes: ingredient.notes?.trim() || null,
      order_index: index,
    }));

    // Save ingredients only if there are valid ones
    if (validIngredients.length > 0) {
      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(validIngredients);

      if (ingredientsError) {
        console.error('Ingredients save error:', ingredientsError);
        throw ingredientsError;
      }
    }

    // Filter and validate steps before saving
    const validSteps = steps.filter(step => 
      step.instruction.trim()
    ).map((step, index) => ({
      recipe_id: recipeId,
      step_number: index + 1,
      instruction: step.instruction.trim(),
      timer_minutes: step.timer_minutes && step.timer_minutes !== '' ? parseInt(step.timer_minutes.toString()) : null,
      image_url: step.image_url?.trim() || null,
      video_url: step.video_url?.trim() || null,
    }));

    // Save steps only if there are valid ones
    if (validSteps.length > 0) {
      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(validSteps);

      if (stepsError) {
        console.error('Steps save error:', stepsError);
        throw stepsError;
      }
    }
  };

  const updateIngredientsAndSteps = async (recipeId: string) => {
    // Delete existing ingredients and steps
    await supabase.from('ingredients').delete().eq('recipe_id', recipeId);
    await supabase.from('recipe_steps').delete().eq('recipe_id', recipeId);
    
    // Save new ones
    await saveIngredientsAndSteps(recipeId);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (asDraft = false) => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Recipe title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create recipes.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      title,
      description,
      servings,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      difficulty: difficulty || null,
      tags,
      featuredImage,
      isPublic,
      isDraft: asDraft,
    };

    console.log('Submitting recipe:', data);

    if (mode === 'create') {
      createRecipe.mutate(data);
    } else {
      updateRecipe.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recipe title..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your recipe..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                Servings
              </label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-1">
                Prep Time (minutes)
              </label>
              <Input
                id="prepTime"
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-1">
                Cook Time (minutes)
              </label>
              <Input
                id="cookTime"
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload
            currentUrl={featuredImage}
            onUpload={setFeaturedImage}
            type="image"
            bucket="recipe-media"
          />
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <IngredientsForm
            ingredients={ingredients}
            onChange={setIngredients}
          />
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <StepsForm
            steps={steps}
            onChange={setSteps}
          />
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make this recipe public (others can view and search for it)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pb-8">
        <Button
          onClick={() => handleSubmit(true)}
          variant="outline"
          disabled={createRecipe.isPending || updateRecipe.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={createRecipe.isPending || updateRecipe.isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Upload className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Publish Recipe' : 'Update Recipe'}
        </Button>
      </div>
    </div>
  );
};
