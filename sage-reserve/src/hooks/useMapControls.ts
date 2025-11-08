import { useState, useCallback, useRef, useEffect } from 'react';

interface MapTransform {
  zoom: number;
  translateX: number;
  translateY: number;
}

interface UseMapControlsOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

export const useMapControls = (options: UseMapControlsOptions = {}) => {
  const {
    minZoom = 0.1,
    maxZoom = 5,
    initialZoom = 1
  } = options;

  const [transform, setTransform] = useState<MapTransform>({
    zoom: initialZoom,
    translateX: 0,
    translateY: 0
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastTranslate = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Zoom in function
  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, maxZoom)
    }));
  }, [maxZoom]);

  // Zoom out function
  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, minZoom)
    }));
  }, [minZoom]);

  // Reset view to initial state
  const resetView = useCallback(() => {
    setTransform({
      zoom: initialZoom,
      translateX: 0,
      translateY: 0
    });
  }, [initialZoom]);

  // Handle wheel zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    
    setTransform(prev => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, prev.zoom * delta));
      return {
        ...prev,
        zoom: newZoom
      };
    });
  }, [minZoom, maxZoom]);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      dragStartPos.current = {
        x: event.clientX - lastTranslate.current.x,
        y: event.clientY - lastTranslate.current.y
      };
    }
  }, []);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;

    const newTranslateX = event.clientX - dragStartPos.current.x;
    const newTranslateY = event.clientY - dragStartPos.current.y;

    lastTranslate.current = {
      x: newTranslateX,
      y: newTranslateY
    };

    setTransform(prev => ({
      ...prev,
      translateX: newTranslateX,
      translateY: newTranslateY
    }));
  }, [isDragging]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Center on specific coordinates with smooth animation
  const centerOnPoint = useCallback((x: number, y: number, containerWidth: number, containerHeight: number, targetZoom: number = 2.5) => {
    setIsAnimating(true);
    
    const duration = 800; // Animation duration in ms
    const startTime = performance.now();
    const startTransform = { ...transform };
    
    const targetTransform = {
      zoom: Math.min(targetZoom, maxZoom),
      translateX: containerWidth / 2 - x * Math.min(targetZoom, maxZoom),
      translateY: containerHeight / 2 - y * Math.min(targetZoom, maxZoom),
    };

    // Easing function for smooth animation
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      setTransform({
        zoom: startTransform.zoom + (targetTransform.zoom - startTransform.zoom) * easedProgress,
        translateX: startTransform.translateX + (targetTransform.translateX - startTransform.translateX) * easedProgress,
        translateY: startTransform.translateY + (targetTransform.translateY - startTransform.translateY) * easedProgress,
      });

      lastTranslate.current = {
        x: startTransform.translateX + (targetTransform.translateX - startTransform.translateX) * easedProgress,
        y: startTransform.translateY + (targetTransform.translateY - startTransform.translateY) * easedProgress,
      };

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [transform, maxZoom]);

  // Get transform style
  const getTransformStyle = useCallback(() => {
    return {
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.zoom})`,
      transition: isDragging || isAnimating ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  }, [transform, isDragging, isAnimating]);

  // Get cursor style
  const getCursorStyle = useCallback(() => {
    return isDragging ? 'grabbing' : 'grab';
  }, [isDragging]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    transform,
    isDragging,
    isAnimating,
    zoomIn,
    zoomOut,
    resetView,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    centerOnPoint,
    getTransformStyle,
    getCursorStyle
  };
};
