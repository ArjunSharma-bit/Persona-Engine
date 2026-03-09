import { useEffect, useState } from "react";

export function FeatureFlags() {
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFlags = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/flags")
            const data = await res.json()
            if (Array.isArray(data)) setFlags(data)
        } catch (err) {
            console.error("Failed to fetch Flags", err)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchFlags();
    }, []);

    const toggleFlag = async (name: string, currentStatus: boolean) => {
        try {
            setFlags(flags.map(f => f.name === name ? { ...f, enabled: !currentStatus } : f))

            await fetch(`http://localhost:3000/api/flags/${name}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !currentStatus })
            });
            fetchFlags();
        } catch (err) {
            console.error("Failed to Toggle Flag", err)
            fetchFlags();
        }
    }
    if (loading) return <div style={styles.card}>Loading flags...</div>;

    return (
        <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#8898a8' }}>Feature Flags</h2>

            {flags.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No feature flags created yet.</p>
            ) : (
                <div style={styles.list}>
                    {flags.map(flag => (
                        <div key={flag.name} style={styles.row}>
                            <div>
                                <strong style={{ color: '#374151' }}>{flag.name}</strong>
                                {flag.conditions?.segments && (
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                        Targeting: {flag.conditions.segments.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* The Toggle Switch */}
                            <button
                                onClick={() => toggleFlag(flag.name, flag.enabled)}
                                style={{
                                    ...styles.toggleBtn,
                                    backgroundColor: flag.enabled ? '#4f46e5' : '#f3f4f6',
                                    color: flag.enabled ? 'white' : '#9ca3af',
                                    borderColor: flag.enabled ? '#4f46e5' : '#d1d5db'
                                }}
                            >
                                {flag.enabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles: any = {
    card: { backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)', height: '100%' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' },
    toggleBtn: { padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', width: '70px', border: '1px solid' }
};