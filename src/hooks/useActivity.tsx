
import { useState, useRef, useEffect, useCallback } from 'react';

export const useActivity = () => {
  const [userActive, setUserActive] = useState<boolean>(true);
  const lastActivityTime = useRef<number>(Date.now());
  const lastToastTime = useRef<number>(0);
  
  // Mark user as active when this hook is first used
  useEffect(() => {
    lastActivityTime.current = Date.now();
    setUserActive(true);
    
    // Set up activity monitoring
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'focus', 'visibilitychange'];
    
    const handleUserActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime.current;
      
      // If it's been a while since the last activity, mark as newly active
      if (timeSinceLastActivity > 30000) { // 30 seconds of inactivity threshold
        console.log('User returned after inactivity');
      }
      
      lastActivityTime.current = now;
      setUserActive(true);
    };
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Set up visibility change detection
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('App became visible, marking user as active');
        handleUserActivity();
      }
    });
    
    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  // Function to record user activity
  const recordUserActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
    setUserActive(true);
  }, []);
  
  // Function to determine if we should refetch based on activity
  const shouldRefetch = useCallback(() => {
    // Only refetch if the user has been active recently (within the last minute)
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime.current;
    
    // User must be active within the last minute to trigger a refetch
    const isRecentlyActive = timeSinceLastActivity < 60000;
    
    if (!isRecentlyActive) {
      console.log('Skipping refetch due to user inactivity');
      return false;
    }
    
    return true;
  }, []);

  return {
    userActive,
    recordUserActivity,
    shouldRefetch,
    lastActivityTime,
    lastToastTime
  };
};
