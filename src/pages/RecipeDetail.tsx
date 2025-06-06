import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, ChefHat, Edit, Trash2, ArrowLeft, Check, Crown } from 'lucide-react';
import { IngredientsList } from '@/components/recipes/IngredientsList';
import { RecipeSteps } from '@/components/recipes/RecipeSteps';
import { RecipeTimer } from '@/components/recipes/RecipeTimer';
import { CelebrationAnimation } from '@/components/recipes/CelebrationAnimation';
import { CollaborationSection } from '@/components/recipes/CollaborationSection';
import { useToast } from '@/hooks/use-toast';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [servings, setServings] = useState<number>(4);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setServings(data.servings);
      return data;
    },
  });

  const { data: ingredients } = useQuery({
    queryKey: ['ingredients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: steps } = useQuery({
    queryKey: ['recipe_steps', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', id)
        .order('step_number');

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if user has collaboration access
  const { data: collaborationStatus } = useQuery({
    queryKey: ['collaboration-status', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('recipe_collaborators')
        .select('role, status')
        .eq('recipe_id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !!id,
  });

  const deleteRecipe = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Recipe deleted",
        description: "Your recipe has been successfully deleted.",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipe.mutate();
    }
  };

  const toggleStepCompletion = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  // Check if cooking is complete and trigger celebration
  const progressPercentage = steps ? (completedSteps.size / steps.length) * 100 : 0;
  const isComplete = progressPercentage === 100 && steps && steps.length > 0;

  useEffect(() => {
    if (isComplete && !hasShownCelebration) {
      setShowCelebration(true);
      setHasShownCelebration(true);
      
      // Show success toast
      toast({
        title: "🎉 Recipe Complete!",
        description: "Congratulations! You've finished cooking this recipe.",
      });
    }
  }, [isComplete, hasShownCelebration, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === recipe.user_id;
  const isCollaborator = collaborationStatus?.status === 'accepted';
  const canEdit = isOwner || (isCollaborator && collaborationStatus?.role === 'editor');
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const scalingFactor = servings / recipe.servings;

  // Original curator information - check if profiles exists and has the required properties
  const originalCurator = recipe.profiles && typeof recipe.profiles === 'object' && !('error' in recipe.profiles) ? {
    name: recipe.profiles.full_name || undefined,
    email: recipe.profiles.email
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation 
          onComplete={() => setShowCelebration(false)} 
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Original Curator Credit - Show if not owner */}
        {!isOwner && originalCurator && (
          <Card className="border-orange-200 bg-orange-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Original Recipe by: {originalCurator.name || originalCurator.email}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collaboration Status Badge for Collaborators */}
        {isCollaborator && (
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  You are a {collaborationStatus?.role} on this recipe
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          {recipe.featured_image_url ? (
            <img
              src={recipe.featured_image_url}
              alt={recipe.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center mb-6">
              <ChefHat className="h-24 w-24 text-orange-600" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-600 text-lg leading-relaxed">{recipe.description}</p>
              )}
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {isOwner && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleteRecipe.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-600 mb-4">
            {totalTime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{totalTime} minutes total</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Serves {recipe.servings}</span>
            </div>
            {recipe.difficulty && (
              <Badge variant="secondary" className="capitalize">
                {recipe.difficulty}
              </Badge>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Enhanced Progress Bar for Cooking */}
          {steps && steps.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Cooking Progress</span>
                <span className="text-sm text-gray-500">
                  {completedSteps.size} of {steps.length} steps completed
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className={`h-3 transition-all duration-500 ${
                  isComplete ? 'animate-pulse' : ''
                }`}
              />
              {isComplete && (
                <div className="text-center mt-2">
                  <span className="text-sm font-medium text-green-600 animate-pulse">
                    🎉 Recipe Complete! Well done! 🎉
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Ingredients */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Ingredients</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="servings" className="text-sm text-gray-600">
                    Servings:
                  </label>
                  <input
                    id="servings"
                    type="number"
                    min="1"
                    max="20"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <IngredientsList 
                ingredients={ingredients || []} 
                scalingFactor={scalingFactor} 
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Instructions</h2>
              <div className="space-y-6">
                {steps?.map((step, index) => (
                  <div key={step.id} className="border-l-4 border-orange-200 pl-4">
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        onClick={() => toggleStepCompletion(step.step_number)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                          completedSteps.has(step.step_number)
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {completedSteps.has(step.step_number) && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-orange-600">
                            Step {step.step_number}
                          </span>
                          {step.timer_minutes && (
                            <RecipeTimer 
                              minutes={step.timer_minutes} 
                              stepNumber={step.step_number}
                            />
                          )}
                        </div>
                        <p className={`text-gray-700 leading-relaxed ${
                          completedSteps.has(step.step_number) ? 'line-through text-gray-500' : ''
                        }`}>
                          {step.instruction}
                        </p>
                        {step.image_url && (
                          <img
                            src={step.image_url}
                            alt={`Step ${step.step_number}`}
                            className="mt-3 rounded-lg max-w-full h-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collaboration Section - Show for authenticated users */}
        {user && (
          <CollaborationSection 
            recipeId={id!}
            isOwner={isOwner}
            recipeTitle={recipe.title}
            originalCurator={originalCurator}
          />
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
