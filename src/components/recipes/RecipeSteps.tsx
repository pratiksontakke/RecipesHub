
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, Square } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type RecipeStep = Tables<'recipe_steps'>;

interface RecipeStepsProps {
  steps: RecipeStep[];
}

export const RecipeSteps = ({ steps }: RecipeStepsProps) => {
  const [activeTimers, setActiveTimers] = useState<Record<string, {
    remaining: number;
    interval: NodeJS.Timeout | null;
    isRunning: boolean;
  }>>({});

  const startTimer = (stepId: string, minutes: number) => {
    const seconds = minutes * 60;
    
    // Clear existing timer if any
    if (activeTimers[stepId]?.interval) {
      clearInterval(activeTimers[stepId].interval);
    }

    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const current = prev[stepId];
        if (!current || current.remaining <= 1) {
          clearInterval(interval);
          // Timer finished - you could add notification here
          alert(`Timer finished for step ${steps.find(s => s.id === stepId)?.step_number}!`);
          return {
            ...prev,
            [stepId]: {
              remaining: 0,
              interval: null,
              isRunning: false
            }
          };
        }
        return {
          ...prev,
          [stepId]: {
            ...current,
            remaining: current.remaining - 1
          }
        };
      });
    }, 1000);

    setActiveTimers(prev => ({
      ...prev,
      [stepId]: {
        remaining: seconds,
        interval,
        isRunning: true
      }
    }));
  };

  const pauseTimer = (stepId: string) => {
    const timer = activeTimers[stepId];
    if (timer?.interval) {
      clearInterval(timer.interval);
      setActiveTimers(prev => ({
        ...prev,
        [stepId]: {
          ...timer,
          interval: null,
          isRunning: false
        }
      }));
    }
  };

  const resumeTimer = (stepId: string) => {
    const timer = activeTimers[stepId];
    if (timer && !timer.isRunning && timer.remaining > 0) {
      const interval = setInterval(() => {
        setActiveTimers(prev => {
          const current = prev[stepId];
          if (!current || current.remaining <= 1) {
            clearInterval(interval);
            alert(`Timer finished for step ${steps.find(s => s.id === stepId)?.step_number}!`);
            return {
              ...prev,
              [stepId]: {
                remaining: 0,
                interval: null,
                isRunning: false
              }
            };
          }
          return {
            ...prev,
            [stepId]: {
              ...current,
              remaining: current.remaining - 1
            }
          };
        });
      }, 1000);

      setActiveTimers(prev => ({
        ...prev,
        [stepId]: {
          ...timer,
          interval,
          isRunning: true
        }
      }));
    }
  };

  const stopTimer = (stepId: string) => {
    const timer = activeTimers[stepId];
    if (timer?.interval) {
      clearInterval(timer.interval);
    }
    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[stepId];
      return newTimers;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (steps.length === 0) {
    return (
      <p className="text-gray-500 italic">No instructions added yet.</p>
    );
  }

  return (
    <ol className="space-y-6">
      {steps.map((step) => {
        const timer = activeTimers[step.id];
        
        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {step.step_number}
            </div>
            
            <div className="flex-1">
              <p className="text-gray-900 mb-3">{step.instruction}</p>
              
              {step.image_url && (
                <img
                  src={step.image_url}
                  alt={`Step ${step.step_number}`}
                  className="w-full max-w-xs h-32 object-cover rounded-lg mb-3"
                />
              )}

              {step.timer_minutes && (
                <div className="flex items-center gap-2 mt-2">
                  <Timer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{step.timer_minutes} minutes</span>
                  
                  {timer ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {formatTime(timer.remaining)}
                      </span>
                      {timer.isRunning ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseTimer(step.id)}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      ) : timer.remaining > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeTimer(step.id)}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stopTimer(step.id)}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startTimer(step.id, step.timer_minutes!)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start Timer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
