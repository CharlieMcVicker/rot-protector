import { useState } from 'react';

export default function DailyTracker({ appData }) {
  const { data, updateEntry, updateTrackers } = appData;
  const trackers = data.trackers || [];
  
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isEditing, setIsEditing] = useState(false);
  
  // New tracker form state
  const [newTrackerName, setNewTrackerName] = useState('');
  const [newTrackerType, setNewTrackerType] = useState('enum');
  const [newTrackerOpts, setNewTrackerOpts] = useState('');
  const [newTrackerMin, setNewTrackerMin] = useState(0);
  const [newTrackerMax, setNewTrackerMax] = useState(10);
  const [newTrackerStep, setNewTrackerStep] = useState(1);
  
  const selectedDateStr = selectedDate.toLocaleDateString('en-CA'); 
  const selectedEntries = data.entries[selectedDateStr] || {};

  const handleUpdate = (trackerId, value) => {
    updateEntry(selectedDateStr, trackerId, value);
  };

  const changeDay = (days) => {
    setSelectedDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + days);
      return next;
    });
  };

  const currentYear = new Date().getFullYear();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  if (selectedDate.getFullYear() !== currentYear) {
    options.year = 'numeric';
  }
  const formattedDate = selectedDate.toLocaleDateString('en-US', options);

  const deleteTracker = (id) => {
    if (confirm('Are you sure you want to delete this tracker? History will be kept but hidden.')) {
      updateTrackers(trackers.filter(t => t.id !== id));
    }
  };

  const moveTracker = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= trackers.length) return;
    const nextTrackers = [...trackers];
    const temp = nextTrackers[index];
    nextTrackers[index] = nextTrackers[newIndex];
    nextTrackers[newIndex] = temp;
    updateTrackers(nextTrackers);
  };

  const handleAddTracker = () => {
    if (!newTrackerName.trim()) return;
    
    const newTracker = {
      id: 't_' + Date.now(),
      name: newTrackerName.trim(),
      type: newTrackerType
    };
    
    if (newTrackerType === 'enum') {
      const opts = newTrackerOpts.split(',').map(s => s.trim()).filter(s => s);
      if (opts.length === 0) return alert('Please enter at least one option.');
      newTracker.options = opts;
    } else if (newTrackerType === 'range') {
      newTracker.min = newTrackerMin;
      newTracker.max = newTrackerMax;
      newTracker.step = newTrackerStep;
    }
    
    updateTrackers([...trackers, newTracker]);
    
    // Reset form
    setNewTrackerName('');
    setNewTrackerOpts('');
  };

  const renderTrackerInput = (t) => {
    const val = selectedEntries[t.id];
    
    if (t.type === 'text') {
      return (
        <div>
          <textarea 
            value={val || ''}
            onChange={(e) => handleUpdate(t.id, e.target.value)}
            rows={3}
            placeholder="enter text notes here..."
          />
        </div>
      );
    }
    
    if (t.type === 'enum' || (t.type === 'range' && (t.max - t.min) <= 5)) {
      let optionsList = [];
      if (t.type === 'enum') {
        optionsList = t.options;
      } else {
        for (let i = t.min; i <= t.max; i += t.step) {
          optionsList.push(i);
        }
      }
      
      return (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {optionsList.map((opt) => (
            <button 
              key={opt}
              onClick={() => handleUpdate(t.id, val === opt ? undefined : opt)}
              style={{
                background: val === opt ? 'var(--primary-color)' : 'var(--bg-color)',
                color: val === opt ? '#fff' : 'var(--accent-color)',
                border: '2px solid var(--primary-color)',
                padding: '0.5rem 0.2rem',
                flex: 1,
                fontSize: '0.7rem',
                minWidth: '45px',
                wordBreak: 'break-word',
                lineHeight: '1.1',
                minHeight: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    } else {
      // Range > 5, use slider
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="range" 
            min={t.min} 
            max={t.max} 
            step={t.step}
            value={val !== undefined ? val : t.min}
            onChange={(e) => handleUpdate(t.id, parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontWeight: 'bold', width: '30px', textAlign: 'right', color: 'var(--accent-color)' }}>
            {val !== undefined ? val : '-'}
          </span>
        </div>
      );
    }
  };

  if (isEditing) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'var(--bg-color)', backgroundImage: 'var(--bg-image)',
        backgroundSize: 'var(--bg-size, 20px 20px)',
        backgroundPosition: 'var(--bg-position, center)',
        backgroundRepeat: 'var(--bg-repeat, repeat)',
        backgroundAttachment: 'fixed',
        zIndex: 2000, padding: '1.2rem', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px dotted var(--primary-color)', paddingBottom: '0.5rem' }}>
          <button onClick={() => setIsEditing(false)} style={{ padding: '0.35rem 0.7rem', fontSize: '11px' }}>&larr; DONE</button>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>edit trackers</span>
          <div style={{ width: '45px' }} />
        </div>
        
        {trackers.map((t, index) => (
          <div key={t.id} className="card" style={{ marginBottom: '0.5rem', padding: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--text-color)' }}>{t.name}</strong>
                <div style={{ fontSize: '10px', color: 'var(--accent-color)' }}>type: {t.type}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                <button 
                  onClick={() => moveTracker(index, -1)} 
                  disabled={index === 0}
                  style={{ padding: '0.2rem 0.4rem', fontSize: '10px', lineHeight: 1 }}
                  title="Move Up"
                >
                  ▲
                </button>
                <button 
                  onClick={() => moveTracker(index, 1)} 
                  disabled={index === trackers.length - 1}
                  style={{ padding: '0.2rem 0.4rem', fontSize: '10px', lineHeight: 1 }}
                  title="Move Down"
                >
                  ▼
                </button>
                <button onClick={() => deleteTracker(t.id)} style={{ background: '#d32f2f', borderColor: '#b71c1c', padding: '0.3rem 0.6rem', fontSize: '11px' }}>del</button>
              </div>
            </div>
          </div>
        ))}

        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>add new tracker</div>
          <input type="text" placeholder="tracker name" value={newTrackerName} onChange={e => setNewTrackerName(e.target.value)} />
          <select value={newTrackerType} onChange={e => setNewTrackerType(e.target.value)} style={{ marginBottom: '0.5rem' }}>
            <option value="enum">Multiple Choice (Enum)</option>
            <option value="range">Number Scale (Range)</option>
            <option value="text">Text Box</option>
          </select>
          
          {newTrackerType === 'enum' && (
            <input type="text" placeholder="options (comma separated e.g. yes, no)" value={newTrackerOpts} onChange={e => setNewTrackerOpts(e.target.value)} />
          )}
          
          {newTrackerType === 'range' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '10px' }}>min</label>
                <input type="number" value={newTrackerMin} onChange={e => setNewTrackerMin(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: '10px' }}>max</label>
                <input type="number" value={newTrackerMax} onChange={e => setNewTrackerMax(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: '10px' }}>step</label>
                <input type="number" value={newTrackerStep} onChange={e => setNewTrackerStep(Number(e.target.value))} />
              </div>
            </div>
          )}
          
          <button onClick={handleAddTracker} style={{ width: '100%', marginTop: '0.5rem' }}>ADD TRACKER</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem', marginBottom: '1.2rem' }}>
        <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'lowercase' }}>selected date</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
          <button onClick={() => changeDay(-1)} style={{ padding: '0.4rem 0.8rem', fontSize: '1.1rem' }}>&larr;</button>
          <div style={{ fontSize: '1.05rem', fontWeight: 'bold', textAlign: 'center', flex: 1, color: 'var(--text-color)', textTransform: 'lowercase' }}>{formattedDate}</div>
          <button onClick={() => changeDay(1)} style={{ padding: '0.4rem 0.8rem', fontSize: '1.1rem' }}>&rarr;</button>
        </div>
      </div>
      
      {trackers.length > 0 ? (
        <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trackers.map((t, idx) => (
              <div 
                key={t.id} 
                style={{ 
                  borderBottom: idx < trackers.length - 1 ? '1px dashed var(--secondary-color)' : 'none',
                  paddingBottom: idx < trackers.length - 1 ? '0.75rem' : '0'
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'lowercase' }}>{t.name}</h3>
                {renderTrackerInput(t)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '1rem', color: 'var(--accent-color)' }}>
          no trackers configured.
        </div>
      )}

      <button 
        onClick={() => setIsEditing(true)} 
        style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
      >
        ADD / EDIT TRACKERS
      </button>
    </div>
  );
}
