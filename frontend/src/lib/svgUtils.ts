/**
 * Utility functions for SVG manipulation and calculations
 */

/**
 * Calculate the center point of an SVG element (polygon, path, rect, etc.)
 */
export const getSVGElementCenter = (element: SVGGraphicsElement): { x: number; y: number } => {
  try {
    const bbox = element.getBBox();
    return {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };
  } catch (error) {
    console.error('Error getting SVG element center:', error);
    return { x: 0, y: 0 };
  }
};

/**
 * Get the bounding box of an SVG element
 */
export const getSVGElementBBox = (element: SVGGraphicsElement) => {
  try {
    return element.getBBox();
  } catch (error) {
    console.error('Error getting SVG element bounding box:', error);
    return { x: 0, y: 0, width: 0, height: 0 };
  }
};

/**
 * Convert screen coordinates to SVG coordinates
 */
export const screenToSVGCoords = (
  svg: SVGSVGElement,
  screenX: number,
  screenY: number
): { x: number; y: number } => {
  const point = svg.createSVGPoint();
  point.x = screenX;
  point.y = screenY;

  try {
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = point.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
  } catch (error) {
    console.error('Error converting screen to SVG coords:', error);
  }

  return { x: screenX, y: screenY };
};

/**
 * Apply smooth highlighting animation to an element
 * Always uses green highlight regardless of room status
 */
export const applyHighlight = (element: HTMLElement) => {
  const highlightColor = '#52c41a'; // Bright green for visibility
  const glowColor = 'rgba(82, 196, 26, 0.9)'; // Green glow
  
  // Force green fill regardless of original status
  element.style.fill = highlightColor;
  element.style.fillOpacity = '0.7';
  
  // Thick green border
  element.style.stroke = highlightColor;
  element.style.strokeWidth = '6';
  element.style.vectorEffect = 'non-scaling-stroke';
  
  // Strong glow effect
  element.style.filter = `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 10px ${glowColor}) brightness(1.4)`;
  element.style.zIndex = '100';
  
  // Add transform for emphasis
  element.style.transform = 'scale(1.02)';
  element.style.transformOrigin = 'center';
};

/**
 * Remove highlighting from an element and restore original colors
 */
export const removeHighlight = (element: HTMLElement, isAvailable: boolean = true) => {
  element.style.stroke = 'hsl(var(--foreground))';
  element.style.strokeWidth = '2';
  element.style.fillOpacity = '0.3';
  element.style.filter = 'none';
  element.style.zIndex = '1';
  element.style.transform = 'scale(1)';
  element.style.transformOrigin = 'center';
  
  // Restore original fill based on availability
  if (isAvailable) {
    element.style.fill = 'hsl(var(--primary))';
  } else {
    element.style.fill = 'hsl(var(--destructive))';
  }
};

/**
 * Apply hover effect to an element
 */
export const applyHoverEffect = (element: HTMLElement) => {
  const hoverColor = '#73d13d'; // Light green for hover
  
  element.style.fillOpacity = '0.5';
  element.style.strokeWidth = '4';
  element.style.stroke = hoverColor;
  element.style.filter = `drop-shadow(0 0 8px rgba(115, 209, 61, 0.6)) brightness(1.15)`;
  element.style.transform = 'scale(1.01)';
  element.style.transformOrigin = 'center';
};

/**
 * Remove hover effect from an element
 */
export const removeHoverEffect = (element: HTMLElement) => {
  element.style.fillOpacity = '0.3';
  element.style.strokeWidth = '2';
  element.style.stroke = 'hsl(var(--foreground))';
  element.style.filter = 'none';
  element.style.transform = 'scale(1)';
  element.style.transformOrigin = 'center';
};
