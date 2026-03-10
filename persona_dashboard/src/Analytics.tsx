import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function AnalyticsWidget() {
    const [eventCounts, setEventCounts] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // 1. Fetch live event distribution from MongoDB and Postgres
                const [countRes, catRes] = await Promise.all([fetch('http://localhost:3000/api/analytics/counts'), fetch('http://localhost:3000/api/analytics/sql/categories')])

                const counts = await countRes.json();
                const categories = await catRes.json();

                if (Array.isArray(counts)) setEventCounts(counts);
                if (Array.isArray(categories)) setCategoryStats(categories);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();

        const socket = io('http://localhost:3000');

        socket.on('live_event', (newEvent) => {
            setEventCounts(prevCounts => {
                const existingIndex = prevCounts.findIndex(item => item._id === newEvent.type);

                if (existingIndex >= 0) {
                    // It exists, add 1 to its count
                    const newCounts = [...prevCounts];
                    newCounts[existingIndex].count += 1;
                    return newCounts;
                } else {
                    // It's a brand new event type, add it to the list!
                    return [...prevCounts, { _id: newEvent.type, count: 1 }];
                }
            })
        })

        return () => {
            socket.disconnect();
        }
    }, []);

    if (loading) return <div style={styles.card}>Loading analytics...</div>;

    return (
        <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#8898a8' }}>Platform Analytics</h2>

            <div style={styles.grid}>
                {/* Left Column: Live Event Counts */}
                <div style={styles.section}>
                    <h4 style={styles.heading}>Event Distribution (Live Mongo)</h4>
                    <div style={styles.list}>
                        {eventCounts.map(item => (
                            <div key={item._id} style={styles.row}>
                                <span style={styles.label}>{item._id}</span>
                                <span style={styles.value}>{item.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Postgres Batch Analytics */}
                <div style={styles.section}>
                    <h4 style={styles.heading}>Top Categories (Batch SQL)</h4>
                    <div style={styles.list}>
                        {categoryStats.slice(0, 8).map(item => (
                            <div key={item.category} style={styles.row}>
                                <span style={styles.label}>{item.category}</span>
                                <span style={styles.value}>
                                    {Number(item.views).toLocaleString()} views / {Number(item.purchases).toLocaleString()} buys
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: any = {
    card: { backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    section: { backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', height: '285px' },
    heading: { marginTop: 0, marginBottom: '16px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' },
    list: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px', flex: 1 },
    row: { flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', fontSize: '14px' },
    label: { fontWeight: '600', color: '#e5e7eb' },
    value: { color: '#d1d5db', fontWeight: 'bold', fontSize: '13px' }
};