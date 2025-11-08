// SVG Parser - Parse SVG elements and extract coordinates
export interface SVGElement {
    id: string;
    type: 'path' | 'polygon' | 'rect' | 'circle' | 'line' | 'polyline' | 'ellipse';
    coordinates: number[][];
    attributes: Record<string, string>;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    transform?: string;
    shapeSignature?: string; // Used for grouping similar shapes
    area?: number; // For sorting/filtering
}

export interface ParsedSVG {
    elements: SVGElement[];
    viewBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    width: number;
    height: number;
    statistics: {
        totalElements: number;
        elementsByType: Record<string, number>;
        shapeGroups: number;
    };
}

// Parse path commands (M, L, C, Q, A, Z, etc.)
function parsePathData(d: string): number[][] {
    const coordinates: number[][] = [];
    const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
    
    let currentX = 0;
    let currentY = 0;
    
    commands.forEach(cmd => {
        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
        
        switch (type.toUpperCase()) {
            case 'M': // MoveTo
                currentX = args[0];
                currentY = args[1];
                coordinates.push([currentX, currentY]);
                break;
            case 'L': // LineTo
                for (let i = 0; i < args.length; i += 2) {
                    currentX = args[i];
                    currentY = args[i + 1];
                    coordinates.push([currentX, currentY]);
                }
                break;
            case 'H': // Horizontal line
                currentX = args[0];
                coordinates.push([currentX, currentY]);
                break;
            case 'V': // Vertical line
                currentY = args[0];
                coordinates.push([currentX, currentY]);
                break;
            case 'C': // Cubic Bezier
                for (let i = 0; i < args.length; i += 6) {
                    coordinates.push([args[i], args[i + 1]]);
                    coordinates.push([args[i + 2], args[i + 3]]);
                    currentX = args[i + 4];
                    currentY = args[i + 5];
                    coordinates.push([currentX, currentY]);
                }
                break;
            case 'Q': // Quadratic Bezier
                for (let i = 0; i < args.length; i += 4) {
                    coordinates.push([args[i], args[i + 1]]);
                    currentX = args[i + 2];
                    currentY = args[i + 3];
                    coordinates.push([currentX, currentY]);
                }
                break;
            case 'Z': // ClosePath
                if (coordinates.length > 0) {
                    coordinates.push([...coordinates[0]]);
                }
                break;
        }
    });
    
    return coordinates;
}

// Parse polygon/polyline points
function parsePoints(points: string): number[][] {
    const coords = points.trim().split(/[\s,]+/).map(Number);
    const result: number[][] = [];
    
    for (let i = 0; i < coords.length; i += 2) {
        if (!isNaN(coords[i]) && !isNaN(coords[i + 1])) {
            result.push([coords[i], coords[i + 1]]);
        }
    }
    
    return result;
}

// Calculate bounding box from coordinates
function calculateBounds(coordinates: number[][]): { x: number; y: number; width: number; height: number } {
    if (coordinates.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const xs = coordinates.map(c => c[0]);
    const ys = coordinates.map(c => c[1]);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

// Get all attributes as object
function getAttributes(element: Element): Record<string, string> {
    const attrs: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
        attrs[attr.name] = attr.value;
    });
    return attrs;
}

// Generate a signature for shape similarity detection
function generateShapeSignature(coordinates: number[][], type: string): string {
    if (coordinates.length === 0) return `${type}-empty`;
    
    // Calculate normalized shape metrics
    const bounds = calculateBounds(coordinates);
    if (bounds.width === 0 || bounds.height === 0) return `${type}-degenerate`;
    
    // Normalize coordinates to 0-1 range
    const normalized = coordinates.map(([x, y]) => [
        (x - bounds.x) / bounds.width,
        (y - bounds.y) / bounds.height
    ]);
    
    // Calculate perimeter ratio
    const aspectRatio = Math.round((bounds.width / bounds.height) * 10) / 10;
    
    // Calculate number of vertices (for complexity)
    const vertexCount = Math.min(Math.floor(coordinates.length / 10) * 10, 100);
    
    // Calculate convexity (simple metric)
    const area = bounds.width * bounds.height;
    const convexity = Math.round((coordinates.length / area) * 1000);
    
    return `${type}-ar${aspectRatio}-v${vertexCount}-c${convexity}`;
}

// Group elements by shape similarity
export function groupByShape(elements: SVGElement[]): Map<string, SVGElement[]> {
    const groups = new Map<string, SVGElement[]>();
    
    elements.forEach(element => {
        // Use shape signature for intelligent grouping
        const key = element.shapeSignature || `${element.type}-unknown`;
        
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(element);
    });
    
    return groups;
}

