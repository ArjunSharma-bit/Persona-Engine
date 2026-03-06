// src/ProfileCard.tsx
import { useState, useEffect } from 'react';

export function ProfileCard() {
    const [searchInput, setSearchInput] = useState('');
    const [activeUserId, setActiveUserId] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!searchInput) return;
        setActiveUserId(searchInput);
        setLoading(true);
        setError('');

        await fetchProfile(searchInput, true);
        setLoading(false);
    };

    const fetchProfile = async (uid: string, isManual: boolean) => {
        try {
            const res = await fetch(`http://localhost:3000/api/profiles/${uid}`);
            if (!res.ok) throw new Error('User not found');
            const data = await res.json();
            setProfile(data);
            if (isManual) setError(''); // Clear error on success
        } catch (err: any) {
            if (isManual) {
                setError(err.message);
                setProfile(null);
            }
        }
    };

    useEffect(() => {
        if (!activeUserId) return;

        const interval = setInterval(() => {
            fetchProfile(activeUserId, false);
        }, 2000); // Refresh every 2 seconds

        return () => clearInterval(interval);
    }, [activeUserId]);

    return (
        <div style={styles.card}>
            <h2>User Lookup</h2>
            <div style={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Enter User ID (e.g. u123)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleSearch} style={styles.button} disabled={loading}>
                    {loading ? 'Searching...' : 'Track User'}
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {profile && (
                <div style={styles.statsGrid}>
                    {/* Churn Score */}
                    <div style={styles.stat}>
                        <small>Churn Risk</small>
                        <div style={{
                            ...styles.bigNumber,
                            color: profile.churnScore > 0.5 ? '#e00' : '#0a0'
                        }}>
                            {(profile.churnScore * 100).toFixed(1)}%
                        </div>
                        <small style={{ color: '#666', fontSize: '10px' }}>
                            (Threshold: 50%)
                        </small>
                    </div>

                    {/* Revenue */}
                    <div style={styles.stat}>
                        <small>Total Revenue</small>
                        <div style={{ ...styles.bigNumber, color: '#333' }}>
                            ${(profile.totalPurchaseAmount || 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Segments */}
                    <div style={styles.stat}>
                        <small>Live Segments</small>
                        <div style={styles.tags}>
                            {profile.segments?.length ? profile.segments.map((seg: string) => (
                                <span key={seg} style={{
                                    ...styles.tag,
                                    backgroundColor: seg === 'at_risk' ? '#ffebeb' : '#eef2ff',
                                    color: seg === 'at_risk' ? '#d32f2f' : '#333'
                                }}>
                                    {seg}
                                </span>
                            )) : <em style={{ color: '#999' }}>--</em>}
                        </div>
                    </div>

                    {/* Activity Counter */}
                    <div style={styles.stat}>
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
    card: { border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    searchBox: { display: 'flex', gap: '12px', marginBottom: '24px' },
    input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' },
    button: { padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' },
    stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', gap: '12px' },
    bigNumber: { fontSize: '32px', fontWeight: '800', margin: ' 0' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' },
    tag: { padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(0,0,0,0.05)' }
};