import { useState, useEffect } from 'react';

const DEFAULT_THEME = {
  primary: '#ff4081',
  secondary: '#f48fb1',
  tertiary: '#fce4ec',
  accent: '#c51162',
  text: '#4a148c',
  bgStyle: 'dots', // 'dots' or 'solid'
  bgImageUrl: ''
};

const DEFAULT_DATA = {
  theme: DEFAULT_THEME,
  wheels: [],
  trackers: [
    { id: 't_sleep', name: 'Hours Slept', type: 'range', min: 0, max: 20, step: 0.5 },
    { id: 't_dep', name: 'Most extreme depressed mood', type: 'enum', options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { id: 't_elev', name: 'Most extreme elevated mood', type: 'enum', options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { id: 't_irr', name: 'Most extreme irritability', type: 'enum', options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { id: 't_anx', name: 'Most extreme anxiety', type: 'enum', options: ['None', 'Mild', 'Moderate', 'Severe'] },
    { id: 't_psy', name: 'Psychotic symptoms today', type: 'enum', options: ['No', 'Yes'] },
    { id: 't_ther', name: 'Talk Therapy today', type: 'enum', options: ['No', 'Yes'] }
  ],
  entries: {} // e.g. { '2026-05-24': { t_sleep: 7, t_dep: 'None' } }
};

export function useAppData() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('life_tools_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure theme exists in legacy data
        if (!parsed.theme) parsed.theme = DEFAULT_THEME;
        return parsed;
      } catch (e) {
        console.error('Parse error', e);
      }
    }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem('life_tools_data', JSON.stringify(data));
  }, [data]);

  const updateWheels = (wheels) => setData(prev => ({ ...prev, wheels }));
  const updateTrackers = (trackers) => setData(prev => ({ ...prev, trackers }));
  const updateTheme = (theme) => setData(prev => ({ ...prev, theme }));
  
  const updateEntry = (dateString, trackerId, value) => {
    setData(prev => {
      const currentDay = prev.entries[dateString] || {};
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [dateString]: {
            ...currentDay,
            [trackerId]: value
          }
        }
      };
    });
  };

  const overwriteData = (newData) => {
    if (!newData.theme) newData.theme = DEFAULT_THEME;
    setData(newData);
  };

  return { data, updateWheels, updateTrackers, updateTheme, updateEntry, overwriteData, DEFAULT_THEME };
}
