import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for 60fps smooth animations
 */
export const useSmoothAnimation = (isOpen, duration = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Use RAF for smooth rendering
      animationRef.current = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Cleanup after animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, duration]);

  return { shouldRender, isAnimating };
};

/**
 * Hook for optimized scroll performance
 */
export const useOptimizedScroll = (callback, deps = []) => {
  useEffect(() => {
    let rafId = null;
    let lastScrollY = window.pageYOffset;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        callback(currentScrollY, lastScrollY);
        lastScrollY = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, deps);
};

/**
 * Hook for optimized resize handling
 */
export const useOptimizedResize = (callback, deps = []) => {
  useEffect(() => {
    let rafId = null;

    const handleResize = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        callback(window.innerWidth, window.innerHeight);
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, deps);
};

/**
 * Hook for GPU-accelerated animations
 */
export const useGPUAcceleration = () => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';

      return () => {
        element.style.willChange = 'auto';
      };
    }
  }, []);

  return elementRef;
};

/**
 * Hook for smooth modal transitions
 */
export const useSmoothModal = (duration = 300) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const open = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const close = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, duration);
  };

  return { isOpen, isClosing, open, close };
};

/**
 * Hook for FPS monitoring (development only)
 */
export const useFPSMonitor = (enabled = false) => {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    let frames = 0;
    let lastTime = performance.now();
    let rafId;

    const measureFPS = (currentTime) => {
      frames++;
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const currentFPS = Math.round((frames * 1000) / elapsed);
        setFps(currentFPS);
        frames = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enabled]);

  return fps;
};

export default {
  useSmoothAnimation,
  useOptimizedScroll,
  useOptimizedResize,
  useGPUAcceleration,
  useSmoothModal,
  useFPSMonitor,
};
