
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RecipeForm } from '@/components/recipes/RecipeForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateRecipe = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to create recipes</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
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
            onClick={() => navigate('/recipes')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Recipe</h1>
          <p className="text-gray-600 mt-2">Share your culinary creation with the world</p>
        </div>
        
        <RecipeForm mode="create" />
      </div>
    </div>
  );
};

export default CreateRecipe;
