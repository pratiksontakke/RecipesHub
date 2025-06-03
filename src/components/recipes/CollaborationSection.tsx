import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, X, Users, Mail, Crown, Edit3 } from 'lucide-react';

interface Collaborator {
  id: string;
  email: string;
  role: 'viewer' | 'editor';
  status: 'pending' | 'accepted';
  name?: string;
}

export const CollaborationSection = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      email: 'john@example.com',
      role: 'editor',
      status: 'accepted',
      name: 'John Doe'
    },
    {
      id: '2',
      email: 'sarah@example.com',
      role: 'viewer',
      status: 'pending',
      name: 'Sarah Smith'
    }
  ]);
  
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('viewer');

  const handleAddCollaborator = () => {
    if (newCollaboratorEmail.trim()) {
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        email: newCollaboratorEmail.trim(),
        role: newCollaboratorRole,
        status: 'pending'
      };
      setCollaborators([...collaborators, newCollaborator]);
      setNewCollaboratorEmail('');
      setNewCollaboratorRole('viewer');
    }
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const handleRoleChange = (id: string, newRole: 'viewer' | 'editor') => {
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, role: newRole } : c
    ));
  };

  const getRoleIcon = (role: string) => {
    return role === 'editor' ? <Edit3 className="h-3 w-3" /> : <Crown className="h-3 w-3" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recipe Collaboration
        </CardTitle>
        <p className="text-sm text-gray-600">
          Invite others to view or edit this recipe
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Collaborator */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Invite Collaborator</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address..."
              value={newCollaboratorEmail}
              onChange={(e) => setNewCollaboratorEmail(e.target.value)}
              type="email"
              className="flex-1"
            />
            <Select value={newCollaboratorRole} onValueChange={(value: 'viewer' | 'editor') => setNewCollaboratorRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddCollaborator}
              disabled={!newCollaboratorEmail.trim()}
              size="sm"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Existing Collaborators */}
        {collaborators.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Current Collaborators</h4>
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {collaborator.name || collaborator.email}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(collaborator.status)}`}
                        >
                          {collaborator.status}
                        </Badge>
                      </div>
                      {collaborator.name && (
                        <p className="text-xs text-gray-500">{collaborator.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={collaborator.role} 
                      onValueChange={(value: 'viewer' | 'editor') => handleRoleChange(collaborator.id, value)}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(collaborator.role)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-1">
                            <Edit3 className="h-3 w-3" />
                            Editor
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permission Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-800 space-y-1">
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3" />
              <span className="font-medium">Viewers:</span> Can view the recipe and leave comments
            </div>
            <div className="flex items-center gap-1">
              <Edit3 className="h-3 w-3" />
              <span className="font-medium">Editors:</span> Can modify ingredients, steps, and recipe details
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
