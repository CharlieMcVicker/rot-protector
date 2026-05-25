import { Settings, Play, BarChart3 } from 'lucide-react';

export default function MockupLayout({ styles }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Life Tools</h1>
        
        <div className={styles.grid}>
          {/* Wheel Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Activity Wheel</h2>
              <Settings size={20} className={styles.icon} />
            </div>
            
            <div className={styles.wheelContainer}>
               <div className={styles.wheel3d}>
                 <div className={styles.wheelItem}>Read a Book</div>
                 <div className={`${styles.wheelItem} ${styles.active}`}>Go for a Walk</div>
                 <div className={styles.wheelItem}>Work on Project</div>
               </div>
               <div className={styles.wheelSelector}></div>
            </div>
            
            <button className={styles.spinButton}>
              <Play fill="currentColor" size={20} className={styles.icon} /> Spin the Wheel
            </button>
          </div>

          {/* Tracker Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Daily Tracker</h2>
              <BarChart3 size={20} className={styles.icon} />
            </div>

            <div className={styles.trackerFilters}>
              <button className={styles.filterBtn}>Last 30 Days</button>
              <button className={`${styles.filterBtn} ${styles.activeFilter}`}>3 Months</button>
              <button className={styles.filterBtn}>1 Year</button>
            </div>
            
            <div className={styles.chartsContainer}>
              {/* Chart 1: Integer Range */}
              <div className={styles.chartWrapper}>
                 <h3>Sleep (0-8 hrs)</h3>
                 <div className={styles.barChart}>
                    {[4, 5, 6, 8, 7, 5, 6, 8].map((val, i) => (
                      <div key={i} className={styles.bar} style={{ height: `${(val / 8) * 100}%`, opacity: 0.5 + (val/16) }}>
                        <span className={styles.barTooltip}>{val}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Chart 2: Enum */}
              <div className={styles.chartWrapper}>
                 <h3>Mood (Enum)</h3>
                 <div className={styles.barChart}>
                    {[1, 2, 3, 2, 1, 4, 3, 2].map((val, i) => (
                      <div key={i} className={styles.barMood} style={{ height: `${(val / 4) * 100}%` }}></div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Daily Entry Mockup */}
            <div className={styles.entrySection}>
              <h3>Today's Entry</h3>
              <div className={styles.entryItem}>
                <label>Energy Level (0-5)</label>
                <div className={styles.enumBox}>
                  {[0,1,2,3,4,5].map(n => (
                    <button key={n} className={`${styles.enumBtn} ${n === 3 ? styles.enumActive : ''}`}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
