
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditRecipe = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: recipe, isLoading: recipeLoading } = useQuery({
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

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading || recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to edit recipes</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
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

  // Check if user is owner or accepted editor collaborator
  const isOwner = recipe.user_id === user.id;
  const isAcceptedEditor = collaborationStatus?.status === 'accepted' && collaborationStatus?.role === 'editor';
  const canEdit = isOwner || isAcceptedEditor;

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access denied</h1>
          <p className="text-gray-600 mb-4">
            {collaborationStatus?.status === 'pending' 
              ? 'Your collaboration invitation is still pending approval'
              : collaborationStatus?.role === 'viewer'
              ? 'You have viewer access only. Editor access is required to edit recipes'
              : 'You can only edit recipes you own or have editor access to'
            }
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
          <p className="text-gray-600 mt-2">
            {isOwner ? 'Update your recipe details' : 'Editing as collaborator'}
          </p>
        </div>
        
        <RecipeForm 
          mode="edit" 
          initialData={{
            recipe,
            ingredients: ingredients || [],
            steps: steps || []
          }}
        />
      </div>
    </div>
  );
};

export default EditRecipe;
