import { useState } from 'react';

export default function Wheels({ appData }) {
  const { data, updateWheels } = appData;
  const wheels = data.wheels || [];
  
  const [screen, setScreen] = useState('grid'); // 'grid' | 'spin' | 'edit'
  const [selectedWheelId, setSelectedWheelId] = useState(wheels[0]?.id || '');
  
  const activeWheel = wheels.find(w => w.id === selectedWheelId) || wheels[0];
  
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [newItemText, setNewItemText] = useState('');
  const [editNameText, setEditNameText] = useState('');

  const [showNewWheelModal, setShowNewWheelModal] = useState(false);
  const [newWheelName, setNewWheelName] = useState('');

  // Handle setting active wheel
  const handleSelectWheel = (id) => {
    setSelectedWheelId(id);
    setScreen('spin');
    setSelectedItem(null);
    setRotation(0);
  };

  // Create new wheel via modal
  const submitNewWheel = () => {
    if (!newWheelName.trim()) return;
    const newId = 'w' + Date.now();
    const newWheel = {
      id: newId,
      name: newWheelName.trim(),
      items: []
    };
    updateWheels([...wheels, newWheel]);
    handleSelectWheel(newId);
    setShowNewWheelModal(false);
    setNewWheelName('');
  };

  // Spin logic
  const spinWheel = () => {
    if (spinning || !activeWheel || activeWheel.items.length === 0) return;
    setSpinning(true);
    setSelectedItem(null);
    
    const extraSpins = 6 + Math.floor(Math.random() * 4); // 6 to 9 full spins
    const targetAngle = Math.floor(Math.random() * 360);
    const newRotation = rotation + (extraSpins * 360) + targetAngle;
    setRotation(newRotation);
    
    setTimeout(() => {
      // conic-gradient starts at 12 o'clock (0 degrees) and runs clockwise.
      const selectedAngle = (360 - (newRotation % 360)) % 360;
      const totalWeight = activeWheel.items.reduce((s, i) => s + i.weight, 0);
      let accumAngle = 0;
      let chosen = activeWheel.items[0];
      for (const item of activeWheel.items) {
        const sliceAngle = (item.weight / totalWeight) * 360;
        if (selectedAngle >= accumAngle && selectedAngle < accumAngle + sliceAngle) {
          chosen = item;
          break;
        }
        accumAngle += sliceAngle;
      }
      setSelectedItem(chosen);
      setSpinning(false);
    }, 3000);
  };
  
  // Save notes for chosen item
  const saveNotes = (e) => {
    const updatedWheels = wheels.map(w => {
      if (w.id === activeWheel?.id) {
        return {
          ...w,
          items: w.items.map(i => i.id === selectedItem.id ? { ...i, notes: e.target.value } : i)
        };
      }
      return w;
    });
    updateWheels(updatedWheels);
    setSelectedItem({ ...selectedItem, notes: e.target.value });
  };
  
  // Delete item
  const deleteItem = (id) => {
    const updatedWheels = wheels.map(w => {
      if (w.id === activeWheel?.id) {
        return { ...w, items: w.items.filter(i => i.id !== id) };
      }
      return w;
    });
    updateWheels(updatedWheels);
    if (selectedItem?.id === id) setSelectedItem(null);
  };
  
  // Add item
  const addItem = () => {
    if (!newItemText.trim()) return;
    const updatedWheels = wheels.map(w => {
      if (w.id === activeWheel?.id) {
        return {
          ...w,
          items: [...w.items, { id: 'i' + Date.now(), text: newItemText, weight: 1, notes: '', color: '' }]
        };
      }
      return w;
    });
    updateWheels(updatedWheels);
    setNewItemText('');
  };
  
  // Edit wheel name
  const saveWheelName = (newName) => {
    const updatedWheels = wheels.map(w => {
      if (w.id === activeWheel?.id) {
        return { ...w, name: newName };
      }
      return w;
    });
    updateWheels(updatedWheels);
  };
  
  // Delete entire wheel
  const deleteWheel = () => {
    if (!confirm(`Are you sure you want to delete "${activeWheel?.name}"?`)) return;
    const updatedWheels = wheels.filter(w => w.id !== activeWheel.id);
    updateWheels(updatedWheels);
    setScreen('grid');
    setSelectedWheelId(updatedWheels[0]?.id || '');
  };
  
  // Adjust weight
  const changeWeight = (id, delta) => {
    const updatedWheels = wheels.map(w => {
      if (w.id === activeWheel?.id) {
        return {
          ...w,
          items: w.items.map(i => {
            if (i.id === id) {
              const newW = Math.max(1, i.weight + delta);
              return { ...i, weight: newW };
            }
            return i;
          })
        };
      }
      return w;
    });
    updateWheels(updatedWheels);
  };

  const changeItemColor = (id, color) => {
    const updatedWheels = wheels.map(w => {
      if (w.id === activeWheel?.id) {
        return {
          ...w,
          items: w.items.map(i => i.id === id ? { ...i, color } : i)
        };
      }
      return w;
    });
    updateWheels(updatedWheels);
  };

  const defaultColors = ['#f48fb1', '#ce93d8', '#90caf9', '#a5d6a7', '#fff59d', '#ffcc80'];

  // Dynamic CSS Conic-Gradient Generation
  const getConicGradient = (items) => {
    if (!items || items.length === 0) return 'var(--bg-color)';
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let currentPct = 0;
    const gradientSlices = items.map((item, index) => {
      const pct = (item.weight / totalWeight) * 100;
      const start = currentPct;
      const end = currentPct + pct;
      currentPct = end;
      const color = item.color || defaultColors[index % defaultColors.length];
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${gradientSlices.join(', ')})`;
  };

  const renderMiniPieChart = (wheel) => {
    const items = wheel.items || [];
    if (items.length === 0) {
      return (
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          border: '2px dotted var(--primary-color)', background: 'var(--bg-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', color: 'var(--accent-color)', fontWeight: 'bold', margin: '0.4rem auto'
        }}>
          empty
        </div>
      );
    }
    const style = getConicGradient(items);
    return (
      <div style={{
        width: '70px', height: '70px', borderRadius: '50%',
        border: '2px solid var(--primary-color)', background: style,
        margin: '0.4rem auto', boxShadow: '2px 2px 0px rgba(0,0,0,0.15)'
      }} />
    );
  };

  // GRID VIEW (Screen 1)
  if (screen === 'grid' || !activeWheel) {
    return (
      <div>
        <div className="card" style={{ padding: '0.75rem', marginBottom: '1.2rem' }}>
          <div className="card-header" style={{ marginBottom: 0, padding: '6px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>select activity wheel</h2>
          </div>
        </div>

        {wheels.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-color)' }}>
            no wheels created yet. Click below to add one!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {wheels.map(w => (
              <div 
                key={w.id} 
                className="card"
                onClick={() => handleSelectWheel(w.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem',
                  cursor: 'pointer', marginBottom: 0, transition: 'transform 0.1s ease', userSelect: 'none'
                }}
              >
                {renderMiniPieChart(w)}
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-color)', textAlign: 'center', wordBreak: 'break-word', textTransform: 'lowercase' }}>
                  {w.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setShowNewWheelModal(true)} style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', border: '3px solid var(--accent-color)', boxShadow: '4px 4px 0px rgba(0,0,0,0.15)' }}>
            CREATE NEW WHEEL
          </button>
        </div>

        {showNewWheelModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="card" style={{ width: '90%', maxWidth: '350px', boxShadow: '10px 10px 0px rgba(0,0,0,0.5)' }}>
              <h2 style={{ color: 'var(--accent-color)', marginTop: 0 }}>create new wheel</h2>
              <input 
                type="text" 
                placeholder="wheel name" 
                value={newWheelName} 
                onChange={e => setNewWheelName(e.target.value)} 
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => setShowNewWheelModal(false)} style={{ flex: 1, background: '#e0e0e0', color: '#000', borderColor: '#9e9e9e' }}>CANCEL</button>
                <button onClick={submitNewWheel} style={{ flex: 1 }}>CREATE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SPIN VIEW (Screen 2)
  if (screen === 'spin') {
    const items = activeWheel.items || [];
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'var(--bg-color)', backgroundImage: 'var(--bg-image)',
        backgroundSize: 'var(--bg-size, 20px 20px)',
        backgroundPosition: 'var(--bg-position, center)',
        backgroundRepeat: 'var(--bg-repeat, repeat)',
        backgroundAttachment: 'fixed',
        zIndex: 2000, padding: '1.2rem', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '2px dotted var(--primary-color)' }}>
          <button onClick={() => setScreen('grid')} style={{ padding: '0.35rem 0.7rem', fontSize: '11px', background: 'var(--secondary-color)', border: '2px solid var(--accent-color)' }}>&larr; BACK</button>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '1rem', textTransform: 'lowercase', textAlign: 'center', flex: 1, margin: '0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeWheel.name}</span>
          <button onClick={() => { setScreen('edit'); setEditNameText(activeWheel.name); }} style={{ padding: '0.35rem 0.7rem', fontSize: '11px', background: 'var(--secondary-color)', border: '2px solid var(--accent-color)' }}>EDIT</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', width: '100%', maxWidth: '360px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>wheel is empty!</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-color)', margin: '0.5rem 0' }}>Add items in the edit screen to start spinning.</p>
              <button onClick={() => { setScreen('edit'); setEditNameText(activeWheel.name); }} style={{ marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '12px' }}>Go to Edit Screen</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              
              {/* Box shadow stays still, inner wheel spins */}
              <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '1.5rem', borderRadius: '50%', boxShadow: '5px 5px 0px rgba(0,0,0,0.15)' }}>
                {/* Pointer Needle */}
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid var(--accent-color)',
                  zIndex: 10, filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.15))'
                }} />
                
                {/* Spinning Wheel */}
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%', border: '5px solid var(--primary-color)',
                  background: getConicGradient(items), transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 3s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
                }} />
              </div>


              <button 
                onClick={spinWheel} disabled={spinning} 
                style={{ width: '100%', maxWidth: '320px', fontSize: '1.2rem', padding: '0.8rem', border: '3px solid var(--accent-color)', boxShadow: '4px 4px 0px rgba(0,0,0,0.15)', marginBottom: '1rem' }}
              >
                {spinning ? 'SPINNING...' : 'SPIN IT'}
              </button>
            </div>
          )}

          {selectedItem && !spinning && (
            <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.4rem', fontSize: '0.9rem', textTransform: 'lowercase' }}>result notes</div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-color)', marginBottom: '0.2rem' }}>{selectedItem.text}:</label>
              <textarea value={selectedItem.notes} onChange={saveNotes} rows={3} placeholder="Write any details, thoughts, or plans here..." style={{ fontSize: '0.85rem', padding: '0.4rem' }} />
            </div>
          )}
        </div>

        <style>{`
          @keyframes retroShake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -1px) rotate(-1deg); }
            20% { transform: translate(-2px, 0px) rotate(1deg); }
            30% { transform: translate(1px, 1px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 1px) rotate(-1deg); }
            60% { transform: translate(-2px, 0px) rotate(0deg); }
            70% { transform: translate(1px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 1px) rotate(0deg); }
            100% { transform: translate(1px, -1px) rotate(-1deg); }
          }
        `}</style>
      </div>
    );
  }

  // EDIT VIEW (Screen 3)
  if (screen === 'edit') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'var(--bg-color)', backgroundImage: 'var(--bg-image)',
        backgroundSize: 'var(--bg-size, 20px 20px)',
        backgroundPosition: 'var(--bg-position, center)',
        backgroundRepeat: 'var(--bg-repeat, repeat)',
        backgroundAttachment: 'fixed',
        zIndex: 2000, padding: '1.2rem', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '2px dotted var(--primary-color)' }}>
          <button onClick={() => setScreen('spin')} style={{ padding: '0.35rem 0.7rem', fontSize: '11px', background: 'var(--secondary-color)', border: '2px solid var(--accent-color)' }}>&larr; SPIN VIEW</button>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '1rem', textTransform: 'lowercase', textAlign: 'center', flex: 1, margin: '0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>editing: {activeWheel.name}</span>
          <button onClick={deleteWheel} style={{ padding: '0.35rem 0.7rem', fontSize: '11px', background: '#d32f2f', color: '#fff', border: '2px solid #b71c1c' }}>DELETE</button>
        </div>

        <div className="card" style={{ padding: '0.8rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.4rem', fontSize: '0.85rem', textTransform: 'lowercase' }}>wheel name</div>
          <input type="text" value={editNameText} onChange={(e) => { setEditNameText(e.target.value); saveWheelName(e.target.value); }} style={{ margin: 0 }} />
        </div>

        <div className="card" style={{ padding: '0.8rem', marginBottom: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.6rem', fontSize: '0.85rem', textTransform: 'lowercase' }}>edit items & weights</div>
          
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
            {activeWheel.items.length === 0 ? (
              <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>wheel is currently empty.</div>
            ) : (
              activeWheel.items.map((item, index) => (
                <div key={item.id} style={{ borderBottom: '1px dotted var(--secondary-color)', paddingBottom: '0.4rem', marginBottom: '0.4rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="color" 
                      value={item.color || defaultColors[index % defaultColors.length]} 
                      onChange={e => changeItemColor(item.id, e.target.value)} 
                      style={{ width: '24px', height: '24px', padding: 0, border: 'none', cursor: 'pointer' }} 
                      title="Slice Color"
                    />
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-color)', wordBreak: 'break-word', flex: 1 }}>{item.text}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold', marginRight: '0.5rem' }}>weight: {item.weight}</span>
                    <button onClick={() => changeWeight(item.id, -1)} disabled={item.weight <= 1} style={{ padding: '2px 8px', fontSize: '11px' }}>-</button>
                    <button onClick={() => changeWeight(item.id, 1)} style={{ padding: '2px 8px', fontSize: '11px' }}>+</button>
                    <button onClick={() => deleteItem(item.id)} style={{ background: '#d32f2f', borderColor: '#b71c1c', marginLeft: 'auto', padding: '2px 8px', fontSize: '11px' }}>del</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
            <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)} placeholder="Add new item text..." style={{ flex: 1, margin: 0, fontSize: '0.85rem' }} />
            <button onClick={addItem} style={{ padding: '0 1rem', fontSize: '0.9rem' }}>ADD</button>
          </div>
        </div>
      </div>
    );
  }
}
