import { useState, useEffect } from 'react';

export function AnalyticsWidget() {
    const [eventCounts, setEventCounts] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // 1. Fetch live event distribution from MongoDB
                const countRes = await fetch('http://localhost:3000/api/analytics/counts');
                const counts = await countRes.json();

                // 2. Fetch aggregated category stats from PostgreSQL
                const catRes = await fetch('http://localhost:3000/api/analytics/sql/categories');
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

        // Refresh the analytics every 5 seconds
        const interval = setInterval(fetchAnalytics, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div style={styles.card}>Loading analytics...</div>;

    return (
        <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Platform Analytics</h2>

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
                        {categoryStats.slice(0, 5).map(item => (
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
    card: { border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '24px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    section: { backgroundColor: '#f9fafb', padding: '8px', borderRadius: '8px', border: '1px solid #f3f4f6', height: '260px' },
    heading: { marginTop: 0, marginBottom: '16px', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' },
    list: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', paddingRight: '4px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
    label: { fontWeight: '600', color: '#374151' },
    value: { color: '#2563eb', fontWeight: 'bold', fontSize: '13px' }
};