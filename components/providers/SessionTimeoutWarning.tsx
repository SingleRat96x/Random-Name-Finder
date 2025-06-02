'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function SessionTimeoutWarning() {
  const { sessionTimeoutWarning, extendSession, logout } = useAuth();
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (!sessionTimeoutWarning) {
      setCountdown(120);
      return;
    }

    // Start countdown when warning is shown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionTimeoutWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStayLoggedIn = () => {
    extendSession();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Dialog open={sessionTimeoutWarning}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">Session Expiring Soon</DialogTitle>
          <DialogDescription className="text-center">
            Your session will automatically expire due to inactivity in:
          </DialogDescription>
        </DialogHeader>

        <div className="text-center py-4">
          <div className="flex items-center justify-center space-x-2 text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
            <Clock className="h-6 w-6" />
            <span>{formatTime(countdown)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Click &quot;Stay Logged In&quot; to continue your session
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Logout Now
          </Button>
          <Button 
            onClick={handleStayLoggedIn}
            className="w-full sm:w-auto"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 