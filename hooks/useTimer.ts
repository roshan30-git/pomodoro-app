
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number; // in seconds
  onEnd: () => void;
  autoStart: boolean;
}

export const useTimer = ({ initialTime, onEnd, autoStart }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
    }
  }, [isActive]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);
  
  const reset = useCallback(() => {
    setIsActive(autoStart);
    setTimeLeft(initialTime);
  }, [initialTime, autoStart]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            onEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onEnd]);
  
  useEffect(() => {
    setTimeLeft(initialTime);
    setIsActive(autoStart);
  }, [initialTime, autoStart]);

  return { timeLeft, isActive, start, pause, reset };
};
