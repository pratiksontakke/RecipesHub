
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaUpload } from './MediaUpload';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Step {
  instruction: string;
  timer_minutes?: number | string;
  image_url?: string;
  video_url?: string;
}

interface StepsFormProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export const StepsForm = ({ steps, onChange }: StepsFormProps) => {
  const addStep = () => {
    onChange([...steps, { instruction: '', timer_minutes: '', image_url: '', video_url: '' }]);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof Step, value: string | number) => {
    const updated = steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    );
    onChange(updated);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const updated = [...steps];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <span className="font-medium text-gray-700">Step {index + 1}</span>
            <div className="ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeStep(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruction
            </label>
            <Textarea
              value={step.instruction}
              onChange={(e) => updateStep(index, 'instruction', e.target.value)}
              placeholder="Describe what to do in this step..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timer (minutes)
              </label>
              <Input
                type="number"
                min="0"
                value={step.timer_minutes || ''}
                onChange={(e) => updateStep(index, 'timer_minutes', parseInt(e.target.value) || '')}
                placeholder="Optional timer..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Image (Optional)
            </label>
            <MediaUpload
              currentUrl={step.image_url || ''}
              onUpload={(url) => updateStep(index, 'image_url', url)}
              type="image"
              bucket="recipe-media"
            />
          </div>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addStep}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Step
      </Button>
    </div>
  );
};
