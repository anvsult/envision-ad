import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';

interface Point {
    x: number;
    y: number;
}

interface ImageCornerSelectorProps {
    imageUrl: string;
    initialCorners?: { tl: Point; tr: Point; br: Point; bl: Point };
    onChange: (corners: { tl: Point; tr: Point; br: Point; bl: Point }) => void;
}

const HANDLE_RADIUS = 10;

export const ImageCornerSelector: React.FC<ImageCornerSelectorProps> = ({ imageUrl, initialCorners, onChange }) => {
    const [corners, setCorners] = useState<{ tl: Point; tr: Point; br: Point; bl: Point }>(
        initialCorners || {
            tl: { x: 0.1, y: 0.1 },
            tr: { x: 0.9, y: 0.1 },
            br: { x: 0.9, y: 0.9 },
            bl: { x: 0.1, y: 0.9 },
        }
    );

    const svgRef = useRef<SVGSVGElement>(null);
    const [dragging, setDragging] = useState<keyof typeof corners | null>(null);

    useEffect(() => {
        onChange(corners);
    }, [corners, onChange]);

    const getMousePosition = (evt: ReactMouseEvent | globalThis.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        // Transform screen coordinates to SVG local coordinates
        // This handles cases where the SVG might be scaled or transformed via CSS
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d,
        };
    };

    const handleMouseDown = (key: keyof typeof corners) => (e: ReactMouseEvent) => {
        e.preventDefault();
        setDragging(key);
    };

    const handleMouseMove = (e: globalThis.MouseEvent) => {
        if (!dragging || !svgRef.current) return;
        e.preventDefault();

        const { x, y } = getMousePosition(e);

        // Get SVG dimensions to convert pixel to percentage
        const { width, height } = svgRef.current.getBoundingClientRect();

        // Convert screen pixels to normalized 0.0 - 1.0 logic
        // We constrain it between 0 and 1 so points stay inside the image.
        const nextX = Math.max(0, Math.min(1, x / width));
        const nextY = Math.max(0, Math.min(1, y / height));

        setCorners((prev) => ({
            ...prev,
            [dragging]: { x: nextX, y: nextY },
        }));
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);

    // Convert percentage to percentage string for SVG
    const toPct = (val: number) => `${val * 100}%`;

    return (
        <div style={{ position: 'relative', width: '100%', height: 'auto', userSelect: 'none', display: 'flex', justifyContent: 'center' }}>
            <img
                src={imageUrl}
                alt="Preview"
                style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '400px',
                    display: 'block',
                    pointerEvents: 'none'
                }}
            />

            <svg
                ref={svgRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10
                }}
            >
                {/* Polygon showing the area */}
                <polygon
                    points={`
                        ${corners.tl.x * 100}%,${corners.tl.y * 100}%
                        ${corners.tr.x * 100}%,${corners.tr.y * 100}%
                        ${corners.br.x * 100}%,${corners.br.y * 100}%
                        ${corners.bl.x * 100}%,${corners.bl.y * 100}%
                    `}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                />

                {/* Corner Handles */}
                {Object.entries(corners).map(([key, point]) => (
                    <circle
                        key={key}
                        cx={toPct(point.x)}
                        cy={toPct(point.y)}
                        r={HANDLE_RADIUS}
                        fill="white"
                        stroke="#2563EB"
                        strokeWidth="3"
                        style={{ cursor: 'move', transition: 'r 0.1s' }} // Animate radius instead of transform
                        onMouseEnter={(e) => e.currentTarget.setAttribute('r', (HANDLE_RADIUS * 1.2).toString())}
                        onMouseLeave={(e) => e.currentTarget.setAttribute('r', HANDLE_RADIUS.toString())}
                        onMouseDown={handleMouseDown(key as keyof typeof corners)}
                    />
                ))}
            </svg>
        </div>
    );
};
