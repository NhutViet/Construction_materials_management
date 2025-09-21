import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { getUnreadCount } from '../store/slices/notificationSlice';

interface UseNotificationPollingOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export const useNotificationPolling = (options: UseNotificationPollingOptions = {}) => {
  const { enabled = true, interval = 30000 } = options; // Default 30 seconds
  const dispatch = useDispatch<AppDispatch>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up polling
    intervalRef.current = setInterval(() => {
      dispatch(getUnreadCount());
    }, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, enabled, interval]);

  // Return cleanup function for manual control
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      dispatch(getUnreadCount());
    }, interval);
  };

  return { stopPolling, startPolling };
};
