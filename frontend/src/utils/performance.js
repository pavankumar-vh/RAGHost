// Performance Optimization Utilities for 60fps

/**
 * Request Animation Frame wrapper for smooth animations
 */
export const smoothRAF = (callback) => {
  return window.requestAnimationFrame(callback);
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for scroll/resize events
 */
export const throttle = (func, limit = 16) => { // 16ms = ~60fps
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load images for better performance
 */
export const lazyLoadImage = (imgElement) => {
  if ('loading' in HTMLImageElement.prototype) {
    imgElement.loading = 'lazy';
  } else {
    // Fallback for browsers that don't support native lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(imgElement);
  }
};

/**
 * Optimize will-change property
 * Add will-change before animation, remove after
 */
export const optimizeWillChange = (element, properties) => {
  element.style.willChange = properties;
  
  return () => {
    // Remove will-change after animation completes
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 1000);
  };
};

/**
 * Check if device prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimal animation duration based on user preference
 */
export const getAnimationDuration = (defaultMs = 300) => {
  return prefersReducedMotion() ? 0 : defaultMs;
};

/**
 * Passive event listener for better scroll performance
 */
export const addPassiveEventListener = (element, event, handler) => {
  element.addEventListener(event, handler, { passive: true });
};

/**
 * Remove jank from scroll by using transform instead of top/left
 */
export const smoothScrollTo = (targetY, duration = 300) => {
  const startY = window.pageYOffset;
  const difference = targetY - startY;
  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    window.scrollTo(0, startY + difference * easeOut);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

/**
 * Batch DOM updates for better performance
 */
export const batchDOMUpdates = (updates) => {
  window.requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

/**
 * Measure FPS
 */
export const measureFPS = (duration = 1000) => {
  return new Promise((resolve) => {
    let frames = 0;
    let lastTime = performance.now();
    
    const countFrames = (currentTime) => {
      frames++;
      
      if (currentTime - lastTime >= duration) {
        resolve((frames * 1000) / (currentTime - lastTime));
      } else {
        requestAnimationFrame(countFrames);
      }
    };
    
    requestAnimationFrame(countFrames);
  });
};

/**
 * Enable GPU acceleration for element
 */
export const enableGPUAcceleration = (element) => {
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'transform';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
};

export default {
  smoothRAF,
  debounce,
  throttle,
  lazyLoadImage,
  optimizeWillChange,
  prefersReducedMotion,
  getAnimationDuration,
  addPassiveEventListener,
  smoothScrollTo,
  batchDOMUpdates,
  measureFPS,
  enableGPUAcceleration,
};
