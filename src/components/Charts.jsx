import { useState } from 'react';

const CHART_SIZES = ['small', 'large'];
const HEIGHTS = { small: '45px', large: '100px' };

export default function Charts({ appData }) {
  const { data } = appData;
  const trackers = data.trackers || [];
  const entries = data.entries || {};
  
  const [timeRange, setTimeRange] = useState('30d');
  const [chartSizes, setChartSizes] = useState({}); 

  const toggleSize = (id) => {
    setChartSizes(prev => {
      const current = prev[id] || 0;
      return { ...prev, [id]: (current + 1) % 2 };
    });
  };

  const getDates = () => {
    const dates = [];
    const today = new Date();
    let days = 30;
    if (timeRange === '3m') days = 90;
    if (timeRange === '1y') days = 365;
    if (timeRange === 'all') {
      const allDates = Object.keys(entries).sort();
      if (allDates.length > 0) {
        const first = new Date(allDates[0]);
        const diff = Math.floor((today - first) / (1000*60*60*24));
        days = Math.max(diff + 1, 30); 
      }
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toLocaleDateString('en-CA'));
    }
    return dates;
  };

  const dates = getDates();

  const getWeekdayLetter = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return ['S','M','T','W','T','F','S'][d.getDay()];
  };

  const getXLabel = (date, idx) => {
    const d = new Date(date + 'T00:00:00');
    const m = d.getMonth();
    
    if (dates.length <= 30) {
      // Weekday letters (SMTWTFS)
      return getWeekdayLetter(date);
    } else if (dates.length <= 90) {
      // Each 7 days date in x/x format
      if (idx % 7 === 0) {
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }
      return '';
    } else {
      // Month abbreviation for 365 or more
      if (idx === 0) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
      }
      const prevDate = dates[idx - 1];
      const prevD = new Date(prevDate + 'T00:00:00');
      if (m !== prevD.getMonth()) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
      }
      return '';
    }
  };

  const renderYAxisLabels = (t) => {
    let labels = [];
    if (t.type === 'enum') {
      labels = [...t.options]; // Copy to avoid mutating original
    } else {
      const min = t.min ?? 0;
      const max = t.max ?? 1;
      const step = t.step || 1;
      for (let i = min; i <= max; i += step) {
        labels.push(i);
      }
    }
    
    // Top to bottom (max to min)
    labels.reverse();
    
    // Skip rule: If range is more than 5, start skipping
    if (labels.length > 5) {
      const stepSize = Math.ceil(labels.length / 4);
      const filtered = [];
      for (let idx = 0; idx < labels.length; idx += stepSize) {
        filtered.push(labels[idx]);
      }
      // Ensure the min value is always included at the end
      if (filtered[filtered.length - 1] !== labels[labels.length - 1]) {
        filtered.push(labels[labels.length - 1]);
      }
      labels = filtered;
    }
    
    return labels.map((lbl, idx) => (
      <div key={idx} style={{ 
        height: '10px', 
        lineHeight: '10px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }} title={lbl.toString()}>
        {lbl}
      </div>
    ));
  };

  return (
    <div>
      <div className="card" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'lowercase' }}>range filter</div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['30d', '3m', '1y', 'all'].map(r => (
            <button 
              key={r}
              onClick={() => setTimeRange(r)}
              style={{ 
                flex: 1, 
                padding: '0.3rem 0.5rem', 
                background: timeRange === r ? 'var(--primary-color)' : 'var(--tertiary-color)', 
                color: timeRange === r ? '#fff' : 'var(--accent-color)',
                border: '2px solid var(--primary-color)',
                fontSize: '0.85rem'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      
      <div className="card" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {trackers.map((t, idx) => {
            const size = CHART_SIZES[chartSizes[t.id] || 0];
            
            let maxVal = t.max || 1;
            let minVal = t.min || 0;
            if (t.type === 'enum') {
              maxVal = t.options.length - 1;
              minVal = 0;
            }
            
            return (
              <div key={t.id} style={{ 
                borderBottom: idx < trackers.length - 1 ? '1px dashed var(--secondary-color)' : 'none',
                paddingBottom: idx < trackers.length - 1 ? '0.75rem' : '0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '0.5rem' }}>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: 'var(--text-color)', 
                    fontSize: '0.85rem', 
                    textTransform: 'lowercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}>{t.name}</span>
                  <button 
                    onClick={() => toggleSize(t.id)} 
                    style={{ 
                      padding: '1px 5px', 
                      fontSize: '9px', 
                      background: 'var(--secondary-color)', 
                      border: '1px solid var(--accent-color)',
                      color: '#fff',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    SIZE: {size.toUpperCase()}
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                  {/* Y-Axis Labeling */}
                  {size === 'large' && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      height: HEIGHTS[size], 
                      fontSize: '8px', 
                      textAlign: 'right', 
                      minWidth: '35px',
                      color: 'var(--text-color)',
                      paddingRight: '4px',
                      borderRight: '1px dotted var(--secondary-color)',
                      paddingBottom: '4px',
                      boxSizing: 'border-box'
                    }}>
                      {renderYAxisLabels(t)}
                    </div>
                  )}

                  {/* Chart Main Panel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-end', 
                      height: HEIGHTS[size], 
                      gap: dates.length > 60 ? '0px' : (dates.length > 30 ? '1px' : '3px'),
                      paddingBottom: '4px',
                      borderBottom: '2px solid var(--primary-color)',
                      borderLeft: '2px solid var(--primary-color)',
                      paddingLeft: '4px',
                      overflow: 'hidden', 
                      transition: 'height 0.3s',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {dates.map(date => {
                        let val = entries[date] ? entries[date][t.id] : undefined;
                        if (val === undefined) return <div key={date} style={{ flex: 1 }} />;
                        
                        let numVal = val;
                        if (t.type === 'enum') {
                          numVal = t.options.indexOf(val);
                        }
                        
                        let heightPct = 0;
                        if (maxVal > minVal) {
                          heightPct = ((numVal - minVal) / (maxVal - minVal)) * 100;
                        }
                        
                        const opacity = 0.3 + (0.7 * (heightPct/100));
                        
                        return (
                          <div 
                            key={date}
                            title={`${date}: ${val}`}
                            style={{
                              flex: 1,
                              height: `${Math.max(5, heightPct)}%`,
                              background: 'var(--accent-color)',
                              border: dates.length > 90 ? 'none' : '1px solid var(--accent-color)',
                              borderBottom: 'none',
                              opacity: opacity
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* X-Axis Labeling */}
                    {size === 'large' && (
                      <div style={{ 
                        display: 'flex', 
                        gap: dates.length > 60 ? '0px' : (dates.length > 30 ? '1px' : '3px'), 
                        paddingLeft: '4px',
                        paddingTop: '2px',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                      }}>
                        {dates.map((date, idx) => {
                          const label = getXLabel(date, idx);
                          return (
                            <div 
                              key={idx} 
                              style={{ 
                                flex: 1, 
                                textAlign: dates.length > 30 ? 'left' : 'center', 
                                fontSize: '7px', 
                                color: 'var(--text-color)',
                                whiteSpace: 'nowrap',
                                overflow: 'visible',
                                letterSpacing: '-0.5px',
                                minWidth: 0
                              }}
                            >
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {trackers.length === 0 && (
            <div style={{ color: 'var(--accent-color)', textAlign: 'center', fontSize: '0.9rem' }}>no trackers configured.</div>
          )}
        </div>
      </div>
    </div>
  );
}