// Generate color palette using HSL for better distribution
function generateColorPalette(count: number): string[] {
    const colors: string[] = [];
    const goldenRatio = 0.618033988749895;
    let hue = Math.random();
    
    for (let i = 0; i < count; i++) {
        hue = (hue + goldenRatio) % 1;
        const saturation = 0.6 + (Math.random() * 0.2);
        const lightness = 0.5 + (Math.random() * 0.2);
        
        // Convert HSL to RGB
        const rgb = hslToRgb(hue, saturation, lightness);
        colors.push(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
    }
    
    return colors;
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Assign colors to shape groups
export function assignColorsToGroups(groups: Map<string, SVGElement[]>): Map<string, string> {
    const colorMap = new Map<string, string>();
    const groupKeys = Array.from(groups.keys());
    
    // Sort groups by size (descending) to assign more distinct colors to larger groups
    const sortedKeys = groupKeys.sort((a, b) => {
        const sizeA = groups.get(a)?.length || 0;
        const sizeB = groups.get(b)?.length || 0;
        return sizeB - sizeA;
    });
    
    // Generate color palette
    const colors = generateColorPalette(sortedKeys.length);
    
    sortedKeys.forEach((key, index) => {
        colorMap.set(key, colors[index]);
    });
    
    return colorMap;
}

// Main parser function
export function parseSVG(svgString: string): ParsedSVG {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (!svg) {
        throw new Error('Invalid SVG');
    }
    
    // Get SVG dimensions
    const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1000, 1000];
    const width = parseFloat(svg.getAttribute('width') || String(viewBox[2]));
    const height = parseFloat(svg.getAttribute('height') || String(viewBox[3]));
    
    const elements: SVGElement[] = [];
    let idCounter = 0;
    
    // Parse all shape elements
    const shapes = svg.querySelectorAll('path, polygon, rect, circle, line, polyline, ellipse');
    
    shapes.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        let coordinates: number[][] = [];
        const attributes = getAttributes(element);
        
        switch (tagName) {
            case 'path':
                const d = element.getAttribute('d');
                if (d) {
                    coordinates = parsePathData(d);
                }
                break;
                
            case 'polygon':
            case 'polyline':
                const points = element.getAttribute('points');
                if (points) {
                    coordinates = parsePoints(points);
                }
                break;
                
            case 'rect':
                const x = parseFloat(element.getAttribute('x') || '0');
                const y = parseFloat(element.getAttribute('y') || '0');
                const w = parseFloat(element.getAttribute('width') || '0');
                const h = parseFloat(element.getAttribute('height') || '0');
                coordinates = [
                    [x, y],
                    [x + w, y],
                    [x + w, y + h],
                    [x, y + h],
                    [x, y]
                ];
                break;
                
            case 'circle':
                const cx = parseFloat(element.getAttribute('cx') || '0');
                const cy = parseFloat(element.getAttribute('cy') || '0');
                const r = parseFloat(element.getAttribute('r') || '0');
                // Approximate circle with points
                for (let i = 0; i <= 32; i++) {
                    const angle = (i / 32) * Math.PI * 2;
                    coordinates.push([
                        cx + r * Math.cos(angle),
                        cy + r * Math.sin(angle)
                    ]);
                }
                break;
                
            case 'ellipse':
                const ecx = parseFloat(element.getAttribute('cx') || '0');
                const ecy = parseFloat(element.getAttribute('cy') || '0');
                const rx = parseFloat(element.getAttribute('rx') || '0');
                const ry = parseFloat(element.getAttribute('ry') || '0');
                for (let i = 0; i <= 32; i++) {
                    const angle = (i / 32) * Math.PI * 2;
                    coordinates.push([
                        ecx + rx * Math.cos(angle),
                        ecy + ry * Math.sin(angle)
                    ]);
                }
                break;
                
            case 'line':
                const x1 = parseFloat(element.getAttribute('x1') || '0');
                const y1 = parseFloat(element.getAttribute('y1') || '0');
                const x2 = parseFloat(element.getAttribute('x2') || '0');
                const y2 = parseFloat(element.getAttribute('y2') || '0');
                coordinates = [[x1, y1], [x2, y2]];
                break;
        }
        
        if (coordinates.length > 0) {
            const bounds = calculateBounds(coordinates);
            
            // Skip very small elements (likely noise or decorative)
            if (bounds.width < 1 && bounds.height < 1) {
                return;
            }
            
            // Calculate shape signature for grouping
            const shapeSignature = generateShapeSignature(coordinates, tagName);
            const area = bounds.width * bounds.height;
            
            elements.push({
                id: element.getAttribute('id') || `element-${idCounter++}`,
                type: tagName as any,
                coordinates,
                attributes,
                bounds,
                fill: element.getAttribute('fill') || undefined,
                stroke: element.getAttribute('stroke') || undefined,
                strokeWidth: parseFloat(element.getAttribute('stroke-width') || '0'),
                transform: element.getAttribute('transform') || undefined,
                shapeSignature,
                area
            });
        }
    });
    
    // Calculate statistics
    const elementsByType: Record<string, number> = {};
    elements.forEach(el => {
        elementsByType[el.type] = (elementsByType[el.type] || 0) + 1;
    });
    
    const shapeGroups = groupByShape(elements).size;
    
    return {
        elements,
        viewBox: {
            x: viewBox[0],
            y: viewBox[1],
            width: viewBox[2],
            height: viewBox[3]
        },
        width,
        height,
        statistics: {
            totalElements: elements.length,
            elementsByType,
            shapeGroups
        }
    };
}
