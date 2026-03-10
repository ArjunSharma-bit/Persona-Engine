import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ProfileCard } from './ProfileCard';
import { AnalyticsWidget } from './Analytics';
import { DLQMonitor } from './Dlqstats';
import { FeatureFlags } from './FFlags';
import PixelBlast from './PixelBlast';
import { LivePulse } from './LivePulse';

function App() {
  const [events, setEvents] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
          setLastUpdated(new Date());
        }
      });

    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      setIsConnected(true);
      console.log("WebSocket Connected!");
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('live_event', (newEvent) => {
      setEvents(prevEvents => [newEvent, ...prevEvents].slice(0, 100));
      setLastUpdated(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      maxWidth: '100%',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e5e7eb'
    }}>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}>
        {/* Only enable this when on charger */}
        {/* <PixelBlast
          color="#6b7280"
          pixelSize={2}
          patternScale={12}
          speed={0.3}
        /> */}
      </div>

      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#d1d5db' }}>
          Persona Engine <span style={{ color: '#8898a8' }}> DashBoard</span>
        </h1>

        {/* Dynamic Status Indicator */}
        <div style={{ fontSize: '14px', color: '#a9a9ad', display: 'flex', alignItems: 'center' }}>
          <span style={{
            display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 8px #10b981' : 'none'
          }}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <DLQMonitor />

      <LivePulse />

      <AnalyticsWidget />

      <ProfileCard />

      <FeatureFlags />

      {/* 2. The Live Event Stream */}
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8898a8' }}>
          Real-Time Event Stream
          <small style={{ fontWeight: 'normal', color: '#9ca3af', fontSize: '12px' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </small>
        </h3>

        <div style={{ height: '400px', overflowY: 'auto' }}>
          {events.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>Waiting for events...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ color: '#9ca3af', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Type</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>User ID</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Data Payload</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={ev._id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#9ca3af' }}>{ev.type}</td>
                    <td style={{ padding: '12px', color: '#e5e7eb' }}>{ev.userId}</td>
                    <td style={{ padding: '12px', color: '#9ca3af', fontFamily: 'monospace', fontSize: '12px' }}>
                      {JSON.stringify(ev.data || {}).slice(0, 50)}...
                    </td>
                    <td style={{ padding: '12px', color: '#d1d5db' }}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;