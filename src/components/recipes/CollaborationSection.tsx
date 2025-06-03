import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, UserPlus, RefreshCw, Crown, Check, X } from 'lucide-react';

interface CollaborationSectionProps {
  recipeId: string;
  isOwner: boolean;
  recipeTitle: string;
  originalCurator?: {
    name?: string;
    email: string;
  };
}

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  status: string;
  invited_email: string | null;
  invited_at: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

export const CollaborationSection = ({ recipeId, isOwner, recipeTitle, originalCurator }: CollaborationSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: collaborators, refetch: refetchCollaborators } = useQuery({
    queryKey: ['collaborators', recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_collaborators')
        .select(`
          *,
          profiles!fk_recipe_collaborators_profiles(full_name, email)
        `)
        .eq('recipe_id', recipeId);

      if (error) throw error;
      return data as Collaborator[];
    },
    enabled: !!recipeId,
  });

  const inviteCollaborator = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Check if user exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      const { data, error } = await supabase
        .from('recipe_collaborators')
        .insert([{
          recipe_id: recipeId,
          user_id: existingProfile?.id || null, // Allow null for non-existing users
          invited_email: email,
          role,
          status: 'pending',
          invited_by: user?.id || '',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail('');
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['collaborators', recipeId] });
      refetchCollaborators();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const updateCollaboratorRole = useMutation({
    mutationFn: async ({ collaboratorId, newRole }: { collaboratorId: string; newRole: string }) => {
      const { error } = await supabase
        .from('recipe_collaborators')
        .update({ role: newRole })
        .eq('id', collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "Collaborator role has been updated",
      });
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['collaborators', recipeId] });
      refetchCollaborators();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const updateCollaboratorStatus = useMutation({
    mutationFn: async ({ collaboratorId, newStatus }: { collaboratorId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('recipe_collaborators')
        .update({ status: newStatus })
        .eq('id', collaboratorId);

      if (error) throw error;
    },
    onSuccess: (_, { newStatus }) => {
      toast({
        title: "Status updated",
        description: `Invitation ${newStatus}`,
      });
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['collaborators', recipeId] });
      refetchCollaborators();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const removeCollaborator = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('recipe_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Collaborator removed",
        description: "Collaborator has been removed from the recipe",
      });
      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['collaborators', recipeId] });
      refetchCollaborators();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove collaborator",
        variant: "destructive",
      });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Check if email is already invited
    const existingInvite = collaborators?.find(
      c => c.invited_email === inviteEmail || c.profiles?.email === inviteEmail
    );

    if (existingInvite) {
      toast({
        title: "Error",
        description: "This email has already been invited",
        variant: "destructive",
      });
      return;
    }

    inviteCollaborator.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all related queries that might be affected by collaboration changes
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collaborators', recipeId] }),
        queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] }),
        queryClient.invalidateQueries({ queryKey: ['collaboration-status', recipeId, user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['recipes', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['collaborated-recipes', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['ingredients', recipeId] }),
        queryClient.invalidateQueries({ queryKey: ['recipe_steps', recipeId] }),
      ]);
      
      // Force refetch of collaborators data
      await refetchCollaborators();
      
      toast({
        title: "Synced",
        description: "Collaboration data has been refreshed",
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const isCurrentUserCollaborator = (collaborator: Collaborator) => {
    return collaborator.user_id === user?.id;
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Curator Section */}
        {originalCurator && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Original Recipe Creator</span>
            </div>
            <p className="text-sm text-orange-700">
              {originalCurator.name || originalCurator.email}
            </p>
          </div>
        )}

        {/* Invite Section - Only show for owners */}
        {isOwner && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Invite Collaborators</h3>
            <div className="flex gap-2">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address..."
                type="email"
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={(value: 'editor' | 'viewer') => setInviteRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleInvite}
                disabled={inviteCollaborator.isPending}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>
        )}

        {/* Current Collaborators */}
        {collaborators && collaborators.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Current Collaborators</h3>
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {collaborator.profiles?.full_name || collaborator.invited_email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {collaborator.profiles?.email || collaborator.invited_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(collaborator.status)}>
                      {collaborator.status}
                    </Badge>
                    
                    {/* If current user is the collaborator and status is pending */}
                    {isCurrentUserCollaborator(collaborator) && collaborator.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCollaboratorStatus.mutate({ 
                            collaboratorId: collaborator.id, 
                            newStatus: 'accepted' 
                          })}
                          disabled={updateCollaboratorStatus.isPending}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCollaboratorStatus.mutate({ 
                            collaboratorId: collaborator.id, 
                            newStatus: 'declined' 
                          })}
                          disabled={updateCollaboratorStatus.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    {/* If owner, show role management and remove options */}
                    {isOwner && !isCurrentUserCollaborator(collaborator) && (
                      <div className="flex items-center gap-2">
                        <Select 
                          value={collaborator.role}
                          onValueChange={(newRole) => updateCollaboratorRole.mutate({ 
                            collaboratorId: collaborator.id, 
                            newRole 
                          })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeCollaborator.mutate(collaborator.id)}
                          disabled={removeCollaborator.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    {/* If not owner and not current user, just show role */}
                    {!isOwner && !isCurrentUserCollaborator(collaborator) && (
                      <Badge variant="outline">{collaborator.role}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!collaborators || collaborators.length === 0) && !isOwner && (
          <p className="text-gray-500 text-center py-4">
            No collaborators yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
