'use client';

import { useCallback, useRef, useState } from 'react';

interface ResizeHandleProps {
  onResize: (ratio: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ResizeHandle({ onResize, containerRef }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startXRef = useRef(0);
  const startRatioRef = useRef(0.5);
  const [currentRatio, setCurrentRatio] = useState(50);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      startXRef.current = e.clientX;

      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        startRatioRef.current = (e.clientX - containerRect.left) / containerRect.width;
      }
    },
    [containerRef]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const ratio = (e.clientX - containerRect.left) / containerRect.width;
      const clamped = Math.max(0.25, Math.min(0.75, ratio));
      setCurrentRatio(Math.round(clamped * 100));
      onResize(clamped);
    },
    [isDragging, containerRef, onResize]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className="hidden md:flex w-2 items-center justify-center shrink-0 select-none touch-none"
      style={{
        cursor: 'col-resize',
        background: isDragging
          ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
          : 'transparent',
        transition: isDragging ? 'none' : 'background 150ms ease',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize editor panels"
      aria-valuenow={currentRatio}
      aria-valuemin={25}
      aria-valuemax={75}
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow keyboard resize with arrow keys
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const newRatio = Math.max(0.25, startRatioRef.current - 0.05);
          setCurrentRatio(Math.round(newRatio * 100));
          onResize(newRatio);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const newRatio = Math.min(0.75, startRatioRef.current + 0.05);
          setCurrentRatio(Math.round(newRatio * 100));
          onResize(newRatio);
        }
      }}
    >
      <div
        className="flex flex-col gap-1 py-2 rounded-full transition-all duration-150"
        style={{
          color: isDragging || isHovered ? 'var(--text-secondary)' : 'var(--text-disabled)',
          transform: isDragging || isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        <div className="w-1 h-1 rounded-full" style={{ background: 'currentColor' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: 'currentColor' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: 'currentColor' }} />
      </div>
    </div>
  );
}
