
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';

export const UserOverviewCard = () => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: recipeCount } = useQuery({
    queryKey: ['recipe-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('recipes')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id)
        .eq('is_public', true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: draftCount } = useQuery({
    queryKey: ['draft-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('recipes')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id)
        .eq('is_public', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-lg">
              {profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">
            {profile?.full_name || user?.user_metadata?.full_name || 'Chef'}
          </CardTitle>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{recipeCount}</div>
              <div className="text-sm text-gray-600">Published Recipes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{draftCount}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
};
