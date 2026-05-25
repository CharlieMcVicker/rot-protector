import { useState, useEffect } from 'react';
import { useAppData } from './hooks/useAppData';
import Wheels from './components/Wheels';
import DailyTracker from './components/DailyTracker';
import Charts from './components/Charts';
import Settings from './components/Settings';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const appData = useAppData();
  const theme = appData.data.theme || appData.DEFAULT_THEME;

  // Apply CSS Variables globally
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--tertiary-color', theme.tertiary);
    root.style.setProperty('--bg-color', theme.tertiary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--text-color', theme.text);
    
    // Check if background is dark or text is light
    const isDark = theme.tertiary === '#2d2235' || theme.text === '#fce4ec' || theme.text === '#ffffff' || theme.tertiary === '#000000';
    if (isDark) {
      root.style.setProperty('--card-bg', '#362a3f');
      root.style.setProperty('--input-bg', '#2d2235');
    } else {
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--input-bg', '#fffafb');
    }
    
    if (theme.bgImageUrl) {
      root.style.setProperty('--bg-image', `url(${theme.bgImageUrl})`);
      root.style.setProperty('--bg-size', 'cover');
      root.style.setProperty('--bg-position', 'center');
      root.style.setProperty('--bg-repeat', 'no-repeat');
    } else if (theme.bgStyle === 'dots') {
      root.style.setProperty('--bg-image', `radial-gradient(${theme.secondary} 2px, transparent 2px)`);
      root.style.setProperty('--bg-size', '20px 20px');
      root.style.setProperty('--bg-position', 'center');
      root.style.setProperty('--bg-repeat', 'repeat');
    } else {
      root.style.setProperty('--bg-image', 'none');
      root.style.setProperty('--bg-size', 'auto');
      root.style.setProperty('--bg-position', 'center');
      root.style.setProperty('--bg-repeat', 'repeat');
    }
  }, [theme]);

  const renderTab = () => {
    switch (activeTab) {
      case 'tracker': return <DailyTracker appData={appData} />;
      case 'charts': return <Charts appData={appData} />;
      case 'wheels': return <Wheels appData={appData} />;
      case 'settings': return <Settings appData={appData} />;
      default: return <DailyTracker appData={appData} />;
    }
  };

  return (
    <>
      <div className="app-container">
        {renderTab()}
      </div>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: 'var(--bg-color)',
        borderTop: '3px dotted var(--primary-color)',
        padding: '0.5rem',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
      }}>
        {['tracker', 'charts', 'wheels', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'var(--primary-color)' : 'var(--secondary-color)',
              color: '#fff',
              border: '2px solid var(--accent-color)',
              flex: 1,
              margin: '0 0.2rem',
              padding: '0.8rem 0',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '12px'
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
    </>
  );
}

export default App;
