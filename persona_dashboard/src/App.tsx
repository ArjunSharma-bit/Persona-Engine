import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ProfileCard } from './ProfileCard';
import { AnalyticsWidget } from './Analytics';
import { DLQMonitor } from './Dlqstats';
import { FeatureFlags } from './FFlags';

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
      maxWidth: '100%',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#111827' }}>Persona Engine <span style={{ color: '#2563eb' }}>Live Dashboard</span></h1>

        {/* Dynamic Status Indicator */}
        <div style={{ fontSize: '14px', color: '#121213', display: 'flex', alignItems: 'center' }}>
          <span style={{
            display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '8px',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 8px #10b981' : 'none'
          }}></span>
          {isConnected ? 'Live Connected' : 'Disconnected'}
        </div>
      </header>

      {/* ... the rest of your components ... */}
      <DLQMonitor />

      <AnalyticsWidget />

      <ProfileCard />

      <FeatureFlags />

      {/* 2. The Live Event Stream */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #6b7280', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Real-Time Event Stream
          <small style={{ fontWeight: 'normal', color: '#6b7280', fontSize: '12px' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </small>
        </h3>

        <div style={{ height: '400px', overflowY: 'auto' }}>
          {events.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>Waiting for events...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ color: '#6b7280', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Type</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>User ID</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Data Payload</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={ev._id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#2563eb' }}>
                      {ev.type}
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>{ev.userId}</td>
                    <td style={{ padding: '12px', color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}>
                      {JSON.stringify(ev.data || {}).slice(0, 50)}...
                    </td>
                    <td style={{ padding: '12px', color: '#9ca3af' }}>
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