
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadProps {
  currentUrl: string;
  onUpload: (url: string) => void;
  type: 'image' | 'video';
  bucket: string;
}

export const MediaUpload = ({ currentUrl, onUpload, type, bucket }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
      toast({
        title: "Upload successful",
        description: `${type} uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    onUpload('');
  };

  return (
    <div className="space-y-4">
      {currentUrl ? (
        <div className="relative">
          {type === 'image' ? (
            <img
              src={currentUrl}
              alt="Upload preview"
              className="w-full h-40 object-cover rounded-lg border"
            />
          ) : (
            <video
              src={currentUrl}
              className="w-full h-40 object-cover rounded-lg border"
              controls
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeFile}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor={`file-upload-${type}`}>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Uploading...' : `Upload ${type}`}
                </span>
              </Button>
            </label>
            <Input
              id={`file-upload-${type}`}
              type="file"
              accept={type === 'image' ? 'image/*' : 'video/*'}
              onChange={uploadFile}
              disabled={uploading}
              className="sr-only"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, MOV up to 50MB'}
          </p>
        </div>
      )}
    </div>
  );
};
