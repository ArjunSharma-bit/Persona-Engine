import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function ProfileCard() {
    const [userIdInput, setUserIdInput] = useState('');
    const [trackedUserId, setTrackedUserId] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchProfile = async (uid: string) => {
        if (!uid) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:3000/api/profiles/${uid}`);
            if (!res.ok) throw new Error('Profile not found');
            const data = await res.json();
            setProfile(data);
            setTrackedUserId(uid);
        } catch (err: any) {
            setError(err.message);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    // 2. The WebSocket Listener
    useEffect(() => {
        if (!trackedUserId) return;

        const socket = io('http://localhost:3000');

        socket.on('live_event', (event) => {
            if (event.userId === trackedUserId) {
                setTimeout(() => {
                    fetchProfile(trackedUserId);
                }, 500);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [trackedUserId]); // Re-run this hook if we search for a different user

    return (
        <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#8898a8' }}>User Lookup</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={userIdInput}
                    onChange={e => setUserIdInput(e.target.value)}
                    placeholder="Enter User ID (e.g., u100)"
                    style={styles.input}
                    onKeyDown={(e) => e.key === 'Enter' && fetchProfile(userIdInput)}
                />
                <button onClick={() => fetchProfile(userIdInput)} style={styles.button}>
                    Track User
                </button>
            </div>

            {loading && <p style={{ color: '#6b7280' }}>Loading profile...</p>}
            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            {profile && !loading && (
                <div style={styles.grid}>
                    {/* Churn Risk */}
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>Churn Risk</div>
                        <div style={{
                            ...styles.statValue,
                            color: profile.churnScore > 0.5 ? '#ef4444' : '#10b981'
                        }}>
                            {(profile.churnScore * 100).toFixed(1)}%
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>Total Revenue</div>
                        <div style={styles.statValue}>
                            ${profile.totalRevenue?.toLocaleString() || 0}
                        </div>
                    </div>

                    {/* Segments */}
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>Live Segments</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {profile.segments?.length ? profile.segments.map((seg: string) => (
                                <span key={seg} style={styles.badge}>{seg}</span>
                            )) : <span style={{ color: '#9ca3af', fontSize: '14px' }}>None</span>}
                        </div>
                    </div>
                    {/* Event Count */}
                    <div style={styles.statBox}>
                        <small>Total Events</small>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
                            {profile.totalEvents || 0}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: any = {
    card: { backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)' },
    input: { flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: '#fff', fontSize: '15px', outline: 'none' },
    button: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
    statBox: { backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' as const },
    statLabel: { color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 'bold' },
    statValue: { fontSize: '28px', fontWeight: '900', color: '#fff' },
    badge: { backgroundColor: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(79, 70, 229, 0.5)' }
};