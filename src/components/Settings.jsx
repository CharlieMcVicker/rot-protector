import { useState } from 'react';
import ColorPicker from './ColorPicker';

const PALLETES = [
  {
    name: 'strawberry',
    theme: {
      primary: '#ff4081',
      secondary: '#f48fb1',
      tertiary: '#fce4ec',
      accent: '#c51162',
      text: '#4a148c',
      bgStyle: 'dots',
      bgImageUrl: ''
    }
  },
  {
    name: 'periwinkle',
    theme: {
      primary: '#b388ff',
      secondary: '#d1c4e9',
      tertiary: '#f3e5f5',
      accent: '#7c4dff',
      text: '#311b92',
      bgStyle: 'dots',
      bgImageUrl: ''
    }
  },
  {
    name: 'sea foam',
    theme: {
      primary: '#4db6ac',
      secondary: '#b2dfdb',
      tertiary: '#e0f2f1',
      accent: '#00897b',
      text: '#004d40',
      bgStyle: 'dots',
      bgImageUrl: ''
    }
  },
  {
    name: 'bok choy',
    theme: {
      primary: '#81c784',
      secondary: '#c8e6c9',
      tertiary: '#f1f8e9',
      accent: '#4caf50',
      text: '#1b5e20',
      bgStyle: 'dots',
      bgImageUrl: ''
    }
  },
  {
    name: 'peachy',
    theme: {
      primary: '#ffd180',
      secondary: '#ffe0b2',
      tertiary: '#fff3e0',
      accent: '#ff9100',
      text: '#e65100',
      bgStyle: 'dots',
      bgImageUrl: ''
    }
  },
  {
    name: 'magician',
    theme: {
      primary: '#f48fb1',
      secondary: '#4a3b56',
      tertiary: '#2d2235',
      accent: '#ff4081',
      text: '#fce4ec',
      bgStyle: 'dots',
      bgImageUrl: ''
    }
  }
];

export default function Settings({ appData }) {
  const { data, overwriteData, updateTheme, DEFAULT_THEME } = appData;
  const theme = data.theme || DEFAULT_THEME;
  const [importText, setImportText] = useState('');
  const [activePicker, setActivePicker] = useState(null);

  const exportStr = JSON.stringify(data, null, 2);

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed && parsed.trackers) {
        if(window.confirm('This will overwrite all existing data. Continue?')) {
          overwriteData(parsed);
          alert('Data imported successfully!');
          setImportText('');
        }
      } else {
        alert('Invalid data format.');
      }
    } catch (e) {
      alert('Parse error: ' + e.message);
    }
  };

  const handleThemeChange = (key, val) => {
    updateTheme({ ...theme, [key]: val });
  };

  return (
    <div>
      <div className="card">
        <div className="card-header"><h2>theme picker</h2></div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label>Palletes</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {PALLETES.map((p, i) => (
              <button 
                key={i} 
                onClick={() => updateTheme({ ...p.theme, bgImageUrl: theme.bgImageUrl })}
                style={{ 
                  background: p.theme.secondary, 
                  color: p.theme.text, 
                  borderColor: p.theme.accent,
                  textAlign: 'left'
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label>Custom Colors</label>
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'tertiary', label: 'Tertiary (Bg)' },
            { key: 'accent', label: 'Accent / Borders' },
            { key: 'text', label: 'Text' }
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                onClick={() => setActivePicker(key)}
                style={{ 
                  width: '40px', height: '40px', background: theme[key], 
                  border: '2px solid var(--accent-color)', borderRadius: '4px', cursor: 'pointer' 
                }} 
              />
              <span onClick={() => setActivePicker(key)} style={{ cursor: 'pointer' }}>{label}</span>
            </div>
          ))}
        </div>

        {activePicker && (
          <ColorPicker 
            color={theme[activePicker]} 
            onChange={(color) => handleThemeChange(activePicker, color)}
            onClose={() => setActivePicker(null)}
          />
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Background Style</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name="bgStyle" checked={theme.bgStyle === 'solid'} onChange={() => handleThemeChange('bgStyle', 'solid')} style={{ width: 'auto' }} />
              Solid
            </label>
            <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name="bgStyle" checked={theme.bgStyle === 'dots'} onChange={() => handleThemeChange('bgStyle', 'dots')} style={{ width: 'auto' }} />
              Polka Dots
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Background Image URL</label>
          <input 
            type="text" 
            placeholder="https://..." 
            value={theme.bgImageUrl || ''} 
            onChange={e => handleThemeChange('bgImageUrl', e.target.value)}
          />
          <p style={{ fontSize: '11px', marginTop: '0.2rem' }}>Must be a direct image link. Overrides polka dots.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>export data</h2></div>
        <p style={{ fontSize: '12px' }}>Copy this text to back up your data.</p>
        <textarea 
          readOnly 
          value={exportStr} 
          rows={5} 
          style={{ width: '100%', fontSize: '10px', fontFamily: 'monospace' }} 
        />
      </div>
      
      <div className="card">
        <div className="card-header"><h2>import data</h2></div>
        <p style={{ fontSize: '12px' }}>Paste a backup string here to overwrite your current data.</p>
        <textarea 
          value={importText} 
          onChange={e => setImportText(e.target.value)} 
          rows={5} 
          style={{ width: '100%', fontSize: '10px', fontFamily: 'monospace' }} 
        />
        <button onClick={handleImport} style={{ marginTop: '0.5rem', width: '100%' }}>OVERWRITE DATA</button>
      </div>
    </div>
  );
}
