
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate?: (url: string) => void;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate }: AvatarUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true, // Replace existing file
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        }
      });

      if (updateError) throw updateError;

      toast({
        title: "Avatar updated successfully",
        description: "Your profile picture has been updated.",
      });

      onAvatarUpdate?.(avatarUrl);
      
      // Clean up preview URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update your avatar. Please try again.",
        variant: "destructive",
      });
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const displayAvatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayAvatarUrl} />
          <AvatarFallback className="text-2xl">
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
             user?.email?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="text-center">
        <Label htmlFor="avatar-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            asChild
          >
            <span>
              <Camera className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Change Avatar'}
            </span>
          </Button>
        </Label>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>
    </div>
  );
};
