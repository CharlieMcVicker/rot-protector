import { useState, useEffect, useRef } from 'react';

// Helper to convert HSV to HEX
const hsvToHex = (h, s, v) => {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const mod = i % 6;
  const r = [v, q, p, p, t, v][mod];
  const g = [t, v, v, q, p, p][mod];
  const b = [p, p, t, v, v, q][mod];
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Helper to convert HEX to HSV
const hexToHsv = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

export default function ColorPicker({ color, onChange, onClose }) {
  const [hsv, setHsv] = useState(() => hexToHsv(color || '#ff0000'));
  const svRef = useRef(null);

  const handleHueChange = (e) => {
    const newHsv = { ...hsv, h: parseFloat(e.target.value) };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  };

  const handleSVChange = (e) => {
    const rect = svRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const newHsv = { ...hsv, s: x * 100, v: (1 - y) * 100 };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  };

  const onMouseDown = (e) => {
    handleSVChange(e);
    const onMouseMove = (e) => handleSVChange(e);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    handleSVChange(touch);
    const onTouchMove = (e) => handleSVChange(e.touches[0]);
    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const currentColor = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div className="card" style={{ width: '90%', maxWidth: '300px', padding: '1.2rem' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--accent-color)', textAlign: 'center' }}>pick color</div>
        
        {/* Saturation/Value Area */}
        <div 
          ref={svRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            width: '100%', height: '150px', position: 'relative', cursor: 'crosshair',
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hsv.h}, 100%, 50%)`,
            marginBottom: '1rem', borderRadius: '4px', border: '2px solid var(--primary-color)'
          }}
        >
          <div style={{
            position: 'absolute', left: `${hsv.s}%`, top: `${100 - hsv.v}%`,
            width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)', transform: 'translate(-50%, -50%)', pointerEvents: 'none'
          }} />
        </div>

        {/* Hue Slider */}
        <input 
          type="range" min="0" max="360" step="1" 
          value={hsv.h} onChange={handleHueChange}
          style={{
            width: '100%', height: '20px', appearance: 'none', background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--secondary-color)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: currentColor, border: '2px solid var(--accent-color)', borderRadius: '4px' }} />
          <code style={{ fontSize: '14px', flex: 1 }}>{currentColor.toUpperCase()}</code>
        </div>

        <button onClick={onClose} style={{ width: '100%', padding: '0.6rem' }}>DONE</button>
      </div>
    </div>
  );
}
