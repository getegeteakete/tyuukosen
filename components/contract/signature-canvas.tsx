'use client';

import { useEffect, useRef, useState } from 'react';

export function SignatureCanvas({
  onSave, disabled,
}: { onSave: (dataUrl: string) => void; disabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    // Retina対応
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0E3A5C';
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing || disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  }
  function up() {
    setDrawing(false);
  }

  function clear() {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  }

  function save() {
    if (!hasInk) return;
    onSave(canvasRef.current!.toDataURL('image/png'));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-dashed border-ocean-200 bg-sand-50">
        <canvas
          ref={canvasRef}
          className="w-full h-48 cursor-crosshair touch-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk || disabled}
          className="px-4 py-2 rounded-full text-sm border border-ocean-200 text-ocean-800 hover:bg-ocean-50 disabled:opacity-40"
        >
          消す
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasInk || disabled}
          className="px-5 py-2 rounded-full text-sm bg-coral-500 text-white hover:bg-coral-600 disabled:opacity-40 font-medium"
        >
          この内容で署名
        </button>
      </div>
    </div>
  );
}
