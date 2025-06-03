
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface RecipeTimerProps {
  minutes: number;
  stepNumber: number;
}

export const RecipeTimer = ({ minutes, stepNumber }: RecipeTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            // Play notification sound or show alert
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Step ${stepNumber} Timer Finished!`, {
                body: `Your ${minutes} minute timer is done.`,
                icon: '/favicon.ico'
              });
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, minutes, stepNumber]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    setIsFinished(false);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border">
      <Clock className="h-4 w-4 text-orange-600" />
      <Badge variant={isFinished ? "destructive" : isRunning ? "default" : "secondary"}>
        {formatTime(timeLeft)}
      </Badge>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={toggleTimer}
          disabled={timeLeft === 0 && !isRunning}
        >
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={resetTimer}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      {isFinished && (
        <span className="text-sm font-medium text-red-600">
          Time's up!
        </span>
      )}
    </div>
  );
};
