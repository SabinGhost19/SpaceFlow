import React, { useMemo, CSSProperties } from 'react';
import { SVGElement } from '@/utils/svgParser';

interface ShapeComponentProps {
    element: SVGElement;
    color: string;
    scale: number;
    onClick?: () => void;
    isSelected?: boolean;
    isVisible?: boolean; // For viewport culling
}

// Memoized shape component for optimal performance with 10,000+ elements
export const ShapeComponent = React.memo<ShapeComponentProps>(({
    element,
    color,
    scale,
    onClick,
    isSelected = false,
    isVisible = true
}) => {
    const { bounds, coordinates, type } = element;

    // Cache clip-path calculation
    const clipPath = useMemo(() => {
        if (coordinates.length === 0 || type === 'circle' || type === 'ellipse') {
            return 'none';
        }

        // Optimize for large coordinate sets - sample if too many points
        const maxPoints = 100;
        const sampledCoords = coordinates.length > maxPoints
            ? coordinates.filter((_, i) => i % Math.ceil(coordinates.length / maxPoints) === 0)
            : coordinates;

        const points = sampledCoords.map(([x, y]) => {
            const percentX = ((x - bounds.x) / bounds.width) * 100;
            const percentY = ((y - bounds.y) / bounds.height) * 100;
            return `${percentX.toFixed(2)}% ${percentY.toFixed(2)}%`;
        }).join(', ');

        return `polygon(${points})`;
    }, [coordinates, bounds, type]);

    // Memoize style object to prevent re-renders
    const style = useMemo<CSSProperties>(() => {
        const isCircle = type === 'circle' || type === 'ellipse';

        return {
            position: 'absolute',
            left: `${bounds.x * scale}px`,
            top: `${bounds.y * scale}px`,
            width: `${bounds.width * scale}px`,
            height: `${bounds.height * scale}px`,
            backgroundColor: isSelected ? '#10b981' : color,
            clipPath: !isCircle ? clipPath : 'none',
            WebkitClipPath: !isCircle ? clipPath : 'none',
            borderRadius: isCircle ? '50%' : '0',
            border: isSelected
                ? '2px solid #10b981'
                : '0.5px solid rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: isSelected ? 'all 0.2s ease-out' : 'none',
            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: 'center',
            zIndex: isSelected ? 1000 : 1,
            opacity: isSelected ? 0.95 : 0.8,
            boxShadow: isSelected
                ? '0 0 0 3px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(0,0,0,0.2)'
                : 'none',
            display: isVisible ? 'block' : 'none',
            willChange: isSelected ? 'transform' : 'auto',
            pointerEvents: 'auto'
        };
    }, [bounds, scale, clipPath, type, color, isSelected, isVisible]);

    // Don't render if not visible (viewport culling)
    if (!isVisible) return null;

    return (
        <div
            onClick={onClick}
            style={style}
            className="shape-component"
            data-element-id={element.id}
            data-element-type={type}
        />
    );
}, (prevProps, nextProps) => {
    // Custom comparison for React.memo optimization
    return (
        prevProps.element.id === nextProps.element.id &&
        prevProps.color === nextProps.color &&
        prevProps.scale === nextProps.scale &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isVisible === nextProps.isVisible
    );
});

interface PolygonShapeProps {
    coordinates: number[][];
    bounds: { x: number; y: number; width: number; height: number };
    color: string;
    scale: number;
    onClick?: () => void;
    isSelected?: boolean;
    stroke?: string;
    strokeWidth?: number;
}

// Pure React component using CSS clip-path
export const PolygonShape: React.FC<PolygonShapeProps> = ({
    coordinates,
    bounds,
    color,
    scale,
    onClick,
    isSelected = false,
    stroke = '#333',
    strokeWidth = 1
}) => {
    // Create polygon clip-path
    const createClipPath = (): string => {
        if (coordinates.length === 0) return 'none';

        const points = coordinates.map(([x, y]) => {
            const relX = ((x - bounds.x) / bounds.width) * 100;
            const relY = ((y - bounds.y) / bounds.height) * 100;
            return `${relX}% ${relY}%`;
        }).join(', ');

        return `polygon(${points})`;
    };

    return (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                left: `${bounds.x * scale}px`,
                top: `${bounds.y * scale}px`,
                width: `${bounds.width * scale}px`,
                height: `${bounds.height * scale}px`,
                backgroundColor: isSelected ? '#52c41a' : color,
                clipPath: createClipPath(),
                WebkitClipPath: createClipPath(),
                cursor: 'pointer',
                opacity: 0.8,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected
                    ? '0 0 20px rgba(82, 196, 26, 0.6)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: isSelected ? `${strokeWidth * 2}px solid #52c41a` : `${strokeWidth}px solid ${stroke}`,
                zIndex: isSelected ? 100 : 1,
            }}
            className="polygon-shape"
        />
    );
};

interface RectShapeProps {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    scale: number;
    onClick?: () => void;
    isSelected?: boolean;
    stroke?: string;
    strokeWidth?: number;
}

// Simple rectangle component
export const RectShape: React.FC<RectShapeProps> = ({
    x,
    y,
    width,
    height,
    color,
    scale,
    onClick,
    isSelected = false,
    stroke = '#333',
    strokeWidth = 1
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                left: `${x * scale}px`,
                top: `${y * scale}px`,
                width: `${width * scale}px`,
                height: `${height * scale}px`,
                backgroundColor: isSelected ? '#52c41a' : color,
                border: isSelected ? `${strokeWidth * 2}px solid #52c41a` : `${strokeWidth}px solid ${stroke}`,
                cursor: 'pointer',
                opacity: 0.8,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected
                    ? '0 0 20px rgba(82, 196, 26, 0.6)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: isSelected ? 100 : 1,
            }}
            className="rect-shape"
        />
    );
};

interface CircleShapeProps {
    cx: number;
    cy: number;
    r: number;
    color: string;
    scale: number;
    onClick?: () => void;
    isSelected?: boolean;
    stroke?: string;
    strokeWidth?: number;
}

// Circle component
export const CircleShape: React.FC<CircleShapeProps> = ({
    cx,
    cy,
    r,
    color,
    scale,
    onClick,
    isSelected = false,
    stroke = '#333',
    strokeWidth = 1
}) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                left: `${(cx - r) * scale}px`,
                top: `${(cy - r) * scale}px`,
                width: `${r * 2 * scale}px`,
                height: `${r * 2 * scale}px`,
                backgroundColor: isSelected ? '#52c41a' : color,
                border: isSelected ? `${strokeWidth * 2}px solid #52c41a` : `${strokeWidth}px solid ${stroke}`,
                borderRadius: '50%',
                cursor: 'pointer',
                opacity: 0.8,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isSelected
                    ? '0 0 20px rgba(82, 196, 26, 0.6)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: isSelected ? 100 : 1,
            }}
            className="circle-shape"
        />
    );
};
