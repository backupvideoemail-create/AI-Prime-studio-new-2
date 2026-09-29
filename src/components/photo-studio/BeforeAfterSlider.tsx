import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  personName?: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  personName = 'Authentic Identity Preserved',
  beforeLabel = 'Before',
  afterLabel = 'After AI Club',
  aspectRatio = 'aspect-[4/5]',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/[0.1] shadow-2xl bg-[#090b10] group`}
    >
      {/* After Image (Background layer) */}
      <img
        src={afterImage}
        alt="After AI Club transformation"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* Before Image (Clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Before original portrait"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-[2.5px] bg-gradient-to-b from-[#fceda7] via-[#d4af37] to-[#aa7c11] shadow-[0_0_12px_rgba(212,175,55,0.7)] pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Circular Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#07080a] border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.6)] flex items-center justify-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#fceda7]" />
        </div>
      </div>

      {/* Badges on overlay */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#07080a]/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-gray-300 pointer-events-none">
        {beforeLabel}
      </div>

      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#07080a]/80 backdrop-blur-md border border-[#d4af37]/40 text-[10px] font-semibold text-[#fceda7] flex items-center gap-1 pointer-events-none">
        <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
        {afterLabel}
      </div>

      {/* Identity notice watermark pill */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] text-gray-300 font-medium border border-white/5">
          👤 {personName}
        </span>
        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] text-[#fceda7] font-medium border border-[#d4af37]/20">
          Drag to compare
        </span>
      </div>
    </div>
  );
};
