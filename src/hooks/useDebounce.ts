import { useState, useCallback } from 'react';

export const useDebounce = (delay: number = 1000) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const debounce = useCallback((callback: () => void | Promise<void>) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    const result = callback();
    
    if (result instanceof Promise) {
      result.finally(() => {
        setTimeout(() => setIsProcessing(false), delay);
      });
    } else {
      setTimeout(() => setIsProcessing(false), delay);
    }
  }, [isProcessing, delay]);

  return { isProcessing, debounce };
};
